import React, { useEffect, useState, useMemo } from 'react';
import { TokenCardWebProps, TokenMetadataIPFS } from '../../types/types';
import { TokenImage } from './TokenImage';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useNavigate } from 'react-router-dom';
import { fetchMetadata } from '../../utils/web3';
import {
  calculateMaxSupply,
} from '../../utils/format';
import { useTranslation } from 'react-i18next';
import { TokenBackgroundImage } from '../common/TokenBackgroundImage';

export const TokenCardWeb: React.FC<TokenCardWebProps> = ({ token }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [metadata, setMetadata] = useState<TokenMetadataIPFS | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleCardClick = () => {
    navigate(`/token/${token.mint}`);
  };

  useEffect(() => {
    setIsLoading(true);
    fetchMetadata(token).then((data) => {
      setMetadata(data);
      setIsLoading(false);
    }).catch((error) => {
      console.error('Error fetching token metadata:', error);
      setIsLoading(false);
    });
  }, [token, token.tokenUri]);

  const totalSupplyToTargetEras = useMemo(() => {
    const percentToTargetEras = 1 - Math.pow(Number(token.reduceRatio) / 100, Number(token.targetEras));
    const maxSupply = calculateMaxSupply(
      token.epochesPerEra,
      token.initialTargetMintSizePerEpoch,
      token.reduceRatio,
      token.liquidityTokensRatio,
    );
    return percentToTargetEras * Number(maxSupply);
  }, [token.targetEras, token.initialTargetMintSizePerEpoch, token.reduceRatio, token.epochesPerEra]);

  const mintedSupply = useMemo(() => {
    // Including vault amount
    return Number(token.supply) / LAMPORTS_PER_SOL;
  }, [token.supply]);

  const progressPercentage = useMemo(() => {
    return (mintedSupply * 100) / totalSupplyToTargetEras;
  }, [mintedSupply, totalSupplyToTargetEras]);

  const feeRateInSol = useMemo(() => {
    return Number(token.feeRate) / LAMPORTS_PER_SOL;
  }, [token.feeRate]);

  const currentCost = useMemo(() => {
    const currentMintSize = Number(token.mintSizeEpoch) / LAMPORTS_PER_SOL;
    return currentMintSize > 0 ? feeRateInSol / currentMintSize : 0;
  }, [token.mintSizeEpoch, feeRateInSol]);

  const originalCost = useMemo(() => {
    const initialMintSize = Number(token.initialMintSize) / LAMPORTS_PER_SOL;
    return initialMintSize > 0 ? feeRateInSol / initialMintSize : 0;
  }, [token.initialMintSize, feeRateInSol]);

  return (
    <div
      className="pixel-box p-4 cursor-pointer relative overflow-hidden"
      onClick={handleCardClick}
    >
      {!isLoading && metadata?.header && <TokenBackgroundImage imageUrl={metadata.header} metadataTimestamp={Number(token.metadataTimestamp)} />}
      {!isLoading && <div className="relative flex items-start gap-4">
        <div className="flex flex-col items-center">
          <TokenImage
            imageUrl={metadata?.image as string}
            name={token.tokenName}
            metadataTimestamp={Number(token.metadataTimestamp)}
            className="w-12 h-12"
          />
          <div className='mt-6 text-sm'>{t('tokenInfo.priceChange')}</div>
          <span className="badge badge-lg badge-accent mt-1">+{((currentCost / originalCost - 1) * 100).toFixed(2)}%</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="badge badge-md badge-secondary">{token.tokenSymbol}</h3>
            <span className="text-sm">{token.tokenName}</span>
          </div>
          <div className="flex justify-between">
            <span className="opacity-70">{t('common.milestone')}:</span>
            <span className='font-bold'>#{token.currentEra}</span>
          </div>
          <div className="space-y-0 text-sm">
            <div className="flex justify-between">
              <span className="opacity-70">{t('tokenInfo.mintFee')}:</span>
              <span>{feeRateInSol} SOL</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-70">{t('tokenInfo.currentMintSize')}:</span>
              <span>{(Number(token.mintSizeEpoch) / LAMPORTS_PER_SOL).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-70">{t('tokenInfo.currentPrice')}:</span>
              <span>{currentCost.toLocaleString(undefined, { maximumFractionDigits: 6 })} SOL</span>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="opacity-70">{t('common.progress')}:</span>
                <span>{progressPercentage.toFixed(2)}%</span>
              </div>
              <progress
                className="pixel-progress w-full"
                style={{ height: '16px' }}
                value={Math.min(progressPercentage, 100)}
                max="100"
              ></progress>
            </div>
          </div>
        </div>
      </div>}
    </div>
  );
};
