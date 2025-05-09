import { FC, useState } from "react";
import { InitiazlizedTokenData } from "../../types/types";
import { useConnection, useAnchorWallet } from "@solana/wallet-adapter-react";
import { closeToken } from "../../utils/web3";
import toast from "react-hot-toast";
import { ToastBox } from "../common/ToastBox";
import { NETWORK, SCANURL } from "../../config/constants";
import AlertBox from "../common/AlertBox";
import { ModalTopBar } from "../common/ModalTopBar";
import { useTranslation } from "react-i18next";

type CloseTokenModalProps = {
  isOpen: boolean;
  onClose: () => void;
  token: InitiazlizedTokenData | null;
}

export const CloseTokenModal: FC<CloseTokenModalProps> = ({ isOpen, onClose, token }) => {
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const { t } = useTranslation();

  if (!isOpen || !token) return null;

  const handleClose = async () => {
    if (!confirmed) {
      toast.error("Please confirm the action by checking the checkbox");
      return;
    }

    if (!wallet) {
      toast.error("Please connect wallet (CloseTokenModal)");
      return;
    }

    try {
      setLoading(true);
      const result = await closeToken(wallet, connection, token);

      if (result.success) {
        toast.success(
          <ToastBox
            url={`${SCANURL}/tx/${result.data?.tx}?cluster=${NETWORK}`}
            urlText="View transaction"
            title="Token closed success fully!"
          />
        );
        close();
      } else {
        toast.error("CloseTokenModal.handleClose.1: " + result.message || "Failed to close token");
      }
    } catch (error: any) {
      console.error('Close mint error:', error);
      toast.error("CloseTokenModal.handleClose.2: " + error.message || "An error occurred while closing the token");
    } finally {
      setLoading(false);
    }
  };

  const close = () => {
    setLoading(false);
    setConfirmed(false);
    setTimeout(() => {
      onClose();
    }, 3000);
  }

  return (
    <div className="modal modal-open">
      <div className="modal-box pixel-box relative p-3">
        <ModalTopBar title={t('mint.closeMint')} onClose={onClose} />
        <div className="max-h-[calc(100vh-12rem)] overflow-y-auto p-1">
          <div className="space-y-4">
            <AlertBox title={t('common.attention')} message={t('mint.closeMintAttention', {name: token.tokenName, symbol: token.tokenSymbol})} />

            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-2">
                <input
                  type="checkbox"
                  className="checkbox checkbox-warning"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                />
                <span className="label-text">{t('mint.closeMintConfirmation')}</span>
              </label>
            </div>

            <div className="space-y-2">
              <button
                className="btn btn-error w-full"
                onClick={handleClose}
                disabled={!confirmed}
              >
                {loading ? 'Processing...' : t('mint.closeMint')}
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* <div className="modal-backdrop" onClick={() => {setConfirmed(false); onClose() }}></div> */}
    </div>
  );
};
