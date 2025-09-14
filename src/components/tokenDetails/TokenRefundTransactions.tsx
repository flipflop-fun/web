import React, { useEffect, useState } from 'react';
import { queryTokenRefundTransactions } from '../../utils/graphql2';
import { AddressDisplay } from '../common/AddressDisplay';
import { RefundTransactionData, TokenRefundTransactionsProps } from '../../types/types';
import { Pagination } from '../common/Pagination';
import { safeLamportBNToUiNumber } from '../../utils/format';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { NETWORK_CONFIGS, PAGE_SIZE_OPTIONS } from '../../config/constants';
import { ErrorBox } from '../common/ErrorBox';
import { useTranslation } from 'react-i18next';
import { useGraphQuery } from '../../hooks/graphquery';

export const TokenRefundTransactions: React.FC<TokenRefundTransactionsProps> = ({ token }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const { t } = useTranslation();
  const subgraphUrl = NETWORK_CONFIGS[(process.env.REACT_APP_NETWORK as keyof typeof NETWORK_CONFIGS) || "devnet"].subgraphUrl2;

  const { data, loading, error, refetch } = useGraphQuery(subgraphUrl, queryTokenRefundTransactions, {
      mint: token.mint,
      offset: (currentPage - 1) * pageSize,
      first: pageSize
    }, {
      onCompleted: (data) => {
        setHasMore(data?.allRefundEventEntities?.totalCount >= pageSize)
        setTotalCount(data?.allRefundEventEntities?.totalCount);
      }
    }
  );

  const goToPage = async (page: number) => {
    const nextOffset = (page - 1) * pageSize;
    await refetch({mint: token.mint, offset: nextOffset, first: pageSize });
  };

  useEffect(() => {
    goToPage(currentPage);
  }, [currentPage])
  const totalPages = hasMore ? currentPage + 1 : currentPage;

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = Number(event.target.value);
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
    setHasMore(true);
  };

  if (loading && currentPage === 1) {
    return (
      <div className="pixel-box bg-base-200 p-6 mt-6">
        <h3 className="text-xl font-semibold mb-4 text-base-content">{t('tokenInfo.recentRefund')}</h3>
        <div className="animate-pulse">
          <div className="h-8 bg-base-300 rounded mb-4"></div>
          <div className="h-8 bg-base-300 rounded mb-4"></div>
          <div className="h-8 bg-base-300 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pixel-box bg-base-200 p-6 mt-6">
        <ErrorBox title="Get refund transactions error" message={error.message} />
      </div>
    );
  }

  return (
    <div className="pixel-box bg-base-200 p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-base-content">{t('tokenInfo.recentRefund')}</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-base-content">{t('common.rowsPerPage')}:</span>
          <select
            className="select select-bordered select-sm"
            value={pageSize}
            onChange={handlePageSizeChange}
          >
            {PAGE_SIZE_OPTIONS.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="pixel-table w-full">
          <thead>
            <tr>
              <th className="">{t('tokenInfo.refunder')}</th>
              <th className="">{t('tokenInfo.transactionId')}</th>
              <th className="">{t('common.time')}</th>
              <th className="">{t('tokenInfo.refundSol')}</th>
              <th className="">{`${t('tokenInfo.burn')} (${t('tokenInfo.user')}+${t('tokenInfo.vault')})`}</th>
            </tr>
          </thead>
          <tbody>
            {data && data.allRefundEventEntities ? data.allRefundEventEntities.nodes.map((tx: RefundTransactionData) => (
              <tr key={tx.txId}>
                <td className=""><AddressDisplay address={tx.sender} /></td>
                <td className=""><AddressDisplay address={tx.txId} type="tx" /></td>
                <td className="">{new Date(Number(tx.timestamp) * 1000).toLocaleString()}</td>
                <td className="">{Number(tx.refundAmountIncludingFee) / LAMPORTS_PER_SOL}</td>
                <td className="">{safeLamportBNToUiNumber(tx.burnAmountFromUser).toLocaleString()} + {safeLamportBNToUiNumber(tx.burnAmountFromVault).toLocaleString()}</td>
              </tr>
            )) : Array.from({ length: pageSize }, (_, index) => (
              <tr key={`placeholder-${index}`} className="opacity-50">
                <td colSpan={5} className="text-center bg-base-300">
                  {loading ? '...' : 'No data available'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        hasMore={hasMore}
      />
    </div>
  );
};
