import { FC, useEffect, useState } from 'react';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import toast from 'react-hot-toast';
import { InitiazlizedTokenData, RefundModalProps, RefundTokenData } from '../../types/types';
import { getRefundAccountData, getSystemConfig, getTokenBalanceByMintAndOwner, refund } from '../../utils/web3';
import { ToastBox } from '../common/ToastBox';
import { NETWORK_CONFIGS } from '../../config/constants';
import { formatPrice, numberStringToBN, safeLamportBNToUiNumber } from '../../utils/format';
import AlertBox from '../common/AlertBox';
import { ModalTopBar } from '../common/ModalTopBar';
import { useTranslation } from 'react-i18next';

export const RefundModal: FC<RefundModalProps> = ({
  isOpen,
  onClose,
  token,
}) => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [refundFeeRate, setRefundFeeRate] = useState(0);
  const [refundAccountData, setRefundAccountData] = useState<RefundTokenData>();
  const [tokenBalance, setTokenBalance] = useState(0);
  const { t } = useTranslation();
  const liquidityRatio = Number(token.tokenData?.liquidityTokensRatio) / 100;

  useEffect(() => {
    if (wallet) {
      getSystemConfig(wallet, connection).then((data) => {
        if (data?.success && data.data) {
          setRefundFeeRate(data.data.systemConfigData.refundFeeRate);
        }
        else toast.error("RefundModal.useEffect.1: " + data.message as string);
      });
      const mint = new PublicKey(token.mint as string);
      getRefundAccountData(wallet, connection, mint).then((data) => {
        if (data?.success) setRefundAccountData(data.data);
        else toast.error("RefundModal.useEffect.2: " + data.message as string);
      });
      getTokenBalanceByMintAndOwner(new PublicKey(token.mint), wallet.publicKey, connection).then((data) => {
        setTokenBalance(data as number);
      });
    }
  }, [connection, token.mint, token.tokenData, wallet]);

  const handleRefund = async () => {
    if (!wallet) {
      toast.error(t('common.pleaseConnectWallet'));
      return;
    }

    if (!refundAccountData) {
      toast.error(t('mint.noRefundDataAvailable'));
      return;
    }

    if (refundAccountData.totalTokens.isZero()) {
      toast.error(t('mint.noTokensAvailableForRefund'));
      return;
    }

    try {
      setLoading(true);
      const result = await refund(
        wallet,
        connection,
        token.tokenData as InitiazlizedTokenData,
      );

      if (result.success) {
        const network = (process.env.REACT_APP_NETWORK as keyof typeof NETWORK_CONFIGS) || "devnet"
        const explorerUrl = `${NETWORK_CONFIGS[network].scanUrl}/tx/${result.data?.tx}?cluster=${network}`;
        toast.success(
          <ToastBox
            title={t('mint.refundSuccessful')}
            url={explorerUrl}
            urlText={t('common.viewTransaction')}
          />,
        );
        close();
      } else {
        toast.error(t('common.operationFailed') + ": " + result.message as string);
      }
    } catch (error) {
      console.error('Refund error:', error);
      toast.error(t('common.operationFailed'));
    } finally {
      setLoading(false);
    }
  };

  const close = () => {
    setLoading(false);
    setTimeout(() => {
      onClose();
    }, 3000);
  }

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box pixel-box relative p-3">
        <ModalTopBar title={`${t('mint.refund')} ${token.tokenData?.tokenSymbol}`} onClose={onClose} />
        <div className="max-h-[calc(100vh-12rem)] overflow-y-auto p-1">
          <div className="space-y-4">
            <div className="pixel-box mt-4 space-y-2 bg-base-200 p-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-base-content/70">{t('mint.totalPaid')}</span>
                <span className="font-medium">
                  {refundAccountData ?
                    formatPrice(safeLamportBNToUiNumber(refundAccountData.totalMintFee), 3) :
                    '-'
                  } SOL
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-base-content/70">- {t('mint.bonusToReferrer')}</span>
                <span className="font-medium">
                  {refundAccountData ?
                    formatPrice(safeLamportBNToUiNumber(refundAccountData.totalReferrerFee), 3) :
                    '-'
                  } SOL
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-base-content/70">- {t('mint.refundFee')} ({refundFeeRate * 100}%)</span>
                <span className="font-medium">
                  {refundAccountData ?
                    formatPrice((safeLamportBNToUiNumber(refundAccountData.totalMintFee) * refundFeeRate), 3) :
                    '-'
                  } SOL
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-base-content/70">{t('mint.totalTokensMinted')}</span>
                <span className="font-medium text-error">
                  {refundAccountData ?
                    formatPrice(safeLamportBNToUiNumber(refundAccountData.totalTokens, 3), 3) :
                    '-'
                  } {token.tokenData?.tokenSymbol}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-base-content/70">{t('common.avgPrice')}</span>
                <span className="font-medium text-error">
                  {refundAccountData ?
                    formatPrice(Number(refundAccountData.totalMintFee) / Number(numberStringToBN(token.amount))) :
                    '-'
                  } {token.tokenData?.tokenSymbol}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-base-content/70">{t('mint.balanceInWallet')}</span>
                <span className="font-medium text-error">
                  {formatPrice(tokenBalance, 3)} {token.tokenData?.tokenSymbol}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-base-content/70">{t('mint.tokensBurnedFromVault')}</span>
                <span className="font-medium text-error">
                  {refundAccountData ?
                    formatPrice(safeLamportBNToUiNumber(refundAccountData.totalTokens, 3) / (1 - liquidityRatio) * liquidityRatio, 3) :
                    '-'
                  } {token.tokenData?.tokenSymbol}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-base-content/70 font-bold">{t('mint.refundAmount')}</span>
                <span className="font-medium text-success">
                  {refundAccountData ?
                    formatPrice(
                      (safeLamportBNToUiNumber(refundAccountData.totalMintFee) -
                        safeLamportBNToUiNumber(refundAccountData.totalReferrerFee) -
                        (safeLamportBNToUiNumber(refundAccountData.totalMintFee) * refundFeeRate)),
                      3
                    ) :
                    '-'
                  } SOL
                </span>
              </div>
            </div>

            {refundAccountData && tokenBalance === safeLamportBNToUiNumber(refundAccountData.totalTokens) ? (
              <div className="flex flex-col gap-2">
                {/* <AlertBox
                  title={t('common.attention')}
                  message={`You are about to refund your ${token.tokenData?.tokenSymbol} tokens. This action cannot be undone.`}
                /> */}
                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-2">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-warning"
                      checked={confirmed}
                      onChange={(e) => setConfirmed(e.target.checked)}
                    />
                    <span className="label-text">{t('mint.refundConfirmation')}</span>
                  </label>
                </div>

                <div className="space-y-2">
                  <button
                    className={`btn btn-error w-full`}
                    onClick={handleRefund}
                    disabled={!confirmed || !refundAccountData}
                  >
                    {loading ? t('mint.startRefund') + '...' : t('mint.startRefund')}
                  </button>
                </div>
              </div>
            ) : (
              <AlertBox
                title={t('common.attention')}
                message={t('mint.refundError')}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
