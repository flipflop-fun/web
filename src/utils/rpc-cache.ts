import { Connection, PublicKey, AccountInfo } from '@solana/web3.js';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  slot?: number;
}

interface RPCCacheConfig {
  accountCacheTtl: number;
  balanceCacheTtl: number;
  poolDataCacheTtl: number;
  metadataCacheTtl: number;
  enableCaching: boolean;
}

export class SafeRPCCache {
  private accountCache = new Map<string, CacheEntry<AccountInfo<Buffer> | null>>();
  private balanceCache = new Map<string, CacheEntry<number>>();
  private tokenBalanceCache = new Map<string, CacheEntry<number | null>>();
  private poolDataCache = new Map<string, CacheEntry<any>>();
  private metadataCache = new Map<string, CacheEntry<any>>();
  private config: RPCCacheConfig;

  constructor(config: Partial<RPCCacheConfig> = {}) {
    this.config = {
      accountCacheTtl: 50,   // 0.05 second for real-time account state
      balanceCacheTtl: 100,  // 0.1 second for balance updates
      poolDataCacheTtl: 5000, // 5 seconds
      metadataCacheTtl: 30000, // 30 seconds
      enableCaching: true,
      ...config
    };
  }

  /**
   * Safely get account info with caching and fallback
   */
  async getAccountInfo(
    connection: Connection, 
    publicKey: PublicKey, 
    maxAge?: number
  ): Promise<AccountInfo<Buffer> | null> {
    if (!this.config.enableCaching) {
      return await connection.getAccountInfo(publicKey);
    }

    const key = publicKey.toString();
    const cached = this.accountCache.get(key);
    const ttl = maxAge || this.config.accountCacheTtl;

    if (cached && Date.now() - cached.timestamp < ttl) {
      console.debug(`[RPC Cache] Cache hit for account ${key}`);
      return cached.data;
    }

    try {
      const account = await connection.getAccountInfo(publicKey);
      this.accountCache.set(key, { data: account, timestamp: Date.now() });
      console.debug(`[RPC Cache] Cache miss for account ${key}, fetched from RPC`);
      return account;
    } catch (error) {
      console.error(`[RPC Cache] Error fetching account ${key}:`, error);
      // Return cached data if available and not too old (extended TTL)
      if (cached && Date.now() - cached.timestamp < ttl * 3) {
        console.warn(`[RPC Cache] Returning stale data for ${key} due to error`);
        return cached.data;
      }
      throw error;
    }
  }

  /**
   * Batch get multiple accounts safely
   */
  async getMultipleAccountsInfo(
    connection: Connection,
    publicKeys: PublicKey[]
  ): Promise<(AccountInfo<Buffer> | null)[]> {
    if (!this.config.enableCaching || publicKeys.length === 0) {
      return await connection.getMultipleAccountsInfo(publicKeys);
    }

    const keys = publicKeys.map(pk => pk.toString());
    const now = Date.now();
    
    // Check cache for each account
    const cachedResults = keys.map(key => this.accountCache.get(key));
    const needsRefresh = cachedResults.map((cached, i) => 
      !cached || now - cached.timestamp >= this.config.accountCacheTtl
    );

    // If all cached, return cached results
    if (!needsRefresh.some(need => need)) {
      console.debug(`[RPC Cache] All ${keys.length} accounts cached`);
      return cachedResults.map(cached => cached!.data);
    }

    // Fetch missing accounts
    const keysToRefresh = keys.filter((_, i) => needsRefresh[i]);
    const pubkeysToRefresh = publicKeys.filter((_, i) => needsRefresh[i]);
    
    try {
      const freshAccounts = await connection.getMultipleAccountsInfo(pubkeysToRefresh);
      
      // Update cache
      freshAccounts.forEach((account, i) => {
        const key = keysToRefresh[i];
        this.accountCache.set(key, { data: account, timestamp: now });
      });

      // Combine cached and fresh results
      return keys.map((key, i) => {
        if (needsRefresh[i]) {
          const refreshIndex = keysToRefresh.indexOf(key);
          return freshAccounts[refreshIndex];
        }
        return cachedResults[i]!.data;
      });
    } catch (error) {
      console.error('[RPC Cache] Error in batch fetch:', error);
      // Fallback to individual fetches
      return await Promise.all(publicKeys.map(pk => 
        this.getAccountInfo(connection, pk)
      ));
    }
  }

  /**
   * Get token balance with caching
   */
  async getTokenBalance(
    connection: Connection,
    ata: PublicKey
  ): Promise<number | null> {
    if (!this.config.enableCaching) {
      const result = await connection.getTokenAccountBalance(ata);
      return result.value.uiAmount;
    }

    const key = ata.toString();
    const cached = this.tokenBalanceCache.get(key);
    
    if (cached && Date.now() - cached.timestamp < this.config.balanceCacheTtl) {
      return cached.data;
    }

    try {
      const result = await connection.getTokenAccountBalance(ata);
      const balance = result.value.uiAmount;
      this.tokenBalanceCache.set(key, { data: balance, timestamp: Date.now() });
      return balance;
    } catch (error) {
      console.error(`[RPC Cache] Error fetching token balance ${key}:`, error);
      // Return 0 for non-existent accounts instead of null
      if (error instanceof Error && error.toString().includes('Invalid param: could not find account')) {
        this.tokenBalanceCache.set(key, { data: 0, timestamp: Date.now() });
        return 0;
      }
      throw error;
    }
  }

  /**
   * Clear specific cache entries
   */
  clearAccountCache(publicKey?: PublicKey) {
    if (publicKey) {
      this.accountCache.delete(publicKey.toString());
    } else {
      this.accountCache.clear();
    }
  }

  clearBalanceCache(ata?: PublicKey) {
    if (ata) {
      this.tokenBalanceCache.delete(ata.toString());
    } else {
      this.tokenBalanceCache.clear();
    }
  }

  clearAll() {
    this.accountCache.clear();
    this.balanceCache.clear();
    this.tokenBalanceCache.clear();
    this.poolDataCache.clear();
    this.metadataCache.clear();
  }

  /**
   * Clear cache for specific transaction-related accounts
   */
  clearTransactionCache(accounts: PublicKey[]) {
    accounts.forEach(account => {
      this.accountCache.delete(account.toString());
      this.tokenBalanceCache.delete(account.toString());
    });
  }

  /**
   * Toggle caching on/off for debugging
   */
  setCachingEnabled(enabled: boolean) {
    this.config.enableCaching = enabled;
    if (!enabled) {
      this.clearAll();
    }
  }

  /**
   * Get cache statistics for monitoring
   */
  getStats() {
    return {
      accountCacheSize: this.accountCache.size,
      balanceCacheSize: this.balanceCache.size,
      tokenBalanceCacheSize: this.tokenBalanceCache.size,
      poolDataCacheSize: this.poolDataCache.size,
      metadataCacheSize: this.metadataCache.size,
      cachingEnabled: this.config.enableCaching
    };
  }
}

// Global cache instance with optimized defaults
export const rpcCache = new SafeRPCCache({
  accountCacheTtl: 30000,
  balanceCacheTtl: 10000,
  poolDataCacheTtl: 10000,
  metadataCacheTtl: 60000,
  enableCaching: true
});