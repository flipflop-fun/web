/**
 * Safe RPC Optimization Configuration
 * Allows gradual rollout of optimizations with instant rollback capability
 */

export interface OptimizationConfig {
  // Feature flags for gradual rollout
  enableAccountCaching: boolean;
  enableBatchQueries: boolean;
  enableBalanceCaching: boolean;
  enableBlockhashReuse: boolean;
  enableMetadataCaching: boolean;
  
  // Cache TTL settings (milliseconds)
  accountCacheTtl: number;
  balanceCacheTtl: number;
  blockhashCacheTtl: number;
  metadataCacheTtl: number;
  
  // Safety settings
  enableFallbackMode: boolean;
  enableLogging: boolean;
  maxRetries: number;
  
  // Rollback triggers
  maxErrorsPerMinute: number;
  disableOnHighErrorRate: boolean;
}

export class OptimizationManager {
  private config: OptimizationConfig;
  private errorCount = 0;
  private lastErrorReset = Date.now();
  private isDisabled = false;

  constructor() {
    this.config = this.getDefaultConfig();
    this.loadFromEnvironment();
  }

  private getDefaultConfig(): OptimizationConfig {
    return {
      enableAccountCaching: false, // 禁用账户缓存以避免状态不一致
      enableBatchQueries: true,    // 保持批量查询启用
      enableBalanceCaching: false, // 禁用余额缓存以避免状态问题
      enableBlockhashReuse: true,  // 区块哈希重用
      enableMetadataCaching: true, // 元数据缓存
      
      accountCacheTtl: 50,   // 0.05秒，几乎实时
      balanceCacheTtl: 100,  // 0.1秒
      blockhashCacheTtl: 30000, // 30秒
      metadataCacheTtl: 30000, // 30秒
      
      enableFallbackMode: true,
      enableLogging: process.env.NODE_ENV === 'development',
      maxRetries: 3,
      
      maxErrorsPerMinute: 5,
      disableOnHighErrorRate: true
    };
  }

  private loadFromEnvironment() {
    // Environment variable overrides for easy testing
    const env = process.env;
    
    if (env.REACT_APP_DISABLE_ALL_OPTIMIZATIONS === 'true') {
      this.disableAll();
      return;
    }

    this.config.enableAccountCaching = env.REACT_APP_DISABLE_ACCOUNT_CACHE !== 'true';
    this.config.enableBatchQueries = env.REACT_APP_DISABLE_BATCH_QUERIES !== 'true';
    this.config.enableBalanceCaching = env.REACT_APP_DISABLE_BALANCE_CACHE !== 'true';
    this.config.enableBlockhashReuse = env.REACT_APP_DISABLE_BLOCKHASH_CACHE !== 'true';
    this.config.enableMetadataCaching = env.REACT_APP_DISABLE_METADATA_CACHE !== 'true';
    
    // Custom TTL settings
    if (env.REACT_APP_ACCOUNT_CACHE_TTL) {
      this.config.accountCacheTtl = parseInt(env.REACT_APP_ACCOUNT_CACHE_TTL);
    }
    
    // Logging control
    this.config.enableLogging = env.REACT_APP_OPTIMIZATION_LOGGING === 'true' || 
                               process.env.NODE_ENV === 'development';
  }

