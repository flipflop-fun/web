import { FC, useState } from 'react';
import toast from 'react-hot-toast';
import { useConnection, useAnchorWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getReferralDataByCodeHash, getReferrerCodeHash, getTokenBalance } from '../../utils/web3';
import { AddressDisplay } from '../common/AddressDisplay';
import { CheckURCProps, SetRefererCodeEntity } from '../../types/types';
import { FaSearch } from 'react-icons/fa';
import { PageHeader } from '../common/PageHeader';
import { useTranslation } from 'react-i18next';

export const CheckURC: FC<CheckURCProps> = ({ expanded }) => {
  const { connection } = useConnection();
  const { t } = useTranslation();
  const wallet = useAnchorWallet();
  const [searchId, setSearchId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [searchResult, setSearchResult] = useState<SetRefererCodeEntity | null>(null);
  const [loading, setLoading] = useState(false);
  const [referralLink, setReferralLink] = useState('');

  const handleSearch = () => {
    if (!searchId.trim()) {
      setErrorMessage('Please enter an ID to search');
      return;
    }
    setLoading(true);

    const codeHashData = getReferrerCodeHash(wallet, connection, searchId.trim());
    console.log("###### codeHashData: " + codeHashData.data?.toString() + " ######")
    if (codeHashData.success) {
      getReferralDataByCodeHash(wallet, connection, codeHashData.data as PublicKey).then(async (result) => {
        if (result?.success && result.data) {
          setSearchResult({
            mint: result.data.mint.toBase58(),
            referrerMain: result.data.referrerMain.toBase58(),
            referrerAta: result.data.referrerAta.toBase58(),
            referralAccount: result.data.referralAccount.toBase58(),
            usageCount: result.data.usageCount,
            activeTimestamp: result.data.activeTimestamp.toNumber(),
            codeHash: result.data.codeHash.toString(),
            tokenBalance: await getTokenBalance(result.data.referrerAta, connection),
          } as SetRefererCodeEntity);
          setReferralLink(
            `${window.location.origin}/token/${result.data.mint.toBase58()}/${searchId.trim()}`
          );
          setLoading(false);
          setErrorMessage('');
        } else {
          setErrorMessage(result.message as string);
          setSearchResult(null);
          setLoading(false);
        }
      });
    } else {
      setErrorMessage(codeHashData.message as string);
      setSearchResult(null);
      setLoading(false);
    }
  };

  return (
    <div className={`space-y-0 md:p-4 md:mb-20 ${expanded ? "md:ml-64" : "md:ml-20"}`}>
      <PageHeader title={t('menu.validateUrc')} bgImage='/bg/group1/6.jpg' />
      <div className="md:max-w-5xl mx-auto w-full flex flex-col gap-4">
        <div className="join w-full">
          <div className='relative join-item flex-1'>
            <input
              type="text"
              placeholder={t('urc.enterUrc')}
              className='input search-input w-full pl-10'
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <button
            className="search-btn join-item btn-primary w-24"
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? <span className="loading loading-spinner loading-sm"></span> : t('discover.search')}
          </button>
        </div>

        {searchResult && searchResult.codeHash === getReferrerCodeHash(wallet, connection, searchId.trim()).data?.toString() && searchId && (
          <div className="pixel-box bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">{t('urc.urcDetails')}</h2>
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <tbody>
                    {searchResult && (
                      <>
                        <tr>
                          <td className="font-bold w-1/3">{t('urc.codeHash')}</td>
                          <td className="flex items-center gap-2">
                            <div>{searchResult.codeHash}</div>
                            <div className="badge badge-success">{t('urc.verified')}</div>
                          </td>
                        </tr>
                        <tr>
                          <td className="font-bold">{t('urc.urcReferralUrl')}</td>
                          <td className="flex items-start gap-2">
                            <div className="relative flex-1 min-w-0">
                              <span className="block line-clamp-3 pr-2 text-sm break-all leading-5">
                                {referralLink}
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(referralLink);
                                toast.success(t('common.copied'));
                              }}
                              className="btn btn-sm w-8 h-8 p-0"
                              title={t('common.copyLink')}
                            >
                              <svg className='w-4 h-4' fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M4 2h11v2H6v13H4V2zm4 4h12v16H8V6zm2 2v12h8V8h-8z" fill="currentColor" /> </svg>
                            </button>
                          </td>
                        </tr>
                        <tr>
                          <td className="font-bold">{t('urc.currentUsedCount')}</td>
                          <td>{searchResult.usageCount}</td>
                        </tr>
                        <tr>
                          <td className="font-bold">{t('urc.activateTime')}</td>
                          <td>{new Date(searchResult.activeTimestamp * 1000).toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td className="font-bold">{t('urc.referrerTokenBalance')}</td>
                          <td>{searchResult.tokenBalance?.toLocaleString()}</td>
                        </tr>
                      </>
                    )}
                    <tr>
                      <td className="font-bold">{t('tokenInfo.tokenAddress')}</td>
                      <td>
                        {<AddressDisplay address={searchResult.mint} showCharacters={6} />}
                      </td>
                    </tr>
                    <tr>
                      <td className="font-bold">{t('urc.providerMainAccount')}</td>
                      <td>
                        {<AddressDisplay address={searchResult.referrerMain} showCharacters={6} />}
                      </td>
                    </tr>
                    <tr>
                      <td className="font-bold">{t('urc.providerTokenAccount')}</td>
                      <td>
                        {<AddressDisplay address={searchResult.referrerAta} showCharacters={6} />}
                      </td>
                    </tr>
                    <tr>
                      <td className="font-bold">{t('urc.urcAccount')}</td>
                      <td>
                        {<AddressDisplay address={searchResult.referralAccount} showCharacters={6} />}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )
        }
        {errorMessage &&
          <div className='text-red-500'>
            {errorMessage}
          </div>
        }
      </div>
    </div>
  );
};