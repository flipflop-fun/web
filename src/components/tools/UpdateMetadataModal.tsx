import React, { useEffect, useState } from 'react';
import { TokenImage } from '../mintTokens/TokenImage';
import { InitiazlizedTokenData } from '../../types/types';
import { useConnection, useAnchorWallet } from '@solana/wallet-adapter-react';
import toast from 'react-hot-toast';
import { AddressDisplay } from '../common/AddressDisplay';
import { getTokenMetadataMutable, updateMetaData, uploadToStorage } from '../../utils/web3';
import { ToastBox } from '../common/ToastBox';
import { NETWORK_CONFIGS } from '../../config/constants';
import { HeaderImageUpload } from './HeaderImageUpload';
import AlertBox from '../common/AlertBox';
import { useDeviceType } from '../../hooks/device';
import { ModalTopBar } from '../common/ModalTopBar';
import { PublicKey } from '@solana/web3.js';
import { UriDisplay } from '../common/UriDisplay';
import { useTranslation } from 'react-i18next';

type UpdateMetadataModalProps = {
  isOpen: boolean;
  onClose: () => void;
  token: InitiazlizedTokenData;
}

export const UpdateMetadataModal: React.FC<UpdateMetadataModalProps> = ({
  isOpen,
  onClose,
  token,
}) => {
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [twitter, setTwitter] = useState('');
  const [discord, setDiscord] = useState('');
  const [telegram, setTelegram] = useState('');
  const [github, setGithub] = useState('');
  const [medium, setMedium] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [headerImage, setHeaderImage] = useState<File | null>(null);
  // const [headerPreview, setHeaderPreview] = useState<string>('');
  const { isMobile } = useDeviceType();
  const [metadataMutable, setMetadataMutable] = useState(false);

  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const { t } = useTranslation();

  useEffect(() => {
    if (token && token.tokenMetadata && token.tokenMetadata.extensions) {
      setDescription(token.tokenMetadata.description || '');
      setWebsite(token.tokenMetadata.extensions.website || '');
      setTwitter(token.tokenMetadata.extensions.twitter || '');
      setDiscord(token.tokenMetadata.extensions.discord || '');
      setTelegram(token.tokenMetadata.extensions.telegram || '');
      setGithub(token.tokenMetadata.extensions.github || '');
      setMedium(token.tokenMetadata.extensions.medium || '');
      setHeaderImage(null);

      getTokenMetadataMutable(connection, new PublicKey(token.mint)).then((isMutable: boolean) => {
        setMetadataMutable(isMutable);
      })
    }
  }, [connection, token, token.tokenMetadata, token?.tokenMetadata]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload header image to Arweave if one is selected
      let headerItemId = '';
      if (headerImage) {
        try {
          headerItemId = await uploadToStorage(headerImage, 'banner');
        } catch (error) {
          toast.error('Failed to upload header image');
          setLoading(false);
          return;
        }
      }

      const newMetadata = {
        name: token.tokenName,
        symbol: token.tokenSymbol,
        image: token.tokenMetadata?.image,
        header: headerItemId || token.tokenMetadata?.header, // Keep existing header if no new one
        description,
        extensions: {
          website,
          twitter,
          discord,
          telegram,
          github,
          medium
        }
      }

      const result = await updateMetaData(wallet, connection, token, newMetadata);
      if (result.success) {
        const network = (process.env.REACT_APP_NETWORK as keyof typeof NETWORK_CONFIGS) || "devnet";
        toast.success(
          <ToastBox
            url={`${NETWORK_CONFIGS[network].scanUrl}/tx/${result.data?.tx}?cluster=${network}`}
            urlText="View transaction"
            title={result.message as string}
          />
        );
        close();
      } else {
        toast.error("UpdateMetadataModal: " + result.message as string);
      }
    } catch (error) {
      toast.error('Failed to update metadata');
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
        <ModalTopBar title={t('tokenInfo.metadata')} onClose={onClose} />
        <div className="max-h-[calc(100vh-12rem)] overflow-y-auto p-1">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Token Logo and Basic Info */}
            <div className="pixel-box flex items-center space-x-6 bg-base-200/50 p-4">
              <div className="w-16 h-16 flex-shrink-0">
                <TokenImage
                  imageUrl={token.tokenMetadata?.image as string}
                  name={token.tokenName}
                  metadataTimestamp={Number(token.metadataTimestamp)}
                />
              </div>
              <div className="flex-1 min-w-0 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="badge badge-md badge-secondary px-3">{token.tokenSymbol}</h4>
                  <div className="text-base truncate ml-3">{token.tokenName}</div>
                </div>
                <div className="flex gap-2 text-sm text-base-content/70">
                  <span className="font-semibold">{t('tokenInfo.tokenAddress')}:</span>
                  <span className="font-pixel">
                    <AddressDisplay address={token.mint} showCharacters={isMobile ? 5 : 10} />
                  </span>
                </div>
                <div className="flex gap-2 text-sm text-base-content/70">
                  <span className="font-semibold">
                    <UriDisplay uri={token.tokenUri} text={t('tokenInfo.metadataJson')} showCharacters={0} />
                  </span>
                </div>
              </div>
            </div>

            {/* Header Image Upload */}
            <div className="mb-6">
              <HeaderImageUpload
                onImageChange={(file) => setHeaderImage(file)}
                currentHeader={token.tokenMetadata?.header}
              />
            </div>

            {/* Description */}
            <div>
              <label className="label">
                <span className="font-semibold">{t('launch.description')}</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="pixel-textarea textarea-bordered w-full h-24"
                placeholder={t('placeholder.socialInformationDescription')}
              />
            </div>

            {/* Social Information */}
            <div className="space-y-4">
              <h4 className="font-semibold">{t('launch.socialInformation')}</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Website */}
                <div>
                  <label className="label">
                    <span className="label-text">{t('launch.website')}</span>
                  </label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="input input-bordered w-full"
                    placeholder={t('placeholder.socialInformationWebsite')}
                  />
                </div>

                {/* Twitter */}
                <div>
                  <label className="label">
                    <span className="label-text">{t('launch.twitter')}</span>
                  </label>
                  <input
                    type="url"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    className="input input-bordered w-full"
                    placeholder={t('placeholder.socialInformationTwitter')}
                  />
                </div>

                {/* Discord */}
                <div>
                  <label className="label">
                    <span className="label-text">{t('launch.discord')}</span>
                  </label>
                  <input
                    type="url"
                    value={discord}
                    onChange={(e) => setDiscord(e.target.value)}
                    className="input input-bordered w-full"
                    placeholder={t('placeholder.socialInformationDiscord')}
                  />
                </div>

                {/* Telegram */}
                <div>
                  <label className="label">
                    <span className="label-text">{t('launch.telegram')}</span>
                  </label>
                  <input
                    type="url"
                    value={telegram}
                    onChange={(e) => setTelegram(e.target.value)}
                    className="input input-bordered w-full"
                    placeholder={t('placeholder.socialInformationTelegram')}
                  />
                </div>

                {/* GitHub */}
                <div>
                  <label className="label">
                    <span className="label-text">{t('launch.github')}</span>
                  </label>
                  <input
                    type="url"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    className="input input-bordered w-full"
                    placeholder={t('placeholder.socialInformationGithub')}
                  />
                </div>

                {/* Medium */}
                <div>
                  <label className="label">
                    <span className="label-text">{t('launch.medium')}</span>
                  </label>
                  <input
                    type="url"
                    value={medium}
                    onChange={(e) => setMedium(e.target.value)}
                    className="input input-bordered w-full"
                    placeholder={t('placeholder.socialInformationMedium')}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            {metadataMutable ? (
              <div className="space-y-4">
                <AlertBox title={t('common.attention')} message={t('launch.updateMetadataAttention')} />

                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-3">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-warning"
                      checked={isConfirmed}
                      onChange={(e) => setIsConfirmed(e.target.checked)}
                    />
                    <span className="label-text">{t('launch.updateMetadataConfirmation')}</span>
                  </label>
                </div>

                <div className="modal-action">
                  <button
                    type="submit"
                    className={`btn btn-primary`}
                    disabled={loading || !isConfirmed}
                  >
                    {loading ? t('launch.updateMetadata') + '...' : t('launch.updateMetadata')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <AlertBox title={t('common.attention')} message={t('launch.tokenMetadataIsImmutable')} />
              </div>
            )}

          </form>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
};
