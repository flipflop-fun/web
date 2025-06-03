import { FC, useMemo, useState } from "react";
import { InitiazlizedTokenData, TokenMetadataIPFS } from "../../types/types";
import { DataBlock } from "./TokenInfo";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { BN_HUNDRED, BN_LAMPORTS_PER_SOL, calculateMaxSupply, calculateMinTotalFee, calculateTotalSupplyToTargetEras, formatSeconds, getMintedSupply, getMintSpeed, numberStringToBN } from "../../utils/format";
import { AddressDisplay } from "../common/AddressDisplay";
import { useTranslation } from "react-i18next";

export type TokenInfoDataMobileProps = {
  token: InitiazlizedTokenData,
  metadata: TokenMetadataIPFS,
  hasStarted: boolean
}

export const TokenInfoDataMobile: FC<TokenInfoDataMobileProps> = ({
  token,
  metadata,
  hasStarted
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const { t } = useTranslation();

  const mintedSupply = useMemo(() => {
    return getMintedSupply(token.supply, token.liquidityTokensRatio);
  }, [token.supply, token.liquidityTokensRatio]);

  const mintSpeed = useMemo(() => {
    return getMintSpeed(token.targetSecondsPerEpoch, token.initialTargetMintSizePerEpoch, token.initialMintSize);
  }, [token.targetSecondsPerEpoch, token.initialTargetMintSizePerEpoch, token.initialMintSize]);

  const totalSupplyToTargetEras = useMemo(() => {
    return calculateTotalSupplyToTargetEras(
      token.epochesPerEra,
      token.initialTargetMintSizePerEpoch,
      token.reduceRatio,
      token.targetEras
    );
  }, [token.targetEras, token.initialTargetMintSizePerEpoch, token.reduceRatio, token.epochesPerEra]);

  const progressPercentage = useMemo(() => {
    return (mintedSupply * 100) / totalSupplyToTargetEras;
  }, [mintedSupply, totalSupplyToTargetEras]);

  const progressPercentageOfEpoch = useMemo(() => {
    return (Number(token.quantityMintedEpoch) * 100) / Number(token.targetMintSizeEpoch);
  }, [token.quantityMintedEpoch, token.targetMintSizeEpoch]);

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <DataBlock
          label={t('tokenInfo.currentMilestone') + "/" + t('tokenInfo.currentCheckpoint')}
          value={`${t('tokenInfo.milestoneNumber', { number: token.currentEra })} / ${t('tokenInfo.checkpointNumber', { number: token.currentEpoch })}`}
          tooltip={t('tooltip.currentEra')}
        />
        <DataBlock
          label={t('tokenInfo.currentMinted')}
          value={`${mintedSupply.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${metadata?.symbol}`}
          tooltip={t('tooltip.currentMinted')}
        />
        <DataBlock
          label={t('tokenInfo.mintFee')}
          value={`${(Number(token.feeRate) / LAMPORTS_PER_SOL)} SOL/${t('common.mint')}`}
          tooltip={t('tooltip.mintFee')}
        />
        <DataBlock
          label={t('tokenInfo.tokenAddress')}
          value={<AddressDisplay address={token.mint} />}
          tooltip={t('tooltip.tokenAddress')}
        />
      </div>

      <button
        onClick={() => setShowDetails(!showDetails)}
        className="btn w-full"
      >
        <span>{showDetails ? t('tokenInfo.hideMore') : t('tokenInfo.showMore')}</span>
        {showDetails ? (
          <svg className="w-4 h-4" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M7 16H5v-2h2v-2h2v-2h2V8h2v2h2v2h2v2h2v2h-2v-2h-2v-2h-2v-2h-2v2H9v2H7v2z" fill="currentColor" /> </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M7 8H5v2h2v2h2v2h2v2h2v-2h2v-2h2v-2h2V8h-2v2h-2v2h-2v2h-2v-2H9v-2H7V8z" fill="currentColor" /> </svg>
        )}
      </button>

      {showDetails && (
        <div className="space-y-2 pt-2">
          <DataBlock
            label={t('tokenInfo.currentMintSize')}
            value={`${(numberStringToBN(token.mintSizeEpoch).mul(BN_HUNDRED).div(BN_LAMPORTS_PER_SOL).toNumber() / 100).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${metadata?.symbol}`}
            tooltip={t('tooltip.currentMintSize')}
          />
          <DataBlock
            label={t('tokenInfo.targetSpeed')}
            value={`${formatSeconds(mintSpeed)}/mint`}
            tooltip={t('tooltip.mintSpeed')}
          />
          <DataBlock
            label={`${t('tokenInfo.targetSupply')} (${t('tokenInfo.targetMilestone')}:${token.targetEras})`}
            value={`${totalSupplyToTargetEras.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${metadata?.symbol}`}
            tooltip={t('tooltip.targetSupply')}
          />
          <DataBlock
            label={t('tokenInfo.deployAt')}
            value={new Date(Number(token.timestamp) * 1000).toLocaleString()}
            tooltip={t('tooltip.deployAt')}
          />
          <DataBlock
            label={t('tokenInfo.deployTx')}
            value={<AddressDisplay address={token.txId} type='tx' />}
            tooltip={t('tooltip.deployingTx')}
          />
          <DataBlock
            label={t('tokenInfo.developer')}
            value={<AddressDisplay address={token.admin} />}
            tooltip={t('tooltip.deployer')}
          />
          <DataBlock
            label={t('tokenInfo.liquidityVault') + ' (SOL)'}
            value={<AddressDisplay address={token.configAccount} />}
            tooltip={t('tooltip.liquidityVaultSOL')}
          />
          <DataBlock
            label={t('tokenInfo.liquidityVault') + '(' + metadata?.symbol + ')'}
            value={<AddressDisplay address={token.tokenVault} />}
            tooltip={t('tooltip.liquidityVaultToken')}
          />
          <DataBlock
            label={t('tokenInfo.targetMilestone')}
            value={token.targetEras}
            tooltip={t('tooltip.targetEras')}
          />
          <DataBlock
            label={t('tokenInfo.startTimeOfCurrentCheckpoint')}
            value={new Date(Number(token.startTimestampEpoch) * 1000).toLocaleString()}
            tooltip={t('tooltip.startTimeOfCurrentEpoch')}
          />
          <DataBlock
            label={t('tokenInfo.LiquidityTokensRatio')}
            value={token.liquidityTokensRatio + "%"}
            tooltip={t('tooltip.liquidityTokensRatio')}
          />
          <DataBlock
            label={t('tokenInfo.maxSupply')}
            value={calculateMaxSupply(token.epochesPerEra, token.initialTargetMintSizePerEpoch, token.reduceRatio).toLocaleString(undefined, { maximumFractionDigits: 2 }) + " " + metadata?.symbol}
            tooltip={t('tooltip.maxSupply')}
          />
          <DataBlock
            label={t('tokenInfo.targetMintTime')}
            value={formatSeconds(Number(token.targetSecondsPerEpoch) * Number(token.epochesPerEra))}
            tooltip={t('tooltip.targetMintTime')}
          />
          <DataBlock
            label={t('tokenInfo.reduceRatioPerMilestone')}
            value={token.reduceRatio + "%"}
            tooltip={t('tooltip.reduceRatioPerEra')}
          />
          <DataBlock
            label={t('tokenInfo.targetMinimumMintFee')}
            value={(calculateMinTotalFee(
              token.initialTargetMintSizePerEpoch,
              token.feeRate,
              token.targetEras,
              token.epochesPerEra,
              token.initialMintSize
            )).toLocaleString(undefined, { maximumFractionDigits: 2 }) + " SOL"}
            tooltip={t('tooltip.targetMinimumFee')}
          />
          <DataBlock
            label={t('tokenInfo.checkpointsPerMilestone')}
            value={token.epochesPerEra}
            tooltip={t('tooltip.epochesPerEra')}
          />
          <DataBlock
            label={t('tokenInfo.totalMintFee')}
            value={(Number(token.totalMintFee) / LAMPORTS_PER_SOL).toLocaleString(undefined, { maximumFractionDigits: 2 }) + " SOL"}
            tooltip={t('tooltip.currentMintFee')}
          />
          <DataBlock
            label={t('tokenInfo.totalReferralFee')}
            value={(Number(token.totalReferrerFee) / LAMPORTS_PER_SOL).toLocaleString(undefined, { maximumFractionDigits: 2 }) + " SOL"}
            tooltip={t('tooltip.currentReferralFee')}
          />
          <DataBlock
            label={t('tokenInfo.currentDifficulty')}
            value={parseFloat(token.difficultyCoefficientEpoch).toFixed(4)}
            tooltip={t('tooltip.difficultyOfCurrentEpoch')}
          />
          <DataBlock
            label={t('tokenInfo.lastDifficulty')}
            value={parseFloat(token.lastDifficultyCoefficientEpoch).toFixed(4)}
            tooltip={t('tooltip.difficultyOfLastEpoch')}
          />
        </div>
      )}

      {hasStarted && (
        <div>
          <h3 className="text-base-content">{t('tokenInfo.mintedTokensToTargetSupply')}</h3>
          <div className="text-sm font-medium mb-1 text-base-content">
            {mintedSupply.toLocaleString(undefined, { maximumFractionDigits: 2 })} / {totalSupplyToTargetEras.toLocaleString(undefined, { maximumFractionDigits: 2 })} ({progressPercentage.toFixed(2)}%)
          </div>
          <progress
            className="pixel-progress w-full"
            style={{ height: "16px" }}
            value={Math.min(progressPercentage, 100)}
            max="100"
          ></progress>
        </div>
      )}

      {hasStarted && (
        <div>
          <h3 className="text-base-content">{t('tokenInfo.mintedTokensToCurrentCheckpoint')}</h3>
          <div className="text-sm font-medium mb-1 text-base-content">
            {(numberStringToBN(token.quantityMintedEpoch).mul(BN_HUNDRED).div(BN_LAMPORTS_PER_SOL).toNumber() / 100).toLocaleString(undefined, { maximumFractionDigits: 2 })} / {(numberStringToBN(token.targetMintSizeEpoch).mul(BN_HUNDRED).div(BN_LAMPORTS_PER_SOL).toNumber() / 100).toLocaleString(undefined, { maximumFractionDigits: 2 })} ({progressPercentageOfEpoch.toFixed(2)}%)
          </div>
          <progress
            className="pixel-progress w-full"
            style={{ height: "16px" }}
            value={Math.min(progressPercentageOfEpoch, 100)}
            max="100"
          ></progress>
        </div>
      )}
    </div>
  );
}