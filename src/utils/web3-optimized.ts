import { 
  AddressLookupTableAccount,
  BlockhashWithExpiryBlockHeight,
  ComputeBudgetProgram,
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js';
import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
import { 
  CONFIG_DATA_SEED, 
  MINT_SEED, 
  SYSTEM_CONFIG_SEEDS, 
  REFERRAL_SEED, 
  REFUND_SEEDS, 
  REFERRAL_CODE_SEED, 
  CODE_ACCOUNT_SEEDS, 
  NETWORK_CONFIGS 
} from '../config/constants';
import { InitializeTokenConfig, InitiazlizedTokenData, MetadataAccouontData, RemainingAccount, ResponseData, TokenMetadata, TokenMetadataIPFS } from '../types/types';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { FairMintToken } from '../types/fair_mint_token';
import axios from 'axios';
import { 
  ASSOCIATED_TOKEN_PROGRAM_ID, 
  getAssociatedTokenAddress, 
  NATIVE_MINT, 
  TOKEN_PROGRAM_ID, 
  createAssociatedTokenAccountInstruction, 
  getAssociatedTokenAddressSync 
} from '@solana/spl-token';
import { fetchMetadataFromUrlOrCache } from './db';
import { BN_LAMPORTS_PER_SOL, getFeeValue, numberStringToBN } from './format';
import { 
  calculateDepositAmounts, 
  calculateWithdrawAmounts, 
  getPoolData, 
  poolBurnLpTokensInstructions, 
  poolDepositInstructions, 
  poolSwapBaseInInstructions, 
  poolSwapBaseOutInstructions, 
  poolWithdrawInstructions 
} from './raydium_cpmm/instruction';
import { getAuthAddress, getOrcleAccountAddress, getPoolAddress, getPoolLpMintAddress, getPoolVaultAddress } from './raydium_cpmm/pda';
import { RENT_PROGRAM_ID, SYSTEM_PROGRAM_ID } from '@raydium-io/raydium-sdk-v2';
import { ASSOCIATED_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";
import jwt from 'jsonwebtoken';
import { rpcCache } from './rpc-cache';
import { fetchMetadata, processTransaction } from './web3';
import { parseAnchorError } from './format';

const network = (process.env.REACT_APP_NETWORK as keyof typeof NETWORK_CONFIGS) || "devnet";
const fairMintTokenIdl = require(`../idl/${network}/fair_mint_token.json`);

// Cache for blockhash reuse
let cachedBlockhash: BlockhashWithExpiryBlockHeight | null = null;
let blockhashTimestamp = 0;

// Safe blockhash getter with reuse
async function getCachedBlockhash(connection: Connection): Promise<BlockhashWithExpiryBlockHeight> {
  const now = Date.now();
  // 减少缓存时间到60秒，避免模拟交易时的区块哈希过期问题
  if (!cachedBlockhash || now - blockhashTimestamp > 60000) { // 60 seconds = 60 slots
    cachedBlockhash = await connection.getLatestBlockhash();
    blockhashTimestamp = now;
    console.debug('[RPC Optimized] New blockhash fetched');
  } else {
    console.debug('[RPC Optimized] Reusing cached blockhash');
  }
  return cachedBlockhash;
}

const getProvider = (wallet: AnchorWallet, connection: Connection) => {
  return new AnchorProvider(
    connection,
    {
      ...wallet,
      signTransaction: wallet.signTransaction.bind(wallet),
      signAllTransactions: wallet.signAllTransactions.bind(wallet),
      publicKey: wallet.publicKey,
    },
    { commitment: 'confirmed' }
  );
}

const getProgram = (wallet: AnchorWallet, connection: Connection) => {
  const provider = getProvider(wallet, connection);
  return new Program(fairMintTokenIdl as FairMintToken, provider);
}

// Optimized account existence checks using batch queries
async function checkAccountExistsBatch(
  connection: Connection,
  publicKeys: PublicKey[]
): Promise<{ [key: string]: boolean }> {
  console.debug('[RPC Optimized] Checking accounts in batch:', publicKeys.length);
  
  try {
    const accounts = await rpcCache.getMultipleAccountsInfo(connection, publicKeys);
    const results: { [key: string]: boolean } = {};
    
    accounts.forEach((account, index) => {
      results[publicKeys[index].toString()] = account !== null;
    });
    
    return results;
  } catch (error) {
    console.error('[RPC Optimized] Batch check failed, falling back to individual checks:', error);
    // Fallback to individual checks
    const results: { [key: string]: boolean } = {};
    const individualChecks = await Promise.allSettled(
      publicKeys.map(pk => rpcCache.getAccountInfo(connection, pk))
    );
    
    individualChecks.forEach((result, index) => {
      results[publicKeys[index].toString()] = 
        result.status === 'fulfilled' && result.value !== null;
    });
    
    return results;
  }
}

// Optimized initializeToken with batch account checking
export const initializeToken = async (
  metadata: TokenMetadata,
  wallet: AnchorWallet,
  connection: Connection,
  config: InitializeTokenConfig
): Promise<ResponseData> => {
  try {
    if (!wallet) {
      return {
        success: false,
        message: 'Please connect wallet (web3.initializeToken)',
      }
    }
    
    const program = getProgram(wallet, connection);
    
    // Pre-calculate all PDAs
    const [mintPda] = PublicKey.findProgramAddressSync(
      [Buffer.from(MINT_SEED), Buffer.from(metadata.name), Buffer.from(metadata.symbol.toLowerCase())],
      program.programId
    );
    
    const [configPda] = PublicKey.findProgramAddressSync(
      [Buffer.from(CONFIG_DATA_SEED), mintPda.toBuffer()],
      program.programId
    );
    
    const [metadataAccountPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('metadata'), NETWORK_CONFIGS[network].tokenMetadataProgramId.toBuffer(), mintPda.toBuffer()],
      NETWORK_CONFIGS[network].tokenMetadataProgramId,
    );
    
    // 对于账户存在性检查，使用实时查询而不是缓存，避免缓存导致的状态不一致
    const accountsToCheck = [mintPda, configPda, metadataAccountPda];
    const accounts = await connection.getMultipleAccountsInfo(accountsToCheck);
    
    if (accounts[0] !== null) {
      return { success: false, message: 'Token already exists' };
    }
    if (accounts[1] !== null) {
      return { success: false, message: 'Config account already exists' };
    }
    if (accounts[2] !== null) {
      return { success: false, message: 'Metadata account already exists' };
    }

    // Continue with original logic...
    const [systemConfigAccountPda] = PublicKey.findProgramAddressSync(
      [Buffer.from(SYSTEM_CONFIG_SEEDS), NETWORK_CONFIGS[network].systemDeployer.toBuffer()],
      program.programId,
    );
    
    const systemConfigData = await program.account.systemConfigData.fetch(systemConfigAccountPda);
    const protocolFeeAccount = systemConfigData.protocolFeeAccount;

    // Pre-calculate all token addresses
    const [wsolVaultAta, tokenVaultAta, mintTokenVaultAta] = await Promise.all([
      getAssociatedTokenAddress(NATIVE_MINT, configPda, true, TOKEN_PROGRAM_ID),
      getAssociatedTokenAddress(mintPda, configPda, true, TOKEN_PROGRAM_ID),
      getAssociatedTokenAddress(mintPda, mintPda, true, TOKEN_PROGRAM_ID)
    ]);

    const contextInitializeTokenAccounts = {
      metadata: metadataAccountPda,
      payer: wallet.publicKey,
      mint: mintPda,
      configAccount: configPda,
      mintTokenVault: mintTokenVaultAta,
      tokenVault: tokenVaultAta,
      wsolMint: NATIVE_MINT,
      wsolVault: wsolVaultAta,
      systemConfigAccount: systemConfigAccountPda,
      protocolFeeAccount: protocolFeeAccount,
      tokenMetadataProgram: NETWORK_CONFIGS[network].tokenMetadataProgramId,
    }

    const instructionInitializeToken = await program.methods
      .initializeToken(metadata, config as any)
      .accounts(contextInitializeTokenAccounts)
      .instruction();

    const tx = new Transaction().add(instructionInitializeToken);
    const result = await processTransaction(tx, connection, wallet, "Create token successfully", { mintAddress: mintPda.toString() });
    
    // 交易完成后立即清除相关缓存，确保状态更新
    if (result.success) {
      const accountsToClear = [mintPda, configPda, metadataAccountPda];
      rpcCache.clearTransactionCache(accountsToClear);
    }
    
    return result;
  } catch (error: any) {
    if (error.message.includes('Transaction simulation failed: This transaction has already been processed')) {
      return {
        success: false,
        message: 'Something went wrong but the token was created successfully',
      }
    }
    throw error;
  }
};

// Optimized balance fetching with caching
export const getTokenBalanceByMintAndOwner = async (
  mint: PublicKey, 
  owner: PublicKey, 
  connection: Connection, 
  allowOwnerOffCurve: boolean = false, 
  programId: PublicKey = TOKEN_PROGRAM_ID
): Promise<number | null> => {
  try {
    const ata = await getAssociatedTokenAddress(mint, owner, allowOwnerOffCurve, programId);
    const balance = await rpcCache.getTokenBalance(connection, ata);
    return balance;
  } catch (error) {
    console.error('Error getting token balance:', error);
    return 0; // Return 0 instead of null for consistency
  }
};

// Optimized batch metadata fetching
export const fetchTokenMetadataMapOptimized = async (
  tokenData: Array<InitiazlizedTokenData>
): Promise<Record<string, InitiazlizedTokenData>> => {
  if (!tokenData?.length) return {};
  
  const updatedMap: Record<string, InitiazlizedTokenData> = {};
  
  try {
    // Batch fetch metadata using Promise.all for parallel processing
    const metadataPromises = tokenData.map(async (token) => {
      try {
        const tokenMetadata = await fetchMetadata(token) as TokenMetadataIPFS;
        return { mint: token.mint, metadata: tokenMetadata };
      } catch (error) {
        console.error(`Error fetching metadata for token ${token.mint}:`, error);
        return { mint: token.mint, metadata: null };
      }
    });
    
    const results = await Promise.allSettled(metadataPromises);
    
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        const { mint, metadata } = result.value;
        const token = tokenData.find(t => t.mint === mint);
        if (token) {
          updatedMap[mint] = metadata ? { ...token, tokenMetadata: metadata } : token;
        }
      }
    });
    
  } catch (error) {
    console.error('Error in batch metadata fetching:', error);
    // Fallback to individual processing
    tokenData.forEach(token => {
      updatedMap[token.mint] = token;
    });
  }
  
  return updatedMap;
};

