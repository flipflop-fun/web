import { FC, useEffect, useMemo, useState } from "react";
import { InitiazlizedTokenData, TokenMetadataIPFS } from "../../types/types";
import { DataBlock } from "./TokenInfo";
import { PublicKey } from "@solana/web3.js";
import { calculateMinTotalFee, calculateTotalSupplyToTargetEras, formatSeconds, getMintSpeed, safeLamportBNToUiNumber } from "../../utils/format";
import { AddressDisplay } from "../common/AddressDisplay";
import { useTranslation } from "react-i18next";
import { getMaxSupplyByConfigAccount } from "../../utils/web3";
import { useConnection } from "@solana/wallet-adapter-react";
import { BN } from "@coral-xyz/anchor";

export type TokenInfoDataProps = {
  token: InitiazlizedTokenData,
  metadata: TokenMetadataIPFS,
  hasStarted: boolean,
  setMintableTokenSupply: (value: number | undefined) => void,
}
export const TokenInfoData: FC<TokenInfoDataProps> = ({
  token,
  metadata,
  hasStarted,
  setMintableTokenSupply,
}) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [maxSupply, setMaxSupply] = useState<number | undefined>(undefined);
  const { connection } = useConnection();
  
  useEffect(() => {
    if (!token.configAccount) {
      return;
    }
    getMaxSupplyByConfigAccount(new PublicKey(token.configAccount), connection)
      .then((maxSupply) => setMaxSupply(safeLamportBNToUiNumber(maxSupply)));
  }, [token.configAccount, connection]);

  const mintedSupply = useMemo(() => {
    // Including vault amount
    return safeLamportBNToUiNumber(new BN(token.supply));
  }, [token.supply]);

  useEffect(() => {
    if (!maxSupply) {
      return;
    }
    setMintableTokenSupply(Math.round(Math.abs(maxSupply - mintedSupply)));
  }, [maxSupply, mintedSupply, setMintableTokenSupply]);

  const mintSpeed = useMemo(() => {
    return getMintSpeed(token.targetSecondsPerEpoch, token.initialTargetMintSizePerEpoch, token.initialMintSize);
  }, [token.targetSecondsPerEpoch, token.initialTargetMintSizePerEpoch, token.initialMintSize]);

  const totalSupplyToTargetEras = useMemo(() => {
    return calculateTotalSupplyToTargetEras(
      token.epochesPerEra,
      token.initialTargetMintSizePerEpoch,
      token.reduceRatio,
      token.targetEras,
      token.liquidityTokensRatio,
    );
  }, [token.epochesPerEra, token.initialTargetMintSizePerEpoch, token.reduceRatio, token.targetEras, token.liquidityTokensRatio]);

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
          tooltip={t('tooltip.currentEra')}
        />
        <DataBlock
          label={t('tokenInfo.currentCheckpoint')}
          value={token.currentEpoch}
          tooltip={t('tooltip.currentEpoch')}
        />
        <DataBlock
          label={t('tokenInfo.mintFee')}
          value={(safeLamportBNToUiNumber(token.feeRate, 2)) + " SOL/" + t('common.mint')}
          tooltip={t('tooltip.mintFee')}
        />
        <DataBlock
          label={t('tokenInfo.tokenAddress')}
          value={<AddressDisplay address={token.mint} />}
          tooltip={t('tooltip.tokenAddress')}
        />
        <DataBlock
          label={t('tokenInfo.currentMintSize')}
          value={(safeLamportBNToUiNumber(token.mintSizeEpoch, 2)).toLocaleString(undefined, { maximumFractionDigits: 2 }) + " " + metadata?.symbol}
          tooltip={t('tooltip.currentMintSize')}
        />
        <DataBlock
          label={`${t('tokenInfo.targetSupply')} (${t('tokenInfo.targetMilestone')}:${token.targetEras})`}
          value={totalSupplyToTargetEras.toLocaleString(undefined, { maximumFractionDigits: 2 }) + " " + metadata?.symbol}
          tooltip={t('tooltip.targetSupply')}
        />
        <DataBlock
          label={t('tokenInfo.currentMinted')}
          value={(mintedSupply).toLocaleString(undefined, { maximumFractionDigits: 2 }) + " " + metadata?.symbol}
          tooltip={t('tooltip.currentMinted')}
        />
        <DataBlock
          label={t('tokenInfo.maxSupply')}
          // value={calculateMaxSupply(token.epochesPerEra, token.initialTargetMintSizePerEpoch, token.reduceRatio, token.liquidityTokensRatio).toLocaleString(undefined, { maximumFractionDigits: 2 }) + " " + metadata?.symbol}
          value={maxSupply !== undefined && maxSupply > 0 && maxSupply.toLocaleString(undefined, { maximumFractionDigits: 2 }) + " " + metadata?.symbol}
          tooltip={t('tooltip.maxSupply')}
        />
        {expanded && (<>
        <DataBlock
          label={t('tokenInfo.initialMintSize')}
          value={(safeLamportBNToUiNumber(token.initialMintSize, 2)).toLocaleString(undefined, { maximumFractionDigits: 2}) + " " + (metadata?.symbol || "SOL") + "/" + t('common.mint')}
          tooltip={t('tooltip.mintFee')}
        />
        <DataBlock
          label={t('tokenInfo.targetSpeed')}
          value={formatSeconds(mintSpeed) + "/" + t('common.mint')}
          tooltip={t('tooltip.mintSpeed')}
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
          value={(safeLamportBNToUiNumber(token.totalMintFee, 2)).toLocaleString(undefined, { maximumFractionDigits: 2 }) + " SOL"}
          tooltip={t('tooltip.currentMintFee')}
        />
        <DataBlock
          label={t('tokenInfo.totalReferralFee')}
          value={(safeLamportBNToUiNumber(token.totalReferrerFee, 2)).toLocaleString(undefined, { maximumFractionDigits: 2 }) + " SOL"}
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
        </>)}
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          className="btn btn-sm btn-outline"
          onClick={() => setExpanded((v) => !v)}
          aria-label={expanded ? t('common.collapse') : t('common.expand')}
        >
          {expanded ? t('common.collapse') : t('common.expand')}
        </button>
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
              {safeLamportBNToUiNumber(token.quantityMintedEpoch, 2).toLocaleString(undefined, { maximumFractionDigits: 2 })} / {safeLamportBNToUiNumber(token.targetMintSizeEpoch, 2).toLocaleString(undefined, { maximumFractionDigits: 2 })} ({progressPercentageOfEpoch.toFixed(2)}%)
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
