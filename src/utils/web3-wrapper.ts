/**
 * Safe RPC Optimization Wrapper
 * Provides optimized functions while maintaining 100% backwards compatibility
 */

import { Connection, PublicKey, AccountInfo } from '@solana/web3.js';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { TokenMetadata, InitiazlizedTokenData, ResponseData } from '../types/types';
import { InitializeTokenConfig } from '../types/types';
import { rpcCache } from './rpc-cache';
import { optimizationManager } from './optimization-config';

// Import all original functions
import * as originalWeb3 from './web3';
import * as web3Functions from './web3';

// Re-export everything from original to maintain compatibility
export * from './web3';

// Environment-based feature flags - 默认禁用所有优化以确保稳定性
const FEATURE_FLAGS = {
  USE_OPTIMIZED_INITIALIZE: process.env.REACT_APP_USE_OPTIMIZED_INITIALIZE === 'true',
  USE_OPTIMIZED_BALANCE: process.env.REACT_APP_USE_OPTIMIZED_BALANCE === 'true',
  USE_OPTIMIZED_METADATA: process.env.REACT_APP_USE_OPTIMIZED_METADATA === 'true',
  USE_BATCH_QUERIES: process.env.REACT_APP_USE_BATCH_QUERIES === 'true',
  USE_BLOCKHASH_CACHE: process.env.REACT_APP_USE_BLOCKHASH_CACHE === 'true'
};

// 强制禁用可能导致问题的优化
if (process.env.NODE_ENV !== 'development' || process.env.REACT_APP_ENABLE_AGGRESSIVE_OPTIMIZATION !== 'true') {
  // 生产环境下默认禁用所有可能影响交易状态的优化
  FEATURE_FLAGS.USE_OPTIMIZED_INITIALIZE = false;
  FEATURE_FLAGS.USE_OPTIMIZED_BALANCE = false;
  FEATURE_FLAGS.USE_OPTIMIZED_METADATA = false;
}

/**
 * Safe wrapper for initializeToken with optimizations
 */
export const initializeToken = async (
  metadata: TokenMetadata,
  wallet: AnchorWallet,
  connection: Connection,
  config: InitializeTokenConfig
): Promise<ResponseData> => {
  // 强制禁用账户缓存优化，避免状态不一致问题
  console.debug('[Web3 Wrapper] Using original initializeToken (account caching disabled for reliability)');
  return await originalWeb3.initializeToken(metadata, wallet, connection, config);
};

/**
 * Safe wrapper for getTokenBalanceByMintAndOwner with caching
 */
export const getTokenBalanceByMintAndOwner = async (
  mint: PublicKey, 
  owner: PublicKey, 
  connection: Connection, 
  allowOwnerOffCurve: boolean = false, 
  programId?: PublicKey
): Promise<number | null> => {
  const useOptimized = FEATURE_FLAGS.USE_OPTIMIZED_BALANCE && optimizationManager.shouldUseOptimization('enableBalanceCaching');
  
  if (useOptimized) {
    try {
      const balance = await rpcCache.getTokenBalance(connection, 
        await (await import('@solana/spl-token')).getAssociatedTokenAddress(mint, owner, allowOwnerOffCurve, programId)
      );
      return balance;
    } catch (error) {
      console.warn('[Web3 Wrapper] Optimized balance check failed, falling back:', error);
      optimizationManager.recordError(error as Error);
    }
  }
  
  return await originalWeb3.getTokenBalanceByMintAndOwner(mint, owner, connection, allowOwnerOffCurve, programId);
};

/**
 * Safe wrapper for account info with batching support
 */
export const getAccountInfo = async (
  connection: Connection,
  publicKey: PublicKey
): Promise<AccountInfo<Buffer> | null> => {
  const useOptimized = optimizationManager.shouldUseOptimization('enableAccountCaching');
  
  if (useOptimized) {
    return await rpcCache.getAccountInfo(connection, publicKey);
  }
  
  return await connection.getAccountInfo(publicKey);
};

/**
 * Safe wrapper for batch account existence checks
 */
