import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { FC, useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { queryMyTokenList, queryTokensByMints } from '../utils/graphql';
import { InitiazlizedTokenData, MyAccountProps, TokenListItem, TokenMetadataIPFS } from '../types/types';
import { AddressDisplay } from '../components/common/AddressDisplay';
import { TokenImage } from '../components/mintTokens/TokenImage';
import { fetchMetadata } from '../utils/web3';
import { BN_LAMPORTS_PER_SOL, BN_ZERO, filterTokenListItem, filterTokens, numberStringToBN } from '../utils/format';
import { useNavigate } from 'react-router-dom';
import { ReferralCodeModal } from '../components/myAccount/ReferralCodeModal';
import { RefundModal } from '../components/myAccount/RefundModal';
import { Pagination } from '../components/common/Pagination';
import { PAGE_SIZE_OPTIONS } from '../config/constants';
import { useDeviceType } from '../hooks/device';
import { MyMintedTokenCard } from '../components/myAccount/MyMintedTokenCard';
import { PageHeader } from '../components/common/PageHeader';
import { useTranslation } from 'react-i18next';

export const MyMintedTokens: FC<MyAccountProps> = ({ expanded }) => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const navigate = useNavigate();
  // const [balance, setBalance] = useState(0);
  const [tokenList, setTokenList] = useState<TokenListItem[]>([]);
  const [searchMints, setSearchMints] = useState<string[]>([]);
  const [selectedTokenForReferral, setSelectedTokenForReferral] = useState<TokenListItem | null>(null);
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [selectedTokenForRefund, setSelectedTokenForRefund] = useState<TokenListItem | null>(null);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  // const [frozenStates, setFrozenStates] = useState<{ [key: string]: boolean | null }>({});

  const { isMobile } = useDeviceType();
  const { t } = useTranslation();
  const { data: myTokensData, loading: loadingTokens } = useQuery(queryMyTokenList, {
    variables: {
      owner: wallet?.publicKey?.toBase58() || '',
      skip: (currentPage - 1) * pageSize,
      first: pageSize
    },
    skip: !wallet?.publicKey,
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first'
  });

  const { data: tokenDetailsData, loading: loadingDetails } = useQuery(queryTokensByMints, {
    variables: {
      mints: searchMints,
      skip: 0,
      first: 100
    },
    skip: searchMints.length === 0,
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first'
  });

  useEffect(() => {
    if (!wallet?.publicKey) return;

    // const getBalance = async () => {
    //   try {
    //     const balance = await connection.getBalance(wallet?.publicKey);
    //     setBalance(balance / LAMPORTS_PER_SOL);
    //   } catch (e) {
    //     console.error('Error getting balance:', e);
    //   }
    // };

    // getBalance();
    const id = connection.onAccountChange(wallet.publicKey, (account) => {
      // setBalance(account.lamports / LAMPORTS_PER_SOL);
    });

    return () => {
      connection.removeAccountChangeListener(id);
    };
  }, [connection, wallet?.publicKey]);

  useEffect(() => {
    if (myTokensData?.holdersEntities) {
      // console.log('myTokensData', myTokensData?.holdersEntities)
      const tokensAfterFilter = filterTokenListItem(myTokensData?.holdersEntities);
      const mints = tokensAfterFilter.map((token: TokenListItem) => token.mint);
      setSearchMints(mints);
      setTokenList(tokensAfterFilter);
      setTotalCount(Math.max(totalCount, (currentPage - 1) * pageSize + (mints.length ?? 0)));
    }
  }, [currentPage, myTokensData, pageSize, totalCount]);

  useEffect(() => {
    const tokenEventEntities = filterTokens(tokenDetailsData?.initializeTokenEventEntities);

    if (tokenEventEntities) {
      const updatedTokenList = tokenList.map(token => ({
        ...token,
        tokenData: tokenEventEntities.find(
          (event: InitiazlizedTokenData) => event.mint === token.mint
        )
      }));
      setTokenList(updatedTokenList);

      // Fetch token images
      updatedTokenList.forEach(async (token) => {
        if (token.tokenData?.tokenUri) {
          try {
            const data = await fetchMetadata(token.tokenData as InitiazlizedTokenData);
            setTokenList(currentList =>
              currentList.map(t =>
                t.mint === token.mint
                  ? { ...t, metadata: data as TokenMetadataIPFS }
                  : t
              )
            );
          } catch (error) {
            console.error('Error fetching token image:', error);
          }
        }
      });
    }
  }, [tokenDetailsData]);

  const handleRefund = (token: TokenListItem) => {
    setSelectedTokenForRefund(token);
    setIsRefundModalOpen(true);
  };

  if (!wallet?.publicKey) {
    return (
      <div className='flex justify-center items-center'>
        <div className="card w-96 bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">{t('menu.myTokens')}</h2>
            <p>Please connect your wallet to view your account</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-0 md:p-4 md:mb-20 ${expanded ? 'md:ml-64' : 'md:ml-20'}`} key={wallet?.publicKey?.toBase58()}>
      <PageHeader title={t('menu.myTokens')} bgImage='/bg/group1/3.jpg' />
      <div className="w-full md:max-w-6xl mx-auto md:mb-20 mb-3">
        {loadingTokens || loadingDetails ? (
          <div className="flex justify-center">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : tokenList.filter(token => numberStringToBN(token.amount).gt(BN_ZERO)).length === 0 ? (
          <p>No tokens found</p>
        ) : !isMobile ? (
          <>
            <div className="flex justify-end mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-base-content">Rows per page:</span>
                <select
                  className="select select-bordered select-sm"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  {PAGE_SIZE_OPTIONS.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
            </div>
            <table className="pixel-table w-full">
              <thead>
                <tr>
                  <th className=" text-left">{t('tokenInfo.logo')}</th>
                  <th className=" text-left">{t('launch.tokenName')}/{t('launch.tokenSymbol')}</th>
                  <th className=" text-left">{t('tokenInfo.tokenAddress')}</th>
                  <th className=" text-right">{t('common.milestone')}</th>
                  {/* <th className=" text-right">Status</th> */}
                  <th className=" text-right">{t('mint.minted')}</th>
                  <th className=" text-center">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {tokenList
                  .filter(token => numberStringToBN(token.amount).gt(BN_ZERO))
                  .map((token: TokenListItem) => (
                    <tr key={token.mint} className="hover">
                      <td className=" text-left">
                        {token.metadata?.image && (
                          <TokenImage
                            imageUrl={token.metadata?.image}
                            name={token.tokenData?.tokenName || 'Unknown'}
                            metadataTimestamp={Number(token.tokenData?.metadataTimestamp) || 0}
                            size={48}
                            className="w-12 h-12 rounded-full"
                          />
                        )}
                      </td>
                      <td className=" text-left">
                        <div className="font-bold">{token.tokenData?.tokenName || 'Unknown'}</div>
                        <div className="text-sm opacity-50">{token.tokenData?.tokenSymbol || 'Unknown'}</div>
                      </td>
                      <td className=" text-left">
                        <AddressDisplay address={token.mint} />
                      </td>
                      <td className=" text-right">
                        {token.tokenData?.currentEra || '1'}
                      </td>
                      {/* <td className=' text-right'>
                                                {frozenStates[token.mint] !== undefined ? (frozenStates[token.mint] ? 
                                                    <svg fill="none" className='w-4 h-4 text-error' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M15 2H9v2H7v4H4v14h16V8h-3V4h-2V2zm0 2v4H9V4h6zm-6 6h9v10H6V10h3zm4 3h-2v4h2v-4z" fill="currentColor"/> </svg> 
                                                    : 
                                                    <svg fill="none" className='w-4 h-4 text-success' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M15 2H9v2H7v2h2V4h6v4H4v14h16V8h-3V4h-2V2zm0 8h3v10H6V10h9zm-2 3h-2v4h2v-4z" fill="currentColor"/> </svg>) 
                                                    : 'Loading...'}
                                            </td> */}
                      <td className=" text-right">
                        {(numberStringToBN(token.amount).div(BN_LAMPORTS_PER_SOL)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                      </td>
                      <td className=" text-center">
                        <div className="flex gap-2 justify-end">
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => navigate(`/token/${token.mint}`)}
                          >
                            {t('mint.mintMore')}
                          </button>
                          <button
                            className="btn btn-sm btn-error"
                            onClick={() => handleRefund(token)}
                          >
                            {t('mint.refund')}
                          </button>
                          <button
                            className="btn btn-sm btn-accent"
                            onClick={() => {
                              setSelectedTokenForReferral(token);
                              setIsReferralModalOpen(true);
                            }}
                          >
                            {t('common.urc')}
                          </button>
                          {/* {Number(token.tokenData?.currentEra) > Number(token.tokenData?.targetEras) && frozenStates[token.mint] && (
                                                    <button 
                                                        className="btn btn-sm btn-info"
                                                        onClick={() => handleThaw(token)}
                                                    >
                                                        Thaw
                                                    </button>)} */}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {/* </div> */}
            <div className="mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(totalCount / pageSize)}
                totalCount={totalCount}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                hasMore={(currentPage * pageSize) < totalCount}
              />
            </div>
          </>
        ) : (
          <>
            {tokenList.filter(token => numberStringToBN(token.amount).gt(BN_ZERO)).map((token: TokenListItem) =>
              <MyMintedTokenCard
                key={token.mint}
                token={token}
                onRefund={handleRefund}
                onCode={(token) => {
                  setSelectedTokenForReferral(token);
                  setIsReferralModalOpen(true);
                }}
              />)}
          </>
        )
        }
      </div>
      {selectedTokenForReferral && (
        <ReferralCodeModal
          isOpen={isReferralModalOpen}
          onClose={() => {
            setIsReferralModalOpen(false);
            setSelectedTokenForReferral(null);
          }}
          token={selectedTokenForReferral}
          metadata={tokenList.find((token: TokenListItem) => token.mint === selectedTokenForReferral.mint)?.metadata as TokenMetadataIPFS}
        />
      )}
      {selectedTokenForRefund && (
        <RefundModal
          isOpen={isRefundModalOpen}
          onClose={() => {
            setIsRefundModalOpen(false);
            setSelectedTokenForRefund(null);
          }}
          token={selectedTokenForRefund}
        />
      )}
    </div>
  );
};