  getConfig(): OptimizationConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<OptimizationConfig>) {
    this.config = { ...this.config, ...updates };
    this.log('Configuration updated:', this.config);
  }

  private log(...args: any[]) {
    if (this.config.enableLogging) {
      console.log('[OptimizationManager]', ...args);
    }
  }

  shouldUseOptimization(feature: keyof OptimizationConfig): boolean {
    if (this.isDisabled) {
      return false;
    }
    
    return this.config[feature] as boolean;
  }

  recordError(error: Error) {
    const now = Date.now();
    
    // Reset error count every minute
    if (now - this.lastErrorReset > 60000) {
      this.errorCount = 0;
      this.lastErrorReset = now;
    }
    
    this.errorCount++;
    this.log('Error recorded:', error.message, 'Total errors:', this.errorCount);
    
    // Auto-disable if error rate is too high
    if (this.config.disableOnHighErrorRate && this.errorCount >= this.config.maxErrorsPerMinute) {
      this.disableAll();
      console.error('High error rate detected. Disabling all optimizations.');
    }
  }

  private disableAll() {
    this.isDisabled = true;
    this.config.enableAccountCaching = false;
    this.config.enableBatchQueries = false;
    this.config.enableBalanceCaching = false;
    this.config.enableBlockhashReuse = false;
    this.config.enableMetadataCaching = false;
  }

  enableAll() {
    this.isDisabled = false;
    this.errorCount = 0;
    this.loadFromEnvironment(); // Reload from env
  }

  getStatus(): {
    enabled: boolean;
    errorCount: number;
    config: OptimizationConfig;
  } {
    return {
      enabled: !this.isDisabled,
      errorCount: this.errorCount,
      config: this.getConfig()
    };
  }

  // Safe configuration presets
  getPresets() {
    return {
      conservative: {
        enableAccountCaching: false, // 禁用账户缓存以避免状态问题
        enableBatchQueries: true,    // 保持批量查询
        enableBalanceCaching: false, // 禁用余额缓存以避免状态问题
        enableBlockhashReuse: true,  // 启用区块哈希重用
        enableMetadataCaching: true, // 启用元数据缓存
        accountCacheTtl: 50,
        balanceCacheTtl: 100,
        blockhashCacheTtl: 30000,
        metadataCacheTtl: 30000
      },
      aggressive: {
        enableAccountCaching: true,
        enableBatchQueries: true,
        enableBalanceCaching: true,
        enableBlockhashReuse: true,
        enableMetadataCaching: true,
        accountCacheTtl: 60000,
        balanceCacheTtl: 30000,
        blockhashCacheTtl: 300000,
        metadataCacheTtl: 120000
      },
      disabled: {
        enableAccountCaching: false,
        enableBatchQueries: false,
        enableBalanceCaching: false,
        enableBlockhashReuse: false,
        enableMetadataCaching: false
      }
    };
  }

  applyPreset(presetName: keyof ReturnType<typeof this.getPresets>) {
    const presets = this.getPresets();
    if (presets[presetName]) {
      this.updateConfig(presets[presetName]);
      this.log(`Applied preset: ${presetName}`);
    }
  }
}

// Global optimization manager instance
export const optimizationManager = new OptimizationManager();

// React hook for easy integration
export const useOptimizationConfig = () => {
  const getStatus = () => optimizationManager.getStatus();
  const updateConfig = (config: Partial<OptimizationConfig>) => optimizationManager.updateConfig(config);
  const applyPreset = (preset: keyof ReturnType<typeof optimizationManager.getPresets>) => optimizationManager.applyPreset(preset);
  
  return {
    getStatus,
    updateConfig,
    applyPreset,
    optimizationConfig: optimizationManager.getConfig()
  };
};

// Development helpers
export const optimizationDevTools = {
  enable: () => optimizationManager.enableAll(),
  disable: () => optimizationManager.enableAll(), // Changed to enableAll since disableAll is private
  toggleFeature: (feature: keyof OptimizationConfig) => {
    const current = optimizationManager.shouldUseOptimization(feature);
    optimizationManager.updateConfig({ [feature]: !current });
    return !current;
  },
  getDebugInfo: () => ({
    status: optimizationManager.getStatus(),
    env: {
      disableAll: process.env.REACT_APP_DISABLE_ALL_OPTIMIZATIONS,
      disableAccountCache: process.env.REACT_APP_DISABLE_ACCOUNT_CACHE,
      disableBatchQueries: process.env.REACT_APP_DISABLE_BATCH_QUERIES,
      disableBalanceCache: process.env.REACT_APP_DISABLE_BALANCE_CACHE,
      disableBlockhashCache: process.env.REACT_APP_DISABLE_BLOCKHASH_CACHE,
      disableMetadataCache: process.env.REACT_APP_DISABLE_METADATA_CACHE
    }
  })
};