export const checkAccountsExist = async (
  connection: Connection,
  publicKeys: PublicKey[]
): Promise<{ [key: string]: boolean }> => {
  const useOptimized = FEATURE_FLAGS.USE_BATCH_QUERIES && optimizationManager.shouldUseOptimization('enableBatchQueries');
  
  if (useOptimized && publicKeys.length > 1) {
    try {
      const accounts = await rpcCache.getMultipleAccountsInfo(connection, publicKeys);
      const results: { [key: string]: boolean } = {};
      accounts.forEach((account, index) => {
        results[publicKeys[index].toString()] = account !== null;
      });
      return results;
    } catch (error) {
      console.warn('[Web3 Wrapper] Batch query failed, falling back to individual checks:', error);
      optimizationManager.recordError(error as Error);
    }
  }
  
  // Fallback to individual checks
  const results: { [key: string]: boolean } = {};
  const promises = publicKeys.map(async (pk) => {
    const account = await getAccountInfo(connection, pk);
    results[pk.toString()] = account !== null;
  });
  
  await Promise.all(promises);
  return results;
};

/**
 * Safe wrapper for metadata fetching
 */
export const fetchTokenMetadataMap = async (
  tokenData: Array<InitiazlizedTokenData>
): Promise<Record<string, InitiazlizedTokenData>> => {
  if (!tokenData?.length) return {};
  
  const useOptimized = FEATURE_FLAGS.USE_OPTIMIZED_METADATA && optimizationManager.shouldUseOptimization('enableMetadataCaching');
  
  if (useOptimized) {
    try {
      const { fetchTokenMetadataMapOptimized } = await import('./web3-optimized');
      return await fetchTokenMetadataMapOptimized(tokenData);
    } catch (error) {
      console.warn('[Web3 Wrapper] Optimized metadata fetching failed, falling back:', error);
      optimizationManager.recordError(error as Error);
    }
  }
  
  return await originalWeb3.fetchTokenMetadataMap(tokenData);
};

/**
 * Development utilities for testing optimizations
 */
export const optimizationDev = {
  // Quick toggle for all optimizations
  enableOptimizations: () => {
    Object.keys(FEATURE_FLAGS).forEach(key => {
      (FEATURE_FLAGS as any)[key] = true;
    });
    optimizationManager.enableAll();
  },
  
  disableOptimizations: () => {
    Object.keys(FEATURE_FLAGS).forEach(key => {
      (FEATURE_FLAGS as any)[key] = false;
    });
    optimizationManager.enableAll();
  },
  
  // Selective feature control
  toggleFeature: (feature: keyof typeof FEATURE_FLAGS) => {
    (FEATURE_FLAGS as any)[feature] = !(FEATURE_FLAGS as any)[feature];
    return (FEATURE_FLAGS as any)[feature];
  },
  
  getCurrentFlags: () => ({ ...FEATURE_FLAGS }),
  
  getOptimizationStatus: () => optimizationManager.getStatus()
};

/**
 * Migration helper to switch between original and optimized implementations
 */
export const migrationHelper = {
  // Gradual migration by function
  migrateInitializeToken: (enabled: boolean = true) => {
    (FEATURE_FLAGS as any).USE_OPTIMIZED_INITIALIZE = enabled;
  },
  
  migrateBalanceChecks: (enabled: boolean = true) => {
    (FEATURE_FLAGS as any).USE_OPTIMIZED_BALANCE = enabled;
  },
  
  migrateMetadataFetching: (enabled: boolean = true) => {
    (FEATURE_FLAGS as any).USE_OPTIMIZED_METADATA = enabled;
  },
  
  migrateBatchQueries: (enabled: boolean = true) => {
    (FEATURE_FLAGS as any).USE_BATCH_QUERIES = enabled;
  },
  
  migrateBlockhashCaching: (enabled: boolean = true) => {
    (FEATURE_FLAGS as any).USE_BLOCKHASH_CACHE = enabled;
  },
  
  // Full migration
  migrateAll: (enabled: boolean = true) => {
    Object.keys(FEATURE_FLAGS).forEach(key => {
      (FEATURE_FLAGS as any)[key] = enabled;
    });
  }
};

// Environment-based auto-enable for production
if (process.env.NODE_ENV === 'production') {
  // Enable all optimizations in production by default
  migrationHelper.migrateAll(true);
}

// Export everything for backwards compatibility
// This ensures all original exports are still available
export default {
  ...originalWeb3,
  initializeToken,
  getTokenBalanceByMintAndOwner,
  fetchTokenMetadataMap,
  optimizationDev,
  migrationHelper
};