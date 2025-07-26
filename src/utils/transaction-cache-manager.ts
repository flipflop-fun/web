import { PublicKey } from '@solana/web3.js';
import { rpcCache } from './rpc-cache';

/**
 * 交易后缓存管理器
 * 确保交易完成后立即清除相关缓存，避免状态不一致
 */
export class TransactionCacheManager {
  /**
   * 清除与代币相关的所有缓存
   */
  static clearTokenCache(mintAddress: PublicKey) {
    const accounts = [
      mintAddress,
      // 这里可以添加更多相关的PDA地址
    ];
    rpcCache.clearTransactionCache(accounts);
  }

  /**
   * 清除与推荐码相关的缓存
   */
  static clearReferralCache(mintAddress: PublicKey, userAddress: PublicKey) {
    const accounts = [
      mintAddress,
      userAddress,
      // 推荐码相关的PDA地址
    ];
    rpcCache.clearTransactionCache(accounts);
  }

  /**
   * 清除所有交易相关缓存
   */
  static clearAllTransactionCache() {
    rpcCache.clearAll();
  }

  /**
   * 延迟清除缓存（用于确保交易确认后状态一致）
   */
  static async clearWithDelay(accounts: PublicKey[], delayMs: number = 500) {
    setTimeout(() => {
      rpcCache.clearTransactionCache(accounts);
    }, delayMs);
  }
}

export default TransactionCacheManager;