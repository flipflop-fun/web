import React, { useCallback, useEffect, useState } from 'react';
import { InitiazlizedTokenData } from '../../types/types';
import { useConnection, useAnchorWallet } from '@solana/wallet-adapter-react';
import toast from 'react-hot-toast';
import { ModalTopBar } from '../common/ModalTopBar';
import { revokeMetadataUpdateAuthority, delegateValueManager, getTokenMetadataMutable } from '../../utils/web3';
import { PublicKey } from '@solana/web3.js';
import AlertBox from '../common/AlertBox';
import { NETWORK, SCANURL } from '../../config/constants';
import { ToastBox } from '../common/ToastBox';
import { SYSTEM_PROGRAM_ID } from '@raydium-io/raydium-sdk-v2';
import { useTranslation } from 'react-i18next';

type UpdateAuthoritiesModalProps = {
  isOpen: boolean;
  onClose: () => void;
  token: InitiazlizedTokenData;
}

export const UpdateAuthoritiesModal: React.FC<UpdateAuthoritiesModalProps> = ({
  isOpen,
  onClose,
  token,
}) => {
  const [loading, setLoading] = useState(false);
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const [metadataMutable, setMetadataMutable] = useState(false);
  const [valueManager, setValueManager] = useState("");
  const { t } = useTranslation();

  const getMetadataMutable = useCallback(async () => {
    const isMutable = await getTokenMetadataMutable(connection, new PublicKey(token.mint));
    setMetadataMutable(isMutable);
  }, [connection, token.mint]);

  useEffect(() => {
    const fetchAuthorities = async () => {
      if (isOpen && token.mint) {
        try {
          if (token.valueManager !== SYSTEM_PROGRAM_ID.toString()) setValueManager(token.valueManager)
          else setValueManager("");
          await getMetadataMutable();
        } catch (error) {
          console.error('Error fetching authorities:', error);
          toast.error('Failed to fetch authorities');
        }
      }
    };

    fetchAuthorities();
  }, [isOpen, token, connection, getMetadataMutable]);

  const handleRevokeMetadataAuthority = async () => {
    setLoading(true);
    try {
      const result = await revokeMetadataUpdateAuthority(wallet, connection, token);
      if (!result.success) {
        throw new Error(result.message);
      }
      toast.success('Successfully gave up metadata update authority');

      // Refresh the metadata authority
      await getMetadataMutable();
    } catch (error: any) {
      toast.error("UpdateAuthoritiesModal.handleRevokeMetadataAuthority: " + error.message || 'Failed to give up metadata update authority');
    } finally {
      setLoading(false);
    }
  };

  const handleDelegateValueManager = async () => {
    setLoading(true);
    const toastId = toast.loading('Delegating value manager...', {
      style: {
        background: 'var(--fallback-b1,oklch(var(--b1)))',
        color: 'var(--fallback-bc,oklch(var(--bc)))',
      },
    });
    try {
      const result = await delegateValueManager(wallet, connection, token, valueManager);
      if (!result.success) {
        throw new Error(result.message);
      }
      toast.success(
        <ToastBox
          url={`${SCANURL}/tx/${result.data?.tx}?cluster=${NETWORK}`}
          urlText="View transaction"
          title="Value manager delegated successfully!"
        />,
        {
          id: toastId,
        }
      );
    } catch (error: any) {
      toast.error("UpdateAuthoritiesModal.handleDelegateValueManager: " + error.message || 'Failed to delegate value manager');
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box pixel-box relative p-3">
        <ModalTopBar title={t('launch.updateAuthorities')} onClose={onClose} />
        <div className="flex flex-col gap-4 mt-4">
          <div className="text-sm">
            <p>{t('launch.medateUpdatable')}: {metadataMutable ? t('launch.mutable') : t('launch.immutable')}</p>
          </div>
          <button
            onClick={handleRevokeMetadataAuthority}
            disabled={loading || !metadataMutable}
            className="btn w-full btn-primary"
          >
            {t('launch.revokeMetadataUpdate')}
          </button>

          <div className="text-sm">
            <p className="mb-2">
              {t('social.vmManager')}
            </p>
            <AlertBox message={t('launch.delegateVmMangerDescription')} title={t('common.attention')} />
            <div className="flex justify-between items-center mt-3">
              <input
                type="text"
                value={valueManager}
                onChange={(e) => setValueManager(e.target.value)}
                className='input w-full'
                placeholder="Enter your value manager account"
              />
            </div>


          </div>
          <button
            onClick={handleDelegateValueManager}
            className="btn w-full btn-primary"
          >
            {t('launch.delegateVmManager')}
          </button>

        </div>
      </div>
    </div>
  );
};