// Optimized transaction processing with blockhash reuse
const processTransactionOptimized = async (
  tx: Transaction,
  connection: Connection,
  wallet: AnchorWallet,
  successMessage: string,
  extraData: {}
) => {
  try {
    // Use cached blockhash
    const latestBlockhash = await getCachedBlockhash(connection);
    
    // Check for processing transaction
    const processingTx = localStorage.getItem('processing_tx');
    const processingTimestamp = localStorage.getItem('processing_timestamp');
    const now = Date.now();

    if (processingTx && processingTimestamp && (now - parseInt(processingTimestamp)) < 2000) {
      return {
        success: false,
        message: 'Previous transaction is still processing. Please wait.'
      }
    }

    // Set transaction parameters
    tx.recentBlockhash = latestBlockhash.blockhash;
    tx.feePayer = wallet.publicKey;

    // Sign and serialize
    const signedTx = await wallet.signTransaction(tx);
    const serializedTx = signedTx.serialize();

    // Simulate the transaction
    const simulation = await connection.simulateTransaction(signedTx);

    if (simulation.value.err) {
      return {
        success: false,
        message: `Transaction simulation failed: ${parseAnchorError(simulation.value.logs as string[])}`
      };
    }

    // Mark the transaction as processing
    localStorage.setItem('processing_tx', 'true');
    localStorage.setItem('processing_timestamp', now.toString());

    // Send the transaction
    const txHash = await connection.sendRawTransaction(serializedTx, {
      skipPreflight: true 
    });

    // Wait for the transaction confirmation
    const confirmation = await connection.confirmTransaction({
      signature: txHash,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
    }, 'confirmed');

    if (confirmation.value.err) {
      const txDetails = await connection.getTransaction(txHash, {
        commitment: "confirmed",
        maxSupportedTransactionVersion: 0,
      });
      const errorMessage = parseAnchorError(txDetails?.meta?.logMessages || []);
      return {
        success: false,
        message: 'Transaction failed: ' + errorMessage
      }
    }

    return {
      success: true,
      message: successMessage,
      data: {
        tx: txHash,
        ...extraData
      }
    };
  } catch (error: any) {
    if (error.message.includes('Transaction simulation failed: This transaction has already been processed')) {
      return {
        success: false,
        message: 'Something went wrong but you have mint successfully',
      }
    }
    return {
      success: false,
      message: 'Error: ' + error.message,
    };
  } finally {
    localStorage.removeItem('processing_tx');
    localStorage.removeItem('processing_timestamp');
  }
}

// Export the optimized functions with original names for drop-in replacement
export { processTransactionOptimized as processTransaction };

// Re-export all other functions unchanged to maintain compatibility
export * from './web3';

// Add cache control utilities
export const cacheControls = {
  enableCaching: (enabled: boolean) => rpcCache.setCachingEnabled(enabled),
  clearCache: () => rpcCache.clearAll(),
  getCacheStats: () => rpcCache.getStats()
};