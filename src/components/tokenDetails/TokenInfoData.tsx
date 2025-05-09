import { FC, useMemo } from "react";
import { InitiazlizedTokenData, TokenMetadataIPFS } from "../../types/types";
import { DataBlock } from "./TokenInfo";
import { tooltip } from "../../config/constants";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { BN_HUNDRED, BN_LAMPORTS_PER_SOL, calculateMaxSupply, calculateMinTotalFee, calculateTotalSupplyToTargetEras, formatSeconds, getMintedSupply, getMintSpeed, numberStringToBN } from "../../utils/format";
import { AddressDisplay } from "../common/AddressDisplay";
import { useTranslation } from "react-i18next";

export type TokenInfoDataProps = {
  token: InitiazlizedTokenData,
  metadata: TokenMetadataIPFS,
  hasStarted: boolean,
}
export const TokenInfoData: FC<TokenInfoDataProps> = ({
  token,
  metadata,
  hasStarted,
}) => {
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
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <DataBlock
          label={t('tokenInfo.currentMilestone')}
          value={token.currentEra}
          tooltip={tooltip.currentEra}
        />
        <DataBlock
          label={t('tokenInfo.currentCheckpoint')}
          value={token.currentEpoch}
          tooltip={tooltip.currentEpoch}
        />
        <DataBlock
          label={t('tokenInfo.mintFee')}
          value={(Number(token.feeRate) / LAMPORTS_PER_SOL) + " SOL/" + t('common.mint')}
          tooltip={tooltip.mintFee}
        />
        <DataBlock
          label={t('tokenInfo.currentMintSize')}
          value={(numberStringToBN(token.mintSizeEpoch).mul(BN_HUNDRED).div(BN_LAMPORTS_PER_SOL).toNumber() / 100).toLocaleString(undefined, { maximumFractionDigits: 2 }) + " " + metadata?.symbol}
          tooltip={tooltip.currentMintSize}
        />
        <DataBlock
          label={t('tokenInfo.currentMinted')}
          value={(mintedSupply).toLocaleString(undefined, { maximumFractionDigits: 2 }) + " " + metadata?.symbol}
          tooltip={tooltip.currentMinted}
        />
        <DataBlock
          label={`${t('tokenInfo.targetSupply')} (${t('tokenInfo.targetMilestone')}:${token.targetEras})`}
          value={totalSupplyToTargetEras.toLocaleString(undefined, { maximumFractionDigits: 2 }) + " " + metadata?.symbol}
          tooltip={tooltip.targetSupply}
        />
        <DataBlock
          label={t('tokenInfo.targetSpeed')}
          value={formatSeconds(mintSpeed) + "/" + t('common.mint')}
          tooltip={tooltip.mintSpeed}
        />
        <DataBlock
          label={t('tokenInfo.deployAt')}
          value={new Date(Number(token.timestamp) * 1000).toLocaleString()}
          tooltip={tooltip.deployAt}
        />
        <DataBlock
          label={t('tokenInfo.deployTx')}
          value={<AddressDisplay address={token.txId} type='tx' />}
          tooltip={tooltip.deployingTx}
        />
        <DataBlock
          label={t('tokenInfo.developer')}
          value={<AddressDisplay address={token.admin} />}
          tooltip={tooltip.deployer}
        />
        <DataBlock
          label={t('tokenInfo.tokenAddress')}
          value={<AddressDisplay address={token.mint} />}
          tooltip={tooltip.tokenAddress}
        />
        <DataBlock
          label={t('tokenInfo.liquidityVault') + ' (SOL)'}
          value={<AddressDisplay address={token.configAccount} />}
          tooltip={tooltip.liquidityVaultSOL}
        />
        <DataBlock
          label={t('tokenInfo.liquidityVault') + '(' + metadata?.symbol + ')'}
          value={<AddressDisplay address={token.tokenVault} />}
          tooltip={tooltip.liquidityVaultToken}
        />
        <DataBlock
          label={t('tokenInfo.targetMilestone')}
          value={token.targetEras}
          tooltip={tooltip.targetEras}
        />
        <DataBlock
          label={t('tokenInfo.startTimeOfCurrentCheckpoint')}
          value={new Date(Number(token.startTimestampEpoch) * 1000).toLocaleString()}
          tooltip={tooltip.startTimeOfCurrentEpoch}
        />
        <DataBlock
          label={t('tokenInfo.LiquidityTokensRatio')}
          value={token.liquidityTokensRatio + "%"}
          tooltip={tooltip.liquidityTokensRatio}
        />
        <DataBlock
          label={t('tokenInfo.maxSupply')}
          value={calculateMaxSupply(token.epochesPerEra, token.initialTargetMintSizePerEpoch, token.reduceRatio).toLocaleString(undefined, { maximumFractionDigits: 2 }) + " " + metadata?.symbol}
          tooltip={tooltip.maxSupply}
        />
        <DataBlock
          label={t('tokenInfo.targetMintTime')}
          value={formatSeconds(Number(token.targetSecondsPerEpoch) * Number(token.epochesPerEra))}
          tooltip={tooltip.targetMintTime}
        />
        <DataBlock
          label={t('tokenInfo.reduceRatioPerMilestone')}
          value={token.reduceRatio + "%"}
          tooltip={tooltip.reduceRatioPerEra}
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
          tooltip={tooltip.targetMinimumFee}
        />
        <DataBlock
          label={t('tokenInfo.checkpointsPerMilestone')}
          value={token.epochesPerEra}
          tooltip={tooltip.epochesPerEra}
        />
        <DataBlock
          label={t('tokenInfo.totalMintFee')}
          value={(Number(token.totalMintFee) / LAMPORTS_PER_SOL).toLocaleString(undefined, { maximumFractionDigits: 2 }) + " SOL"}
          tooltip={tooltip.currentMintFee}
        />
        <DataBlock
          label={t('tokenInfo.totalReferralFee')}
          value={(Number(token.totalReferrerFee) / LAMPORTS_PER_SOL).toLocaleString(undefined, { maximumFractionDigits: 2 }) + " SOL"}
          tooltip={tooltip.currentReferralFee}
        />
        <DataBlock
          label={t('tokenInfo.currentDifficulty')}
          value={parseFloat(token.difficultyCoefficientEpoch).toFixed(4)}
          tooltip={tooltip.difficultyOfCurrentEpoch}
        />
        <DataBlock
          label={t('tokenInfo.lastDifficulty')}
          value={parseFloat(token.lastDifficultyCoefficientEpoch).toFixed(4)}
          tooltip={tooltip.difficultyOfLastEpoch}
        />
      </div>

      {hasStarted &&
        <div>
          <div className="mt-8">
            <h3 className="text-xl mb-4 text-base-content">{t('tokenInfo.progressToTargetSupply')}</h3>
            <div className="text-sm font-medium mb-1 text-base-content">
              {mintedSupply.toLocaleString(undefined, { maximumFractionDigits: 2 })} / {totalSupplyToTargetEras.toLocaleString(undefined, { maximumFractionDigits: 2 })} ({progressPercentage.toFixed(2)}%)
            </div>
            <progress
              className="pixel-progress w-full"
              value={Math.min(progressPercentage, 100)}
              max="100"
            ></progress>
          </div>

          <div className="mt-8">
            <h3 className="text-xl mb-4 text-base-content">{t('tokenInfo.progressToCurrentCheckpoint')}</h3>
            <div className="text-sm font-medium mb-1 text-base-content">
              {(numberStringToBN(token.quantityMintedEpoch).mul(BN_HUNDRED).div(BN_LAMPORTS_PER_SOL).toNumber() / 100).toLocaleString(undefined, { maximumFractionDigits: 2 })} / {(numberStringToBN(token.targetMintSizeEpoch).mul(BN_HUNDRED).div(BN_LAMPORTS_PER_SOL).toNumber() / 100).toLocaleString(undefined, { maximumFractionDigits: 2 })} ({progressPercentageOfEpoch.toFixed(2)}%)
            </div>
            <progress
              className="pixel-progress w-full"
              value={Math.min(progressPercentageOfEpoch, 100)}
              max="100"
            ></progress>
          </div>
        </div>}
    </div>
  );
};