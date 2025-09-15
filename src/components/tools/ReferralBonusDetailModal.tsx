import React, { useEffect, useState } from 'react';
import { queryTotalReferrerBonus } from '../../utils/graphql2';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { AddressDisplay } from '../common/AddressDisplay';
import { formatPrice, formatTimestamp } from '../../utils/format';
import { Pagination } from '../common/Pagination';
import { NETWORK_CONFIGS, PAGE_SIZE_OPTIONS } from '../../config/constants';
import { ErrorBox } from '../common/ErrorBox';
import { ModalTopBar } from '../common/ModalTopBar';
import { useTranslation } from 'react-i18next';
import { useGraphQuery } from '../../hooks/graphquery';

type ReferralBonusDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  mint: string;
  referrerMain: string;
  totalBonus: number;
}

export const ReferralBonusDetailModal: React.FC<ReferralBonusDetailModalProps> = ({
  isOpen,
  onClose,
  mint,
  referrerMain,
  totalBonus
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const { t } = useTranslation();
  const subgraphUrl = NETWORK_CONFIGS[(process.env.REACT_APP_NETWORK as keyof typeof NETWORK_CONFIGS) || "devnet"].subgraphUrl2;
  const { loading, error, data, refetch } = useGraphQuery(
    subgraphUrl,
    queryTotalReferrerBonus,
    {
      mint,
      referrerMain,
    },
    {
      auto: false,
    }
  );

  useEffect(() => {
    if (!isOpen) return;
    if (!mint || !referrerMain) return;
    refetch({ mint, referrerMain });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, mint, referrerMain]);

   if (!isOpen) return null;

  if (loading) return (
    <div className="modal modal-open">
      <div className="modal-box pixel-box flex justify-center items-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    </div>
  );

  if (error) return (
    <ErrorBox title="Error" message={error.message} />
  );

  const paginatedEntities = data?.allMintTokenEntities.nodes.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalPages = Math.ceil(data?.allMintTokenEntities.totalCount / pageSize);

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = Number(event.target.value);
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box pixel-box w-11/12 max-w-5xl">
        <ModalTopBar title={t('urc.urcDetails')} onClose={onClose} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="pixel-card">
            <div className="pixel-card-body">
              <h4 className="pixel-card-title">{t('urc.summary')}</h4>
              <div className="space-y-2">
                <div>{t('urc.totalReferral')}:
                  <span className="font-bold text-primary">
                  {formatPrice(totalBonus, 3)} SOL
                  </span>
                </div>
                <div>{t('urc.referralCount')}: {data?.allMintTokenEntities.totalCount}</div>
              </div>
            </div>
          </div>
          <div className="pixel-card">
            <div className="pixel-card-body">
              <h4 className="pixel-card-title">{t('urc.tokenInformation')}</h4>
              <div className="space-y-2">
                <div className="flex gap-1">{t('tokenInfo.tokenAddress')}: <AddressDisplay address={mint} /></div>
                <div className="flex gap-1">{t('urc.referrer')}:  <AddressDisplay address={referrerMain} /></div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mb-4">
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

        <div className="overflow-x-auto mt-6">
          <table className="pixel-table w-full">
            <thead>
              <tr>
                <th className=''>{t('tokenInfo.transactionId')}</th>
                <th className=''>{t('tokenInfo.minter')}</th>
                <th className=''>{t('common.time')}</th>
                <th className=''>{t('common.checkpoint')}</th>
                <th className=''>{t('tokenInfo.referrerFee')}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedEntities && paginatedEntities.map((entity: any, index: number) => (
                <tr key={index}>
                  <td className=''><AddressDisplay address={entity.txId} type='transaction' /></td>
                  <td className=''><AddressDisplay address={entity.sender} /></td>
                  <td className=''>{formatTimestamp(parseInt(entity.timestamp))}</td>
                  <td className=''>{entity.currentEpoch}</td>
                  <td className=''>{formatPrice(parseFloat(entity.referrerFee) / LAMPORTS_PER_SOL, 3)} SOL</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={data?.allMintTokenEntities.totalCount}
            pageSize={pageSize}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </div>
    </div>
  );
};
