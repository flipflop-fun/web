/**
 * Safe Optimization Integration Script
 * Applies RPC optimizations without breaking existing functionality
 */

import { optimizationManager } from './optimization-config';
import { rpcCache } from './rpc-cache';

/**
 * Safely apply optimizations with monitoring
 */
export class SafeOptimizationIntegrator {
  private isApplied = false;
  // private originalWeb3: any = null;

  /**
   * Apply optimizations gradually with safety checks
   */
  async applyOptimizations() {
    if (this.isApplied) {
      console.log('[Optimization] Already applied, skipping');
      return;
    }

    console.log('[Optimization] Starting safe optimization integration...');

    try {
      // Step 1: Enable basic caching (lowest risk)
      console.log('[Optimization] Step 1: Enabling account caching');
      optimizationManager.updateConfig({
        enableAccountCaching: true,
        enableBalanceCaching: true,
        accountCacheTtl: 15000,
        balanceCacheTtl: 5000
      });

      // Step 2: Enable blockhash reuse
      console.log('[Optimization] Step 2: Enabling blockhash reuse');
      optimizationManager.updateConfig({
        enableBlockhashReuse: true
      });

      // Step 3: Enable batch queries
      console.log('[Optimization] Step 3: Enabling batch queries');
      optimizationManager.updateConfig({
        enableBatchQueries: true
      });

      // Step 4: Enable metadata caching
      console.log('[Optimization] Step 4: Enabling metadata caching');
      optimizationManager.updateConfig({
        enableMetadataCaching: true,
        metadataCacheTtl: 30000
      });

      this.isApplied = true;
      console.log('[Optimization] All optimizations applied successfully');
      console.log('[Optimization] Current status:', optimizationManager.getStatus());

    } catch (error) {
      console.error('[Optimization] Failed to apply optimizations:', error);
      this.rollback();
    }
  }

  /**
   * Rollback all optimizations
   */
  rollback() {
    console.log('[Optimization] Rolling back optimizations...');
    optimizationManager.updateConfig({
      enableAccountCaching: false,
      enableBalanceCaching: false,
      enableBlockhashReuse: false,
      enableBatchQueries: false,
      enableMetadataCaching: false
    });
    
    rpcCache.clearAll();
    this.isApplied = false;
    console.log('[Optimization] Optimizations rolled back');
  }

  /**
   * Get current optimization status
   */
  getStatus() {
    return {
      isApplied: this.isApplied,
      ...optimizationManager.getStatus()
    };
  }

  /**
   * Enable/disable specific features
   */
  toggleFeature(feature: string, enabled: boolean) {
    const config: any = {};
    config[feature] = enabled;
    optimizationManager.updateConfig(config);
    
    if (!enabled) {
      rpcCache.clearAll();
    }
    
    console.log(`[Optimization] ${feature} ${enabled ? 'enabled' : 'disabled'}`);
  }
}

// Global integrator instance
export const optimizationIntegrator = new SafeOptimizationIntegrator();

/**
 * Auto-apply optimizations based on environment
 */
export function autoApplyOptimizations() {
  const env = process.env;
  
  // Never auto-apply in development unless explicitly requested
  if (process.env.NODE_ENV === 'development' && env.REACT_APP_AUTO_OPTIMIZE !== 'true') {
    console.log('[Optimization] Development mode: optimizations disabled by default');
    console.log('[Optimization] Set REACT_APP_AUTO_OPTIMIZE=true to enable');
    return;
  }
  
  // Auto-apply in production or when explicitly requested
  if (process.env.NODE_ENV === 'production' || env.REACT_APP_AUTO_OPTIMIZE === 'true') {
    optimizationIntegrator.applyOptimizations();
  }
  
  // Apply conservative preset if requested
  if (env.REACT_APP_OPTIMIZATION_PRESET === 'conservative') {
    optimizationManager.applyPreset('conservative');
    console.log('[Optimization] Applied conservative preset');
  }
  
  // Apply aggressive preset if requested
  if (env.REACT_APP_OPTIMIZATION_PRESET === 'aggressive') {
    optimizationManager.applyPreset('aggressive');
    console.log('[Optimization] Applied aggressive preset');
  }
}

/**
 * Development helpers for testing optimizations
 */
export const optimizationTesting = {
  enableAll: () => optimizationIntegrator.applyOptimizations(),
  disableAll: () => optimizationIntegrator.rollback(),
  toggle: (feature: string) => optimizationIntegrator.toggleFeature(feature, true),
  getStatus: () => optimizationIntegrator.getStatus(),
  
  // Performance testing utilities
  measureRPCCalls: async (fn: () => Promise<any>, label: string) => {
    const start = Date.now();
    const cacheStatsStart = optimizationIntegrator.getStatus();
    
    console.time(label);
    const result = await fn();
    console.timeEnd(label);
    
    const end = Date.now();
    const cacheStatsEnd = optimizationIntegrator.getStatus();
    
    console.log(`[Performance Test] ${label}: ${end - start}ms`);
    return { result, duration: end - start };
  }
};

// Auto-apply on module load (safely)
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoApplyOptimizations);
  } else {
    autoApplyOptimizations();
  }
  
  // Development helpers
  if (process.env.NODE_ENV === 'development') {
    (window as any).optimizationTesting = optimizationTesting;
    (window as any).optimizationManager = optimizationManager;
    
    console.log('🚀 Development optimization helpers available:');
    console.log('window.optimizationTesting.enableAll() - Enable all optimizations');
    console.log('window.optimizationTesting.disableAll() - Disable all optimizations');
    console.log('window.optimizationManager.getStatus() - Get current status');
  }
}

// Export for manual control
export default {
  integrator: optimizationIntegrator,
  manager: optimizationManager,
  testing: optimizationTesting,
  autoApply: autoApplyOptimizations
};