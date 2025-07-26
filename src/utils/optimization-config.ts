/**
 * RPC Optimization Configuration
 * Clean configuration focused on essential optimizations
 */

export interface OptimizationConfig {
  // Essential features
  enableBatchQueries: boolean;
  enableBlockhashReuse: boolean;
  enableMetadataCaching: boolean;
  
  // Cache TTL settings (milliseconds)
  blockhashCacheTtl: number;
  metadataCacheTtl: number;
  
  // Safety settings
  enableLogging: boolean;
  maxRetries: number;
}

export class OptimizationManager {
  private config: OptimizationConfig;

  constructor() {
    this.config = this.getDefaultConfig();
  }

  private getDefaultConfig(): OptimizationConfig {
    return {
      enableBatchQueries: true,
      enableBlockhashReuse: true,
      enableMetadataCaching: true,
      
      blockhashCacheTtl: 30000,
      metadataCacheTtl: 30000,
      
      enableLogging: process.env.NODE_ENV === 'development',
      maxRetries: 3
    };
  }

  getConfig(): OptimizationConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<OptimizationConfig>) {
    this.config = { ...this.config, ...updates };
  }

  shouldUseOptimization(feature: keyof OptimizationConfig): boolean {
    return this.config[feature] as boolean;
  }
}

// Global optimization manager instance
export const optimizationManager = new OptimizationManager();