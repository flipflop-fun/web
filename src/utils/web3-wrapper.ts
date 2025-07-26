/**
 * Clean RPC Optimization Wrapper
 * Provides optimized functions with minimal complexity
 */

import { Connection, PublicKey, AccountInfo } from '@solana/web3.js';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { TokenMetadata, InitiazlizedTokenData, ResponseData } from '../types/types';
import { InitializeTokenConfig } from '../types/types';
import { rpcCache } from './rpc-cache';
import { optimizationManager } from './optimization-config';

// Import all original functions
import * as originalWeb3 from './web3';

// Re-export everything from original to maintain compatibility
export * from './web3';

/**
 * Safe wrapper for account info with batching support
 */
export const getAccountInfo = async (
  connection: Connection,
  publicKey: PublicKey
): Promise<AccountInfo<Buffer> | null> => {
  return await rpcCache.getAccountInfo(connection, publicKey);
};

/**
 * Safe wrapper for batch account existence checks
 */
export const checkAccountsExist = async (
  connection: Connection,
  publicKeys: PublicKey[]
): Promise<{ [key: string]: boolean }> => {
  const useOptimized = optimizationManager.shouldUseOptimization('enableBatchQueries');
  
  if (useOptimized && publicKeys.length > 1) {
    try {
      const accounts = await rpcCache.getMultipleAccountsInfo(connection, publicKeys);
      const results: { [key: string]: boolean } = {};
      accounts.forEach((account, index) => {
        results[publicKeys[index].toString()] = account !== null;
      });
      return results;
    } catch (error) {
      console.warn('Batch query failed, falling back to individual checks:', error);
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
  
  const useOptimized = optimizationManager.shouldUseOptimization('enableMetadataCaching');
  
  // 移除了优化版本引用，直接使用原始实现
  
  return await originalWeb3.fetchTokenMetadataMap(tokenData);
};