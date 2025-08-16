import React from 'react';
import { MetricsProps } from '../../types/types';
import { formatSeconds } from '../../utils/format';
import { useTranslation } from 'react-i18next';

export const Metrics: React.FC<MetricsProps> = ({
  mode,
  targetEras,
  epochesPerEra,
  targetSecondsPerEpoch,
  reduceRatio,
  initialTargetMintSizePerEpoch,
  initialMintSize,
  feeRate,
  liquidityTokensRatio,
  symbol,
}) => {
  const { t } = useTranslation();
  const epochesPerEraNum = parseFloat(epochesPerEra) || 0;
  const liquidityTokensRatioNum = parseFloat(liquidityTokensRatio) || 0;
  const initialTargetMintSizePerEpochNum = parseFloat(initialTargetMintSizePerEpoch) || 0; // only for minter
  const initialTargetMintSizePerEpochWithVaultNum = initialTargetMintSizePerEpochNum / (1 - liquidityTokensRatioNum / 100); // minter and vault
  const reduceRatioNum = parseFloat(reduceRatio) || 0;
  const targetErasNum = parseFloat(targetEras) || 0;
  const targetSecondsPerEpochNum = parseFloat(targetSecondsPerEpoch) || 0;
  const initialMintSizeNum = parseFloat(initialMintSize) || 0;
  const feeRateNum = parseFloat(feeRate) || 0;

  const calculateMetrics = () => {

    // Calculate max supply
    const maxSupply = epochesPerEraNum * initialTargetMintSizePerEpochWithVaultNum / (1 - reduceRatioNum / 100);

    // Calculate estimated days
    const estimatedDays = (targetErasNum * epochesPerEraNum * targetSecondsPerEpochNum) / 86400;

    // Calculate percent to target eras
    const f = reduceRatioNum / 100;
    const percentToTargetEras = 1 - Math.pow(f, targetErasNum);

    const totalsupplyToTargetEras = percentToTargetEras * maxSupply;

    // Calculate min total fee
    const minTotalFee = initialTargetMintSizePerEpochNum * feeRateNum * (targetErasNum * epochesPerEraNum) / initialMintSizeNum;

    // Calculate max total fee
    const maxTotalFee = initialTargetMintSizePerEpochNum * feeRateNum / initialMintSizeNum * 101 * (Math.pow(1.01, targetErasNum * epochesPerEraNum) - 1);

    // Check if fee is too high (e.g., greater than 1000 SOL)
    const isFeeTooHigh = maxTotalFee > 1000;

    // Calculate Initial liquidity to target milestone
    const initialLiquidityToTargetEra = epochesPerEraNum * initialTargetMintSizePerEpochNum * liquidityTokensRatioNum / 100 
      * (1 - Math.pow(reduceRatioNum / 100, targetErasNum)) 
      / ((1 - reduceRatioNum / 100) * (1 - liquidityTokensRatioNum / 100));

    const initialLiquidityToTargetEraPercent = (initialLiquidityToTargetEra / maxSupply) * 100;

    // Calculate min launch price
    const minLaunchPrice = 0.9 * minTotalFee / initialLiquidityToTargetEra;

    // Calculate max launch price
    const maxLaunchPrice = 0.9 * maxTotalFee / initialLiquidityToTargetEra;

    // Check if launch price is too high (e.g., greater than 0.1 SOL/token)
    const isLaunchPriceTooHigh = maxLaunchPrice > 0.1;

    return {
      maxSupply: maxSupply.toLocaleString(undefined, { maximumFractionDigits: 2 }),
      estimatedDays: estimatedDays.toLocaleString(undefined, { maximumFractionDigits: 2 }),
      percentToTargetEras: (percentToTargetEras * 100).toLocaleString(undefined, { maximumFractionDigits: 2 }),
      minTotalFee: minTotalFee.toLocaleString(undefined, { maximumFractionDigits: 4 }),
      maxTotalFee: maxTotalFee.toLocaleString(undefined, { maximumFractionDigits: 4 }),
      isFeeTooHigh,
      initialLiquidityToTargetEra: initialLiquidityToTargetEra.toLocaleString(undefined, { maximumFractionDigits: 4 }),
      totalsupplyToTargetEras: totalsupplyToTargetEras.toLocaleString(undefined, { maximumFractionDigits: 2 }),
      initialLiquidityToTargetEraPercent: (initialLiquidityToTargetEraPercent).toLocaleString(undefined, { maximumFractionDigits: 2 }),
      minLaunchPrice: minLaunchPrice.toLocaleString(undefined, { maximumFractionDigits: 6 }),
      maxLaunchPrice: maxLaunchPrice.toLocaleString(undefined, { maximumFractionDigits: 6 }),
      isLaunchPriceTooHigh,
      mintTimesToTarget: epochesPerEraNum * initialTargetMintSizePerEpochNum / (initialMintSizeNum / 1000000000),
      mintSecondsToTarget: targetSecondsPerEpochNum / (initialTargetMintSizePerEpochNum / (initialMintSizeNum / 1000000000)),
    };
  };

  return (
    <div className="pixel-box space-y-4 w-full lg:w-[480px] p-6 mt-4" style={{}}>
      <div className='text-xl font-bold'>{t('launch.tokenParams')}</div>
      <div>
        <p className="text-sm text-base-content/70 mb-1">{t('tokenInfo.targetMilestone')}</p>
        <p className="font-medium text-base-content">{targetEras}</p>
      </div>
      <div>
        <p className="text-sm text-base-content/70 mb-1">{t('tokenInfo.checkpointsPerMilestone')}</p>
        <p className="font-medium text-base-content">{epochesPerEraNum}</p>
      </div>
      <div>
        <p className="text-sm text-base-content/70 mb-1">{t('tokenInfo.targetMintTime')}</p>
        <p className="font-medium text-base-content">{calculateMetrics().estimatedDays} {t('common.days')}</p>
      </div>
      <div>
        <p className="text-sm text-base-content/70 mb-1">{t('tokenInfo.maxSupply')}</p>
        <p className="font-medium text-base-content">{calculateMetrics().maxSupply} {symbol}</p>
      </div>
      <div>
        <p className="text-sm text-base-content/70 mb-1">{t('tokenInfo.targetSupply')}</p>
        <p className="font-medium text-base-content">{calculateMetrics().totalsupplyToTargetEras} {symbol} ({calculateMetrics().percentToTargetEras}%)</p>
      </div>
      <div>
        <p className="text-sm text-base-content/70 mb-1">{t('tokenInfo.targetMintTimePerCheckpoint')}</p>
        <p className="font-medium text-base-content">{formatSeconds(targetSecondsPerEpochNum)} ({t('mint.average')} {formatSeconds(calculateMetrics().mintSecondsToTarget)})</p>
      </div>
      <div>
        <p className="text-sm text-base-content/70 mb-1">{t('tokenInfo.targetMintFee')}</p>
        <div className="flex items-center gap-2">
          <p className="font-medium text-base-content">{calculateMetrics().minTotalFee} to {calculateMetrics().maxTotalFee} SOL</p>
          {calculateMetrics().isFeeTooHigh && (
            <span className="text-error">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </span>
          )}
        </div>
      </div>
      <div>
        <p className="text-sm text-base-content/70 mb-1">{t('tokenInfo.estimatedIDOPrice')}</p>
        <div className="flex items-center gap-2">
          <p className="font-medium text-base-content">{calculateMetrics().minLaunchPrice} to {calculateMetrics().maxLaunchPrice} SOL/{symbol}</p>
          {calculateMetrics().isLaunchPriceTooHigh && (
            <span className="text-error">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </span>
          )}
        </div>
      </div>
    </div>

  );
};
