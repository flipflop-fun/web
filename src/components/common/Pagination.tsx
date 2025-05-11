import React from 'react';
import { PaginationProps } from '../../types/types';
import { useTranslation } from 'react-i18next';

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  hasMore = true,
}) => {
  const { t } = useTranslation();
  return (
    <div className="flex justify-between items-center mt-4">
      <div className="text-sm text-base-content mr-4">
        {t('common.showing')} {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalCount)} of {totalCount}
      </div>
      <div className="join">
        <button
          className="join-item pagination-btn btn-sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
        >
          «
        </button>
        <button
          className="join-item pagination-btn btn-sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          ‹
        </button>
        <button className="join-item pagination-btn btn-sm">
          {t('common.page')} {currentPage}
        </button>
        <button
          className="join-item pagination-btn btn-sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasMore}
        >
          ›
        </button>
        <button
          className="join-item pagination-btn btn-sm"
          disabled
        >
          »
        </button>
      </div>
    </div>
  );
};
