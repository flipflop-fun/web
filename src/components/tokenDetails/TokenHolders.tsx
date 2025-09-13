import React, { useState } from 'react';
import { HolderData, TokenHoldersProps } from '../../types/types';
import { AddressDisplay } from '../common/AddressDisplay';
import { Pagination } from '../common/Pagination';
import { queryHolders } from '../../utils/graphql2';
import { BN_ZERO, numberStringToBN, safeLamportBNToUiNumber } from '../../utils/format';
import { NETWORK_CONFIGS, PAGE_SIZE_OPTIONS } from '../../config/constants';
import { ErrorBox } from '../common/ErrorBox';
import { useTranslation } from 'react-i18next';
import { useGraphQuery } from '../../hooks/graphquery';

export const TokenHolders: React.FC<TokenHoldersProps> = ({ token }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const { t } = useTranslation();
  const subgraphUrl = NETWORK_CONFIGS[(process.env.REACT_APP_NETWORK as keyof typeof NETWORK_CONFIGS) || "devnet"].subgraphUrl2;

  const { data, loading, error } = useGraphQuery(subgraphUrl, queryHolders, {
      mint: token.mint,
      offset: (currentPage - 1) * pageSize,
      first: pageSize
    }, {
      onCompleted: (data) => {
        setTotalCount(data.allHoldersEntities?.totalCount as number);
    }
  });

  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = Number(event.target.value);
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  if (loading && currentPage === 1) {
    return (
      <div className="bg-base-200 rounded-lg shadow-lg p-6 mt-6">
        <h3 className="text-xl font-semibold mb-4 text-base-content">{t('tokenInfo.tokenHolders')}</h3>
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
      <div className="bg-base-200 rounded-lg shadow-lg p-6 mt-6">
        <ErrorBox title="Get token holders error" message={error.message} />
      </div>
    );
  }

  return (
    <div className="pixel-box bg-base-200 p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-base-content">{t('tokenInfo.tokenHolders')}</h3>
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
              <th className="">{t('tokenInfo.rank')}</th>
              <th className="">{t('tokenInfo.holder')}</th>
              <th className="">{t('tokenInfo.balance')}</th>
              <th className="">{t('tokenInfo.holdPercentage')}</th>
            </tr>
          </thead>
          <tbody>
            {data?.allHoldersEntities?.nodes
              .filter((holder: HolderData) => numberStringToBN(holder.amount).gt(BN_ZERO))
              .map((holder: HolderData, index: number) => {
                const totalSupply = safeLamportBNToUiNumber(token.supply, 2);
                const balance = safeLamportBNToUiNumber(holder.amount, 2);
                const percentage = balance / totalSupply / 100;
                return (
                  <tr key={holder.owner + index}>
                    <td className="">{(currentPage - 1) * pageSize + index + 1}</td>
                    <td className=""><AddressDisplay address={holder.owner} /></td>
                    <td className="">{balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                    <td className="">{(percentage * 10000).toFixed(2)}%</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};
