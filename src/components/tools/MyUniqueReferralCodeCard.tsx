import { FC } from 'react';
import { InitiazlizedTokenData, TokenMetadataIPFS } from '../../types/types';
import { TokenImage } from '../mintTokens/TokenImage';
import { AddressDisplay } from '../common/AddressDisplay';
import { useNavigate } from 'react-router-dom';
import { useDeviceType } from '../../hooks/device';
import { TokenBackgroundImage } from '../common/TokenBackgroundImage';
import { useTranslation } from 'react-i18next';

type MyUniqueReferralCodeCardProps = {
  token: InitiazlizedTokenData;
  metadata: TokenMetadataIPFS | undefined;
  bonus: number;
  onGetURC: (token: InitiazlizedTokenData) => void;
  onBonusDetail: (mint: string, bonus: number) => void;
}

export const MyUniqueReferralCodeCard: FC<MyUniqueReferralCodeCardProps> = ({
  token,
  metadata,
  bonus,
  onGetURC,
  onBonusDetail,
}) => {
  const navigate = useNavigate();
  const { isMobile } = useDeviceType();
  const { t } = useTranslation();
  
  const handleClick = () => {
    navigate(`/token/${token.mint}`);
  };

  const handleButtonClick = (e: React.MouseEvent, callback: () => void) => {
    e.stopPropagation();
    callback();
  };

  const handleGetURC = (e: React.MouseEvent) => {
    handleButtonClick(e, () => onGetURC(token));
  };

  const handleBonusDetail = (e: React.MouseEvent) => {
    handleButtonClick(e, () => onBonusDetail(token.mint, bonus));
  };

  return (
    <div className="pixel-box mb-4 p-4 cursor-pointer overflow-hidden relative">
      {metadata?.header && <TokenBackgroundImage imageUrl={metadata.header} metadataTimestamp={Number(token.metadataTimestamp)} />}
      <div className="relative z-10 flex items-start gap-4">
        <div className="flex flex-col items-center">
          {metadata?.image &&
            <TokenImage
              imageUrl={metadata?.image}
              name={metadata?.name || token.tokenSymbol}
              metadataTimestamp={Number(token.metadataTimestamp)}
              className="w-12 h-12"
            />}
          <div className="mt-1 text-sm opacity-70">{t('urc.bonus')}</div>
          <div className="font-semibold">{bonus.toFixed(4)} SOL</div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="badge badge-md badge-secondary">{token.tokenSymbol}</h3>
                <span className="text-sm">{metadata?.name}</span>
              </div>
              <div className="space-y-1">
                <div className="flex gap-2">
                  <div className="text-sm mt-0.5 opacity-70">{t("tokenInfo.tokenAddress")}:</div>
                  <AddressDisplay address={token.mint} showCharacters={isMobile ? 3 : 10} />
                </div>
                <div className="flex gap-2">
                  <div className="text-sm mt-0.5 opacity-70">{t("tokenInfo.developer")}:</div>
                  <AddressDisplay address={token.admin} showCharacters={isMobile ? 3 : 10} />
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2 justify-end mt-6">
            <button
              className="btn btn-sm btn-primary"
              onClick={handleGetURC}
            >
              {t('urc.urcDetails')}
            </button>
            <button
              className="btn btn-sm btn-secondary"
              onClick={handleBonusDetail}
            >
              {t('urc.bonusDetails')}
            </button>
            <button
              className="btn btn-sm btn-success"
              onClick={handleClick}
            >
              {t('tokenInfo.view')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};