import React, { useState, KeyboardEvent, useEffect, useMemo } from 'react';
import { queryInitializeTokenEvent, queryInitializeTokenEventBySearch, queryHotInitializeTokenEvent, queryInitializeTokenEventGraduated, queryHotInitializeTokenEventGraduated, queryInitializeTokenEventBySearchGraduated } from '../utils/graphql2';
import { InitiazlizedTokenData, DiscoverProps } from '../types/types';
import { FaSearch } from 'react-icons/fa';
import { ErrorBox } from '../components/common/ErrorBox';
import { filterTokens, formatAddress } from '../utils/format';
import { BADGE_BG_COLORS, BADGE_TEXT_COLORS, NETWORK_CONFIGS, SEARCH_CACHE_ITEMS } from '../config/constants';
import { TokenCardWeb } from '../components/mintTokens/TokenCardWeb';
import { PageHeader } from '../components/common/PageHeader';
import { useDeviceType } from '../hooks/device';
import { ScrollCards } from '../components/common/ScrollCards';
import { TokenCardSimple } from '../components/mintTokens/TokenCardSimple';
import { useTranslation } from 'react-i18next';
import { runGraphQuery, useGraphQuery } from '../hooks/graphquery';

export const Discover: React.FC<DiscoverProps> = ({
  expanded,
  hasDelegatedTokens,
  graduatedToken,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchData, setSearchData] = useState<any | null>(null);
  const { isMobile } = useDeviceType();
  const { t } = useTranslation();
  const subgraphUrl = NETWORK_CONFIGS[(process.env.REACT_APP_NETWORK as keyof typeof NETWORK_CONFIGS) || "devnet"].subgraphUrl2;
  // Pagination page size
  const PAGE_SIZE = 12;
  // Pagination states for Latest and Hottest sections
  const [latestPage, setLatestPage] = useState(1);
  const [hotPage, setHotPage] = useState(1);

  // Reset pages when graduatedToken toggles to keep pagination valid
  useEffect(() => {
    setLatestPage(1);
    setHotPage(1);
  }, [graduatedToken]);

  // Load search history on component mount
  useEffect(() => {
    const history = localStorage.getItem('search_history');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  // Save search term to history
  const saveToHistory = (term: string) => {
    const newHistory = [term, ...searchHistory.filter(item => item !== term)].slice(0, SEARCH_CACHE_ITEMS);
    setSearchHistory(newHistory);
    localStorage.setItem('search_history', JSON.stringify(newHistory));
  };

  const { loading: initialLoading, error: initialError, data: latestData, refetch: refetchLatest } = useGraphQuery(
    subgraphUrl,
    graduatedToken ? queryInitializeTokenEventGraduated : queryInitializeTokenEvent, {
      first: PAGE_SIZE,
      offset: (latestPage - 1) * PAGE_SIZE,
      targetEras: 1,
    },
    { auto: false }
  );

  const { loading: hotLoading, error: hotError, data: hotData, refetch: refetchHot } = useGraphQuery(
    subgraphUrl,
    graduatedToken ? queryHotInitializeTokenEventGraduated : queryHotInitializeTokenEvent, {
      first: PAGE_SIZE,
      offset: (hotPage - 1) * PAGE_SIZE,
      targetEras: 1,
    },
    { auto: false }
  );

  // Trigger refetch when pages change (avoid including refetch in deps to prevent loops)
  useEffect(() => {
    refetchLatest({ first: PAGE_SIZE, offset: (latestPage - 1) * PAGE_SIZE, targetEras: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestPage, PAGE_SIZE, graduatedToken]);

  useEffect(() => {
    refetchHot({ first: PAGE_SIZE, offset: (hotPage - 1) * PAGE_SIZE, targetEras: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotPage, PAGE_SIZE, graduatedToken]);

  // Derived hot tokens (server already filters by era; keep light filtering)
  const hotTokens = useMemo(() => {
    const nodes = hotData?.allInitializeTokenEventEntities?.nodes as InitiazlizedTokenData[] | undefined;
    if (!nodes) return [];
    return filterTokens(nodes);
  }, [hotData]);

  const handleSearch = async (e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (searchInput.trim()) {
      saveToHistory(searchInput.trim());
      setSearchLoading(true);
      const searchResult = await runGraphQuery(
        subgraphUrl,
        graduatedToken ? queryInitializeTokenEventBySearchGraduated : queryInitializeTokenEventBySearch, {
          offset: 0,
          first: 50,
          searchQuery: searchInput.trim()
        }
      );
      setSearchData(searchResult);
      setSearchLoading(false);
    }
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      handleSearch();
    }
  };

  const handleHistoryClick = async (term: string, e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSearchInput(term);
    saveToHistory(term);
    setSearchLoading(true);
    const searchResult = await runGraphQuery(
      subgraphUrl,
      graduatedToken ? queryInitializeTokenEventBySearchGraduated : queryInitializeTokenEventBySearch, {
        offset: 0,
        first: 50,
        searchQuery: term
      }
    );
    setSearchData(searchResult);
    setSearchLoading(false);
  };

  // Get the display data based on search mode
  const displayData = {
    initializeTokenEventEntities: filterTokens((searchData?.allInitializeTokenEventEntities?.nodes as InitiazlizedTokenData[]) || []),
  };

  const latestDisplayData = {
    initializeTokenEventEntities: filterTokens((latestData?.allInitializeTokenEventEntities?.nodes as InitiazlizedTokenData[]) || []),
  };

  // Totals for pagination
  const latestTotalCount = latestData?.allInitializeTokenEventEntities?.totalCount || 0;
  const latestTotalPages = Math.ceil(latestTotalCount / PAGE_SIZE) || 1;
  const hotTotalCount = hotData?.allInitializeTokenEventEntities?.totalCount || 0;
  const hotTotalPages = Math.ceil(hotTotalCount / PAGE_SIZE) || 1;

  // Merge errors and loading states
  const loading = searchLoading || initialLoading || hotLoading;
  const error = initialError || hotError;

  if (loading) {
    return (
      <div className={`flex justify-center items-center min-h-[200px] ${expanded ? 'md:ml-64' : 'md:ml-20'}`}>
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${expanded ? 'md:ml-64' : 'md:ml-20'}`}>
        <ErrorBox title={`Error loading tokens. Please try again later.`} message={error.message} />
      </div>
    );
  }

  return (
    <div className={`space-y-0 md:p-4 md:mb-20 ${expanded ? 'md:ml-64' : 'md:ml-20'}`}>
      {/* Search Bar */}
      <PageHeader title={graduatedToken ? t('discover.graduatedToken') : t('discover.title')} bgImage='/bg/group1/1.jpg' />
      <div className="md:max-w-6xl mx-auto mb-3 md:mb-12">
        <div className="flex flex-wrap gap-2 mb-4">
          <button 
            type="button"
            className="btn btn-primary"
            onClick={() => window.location.href = '/launch-token'}
          >
            {t('discover.launchAToken')}
          </button>
          <button 
            type="button"
            className="btn btn-secondary"
            onClick={() => window.location.href = '/my-minted-tokens'}
          >
            {t('discover.myMintedTokens')}
          </button>
          <button 
            type="button"
            className="btn btn-accent"
            onClick={() => window.location.href = '/my-urc'}
          >
            {t('discover.myPromotion')}
          </button>
          {hasDelegatedTokens &&
            <button 
              type="button"
              className="btn btn-extra1"
              onClick={() => window.location.href = '/my-delegated-tokens'}
            >
              {t('discover.myLiquidities')}
            </button>
          }
        </div>

        <div className="join w-full mb-2">
          <div className="relative join-item flex-1">
            <input
              type="text"
              placeholder={t('discover.searchPlaceholder')}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className='input search-input w-full pl-10'
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <button
            type="button"
            className="search-btn join-item btn-primary w-24"
            onClick={(e) => handleSearch(e)}
            disabled={loading}
          >
            {loading ? <span className="loading loading-spinner loading-sm"></span> : t('discover.search')}
          </button>
        </div>

        {/* Search History */}
        {searchHistory.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {searchHistory.map((term, index) => {
              const colorIndex = index % BADGE_BG_COLORS.length;
              return <button
                type="button"
                key={index}
                onClick={(e) => handleHistoryClick(term, e)}
                className={`badge`}
                style={{
                  backgroundColor: BADGE_BG_COLORS[colorIndex],
                  color: BADGE_TEXT_COLORS[colorIndex]
                }}
              >
                {term.length > 40 ? formatAddress(term, 6) : term}
              </button>
            })}
          </div>
        )}

        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayData.initializeTokenEventEntities.map((token: InitiazlizedTokenData) =>
            <TokenCardWeb key={token.mint} token={token} />
          )}
        </div>

        {/* Latest Tokens */}
        {latestDisplayData.initializeTokenEventEntities.length > 0 && (
          <div className={`${isMobile && "bg-base-200 -ml-4 -mr-4 pb-4"}`}>
            <h2 className="text-xl mt-6 ml-4 pt-1">{t('discover.latestTokens')}</h2>
            {isMobile ? (
              <ScrollCards tokens={latestDisplayData.initializeTokenEventEntities} />
            ) : (
              <div className="grid grid-cols-3 gap-4 p-1">
                {latestDisplayData.initializeTokenEventEntities.map((token: InitiazlizedTokenData) =>
                  <TokenCardWeb key={token.mint} token={token} />
                )}
              </div>
            )}
            {latestTotalPages > 1 && (
              <div className="mt-3 flex items-center justify-center gap-3">
                <button
                  type="button"
                  className="btn btn-sm"
                  disabled={latestPage === 1 || initialLoading}
                  onClick={() => setLatestPage(Math.max(1, latestPage - 1))}
                >
                  Prev
                </button>
                <span className="text-sm">
                  Page {latestPage} of {latestTotalPages} ({latestTotalCount} results)
                </span>
                <button
                  type="button"
                  className="btn btn-sm"
                  disabled={latestPage === latestTotalPages || initialLoading}
                  onClick={() => setLatestPage(Math.min(latestTotalPages, latestPage + 1))}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {/* Hottest Tokens */}
        {hotTokens.length > 0 && (
          <>
            <h2 className="text-xl mt-6">{t('discover.hottestTokens')}</h2>
            {isMobile ? (
              <div className="grid grid-cols-2 gap-4 p-1">
                {hotTokens.map((token: InitiazlizedTokenData, index: number) =>
                  <TokenCardSimple key={token.mint} token={token} number={index + 1} type="static" />
                )}
              </div>

            ) : (
              <div className="grid grid-cols-3 gap-4 p-1">
                {hotTokens.map((token: InitiazlizedTokenData, index: number) =>
                  <TokenCardWeb key={token.mint} token={token} number={index + 1} type="static" />
                )}
              </div>
            )}
            {hotTotalPages > 1 && (
              <div className="mt-3 flex items-center justify-center gap-3">
                <button
                  type="button"
                  className="btn btn-sm"
                  disabled={hotPage === 1 || hotLoading}
                  onClick={() => setHotPage(Math.max(1, hotPage - 1))}
                >
                  Prev
                </button>
                <span className="text-sm">
                  Page {hotPage} of {hotTotalPages} ({hotTotalCount} results)
                </span>
                <button
                  type="button"
                  className="btn btn-sm"
                  disabled={hotPage === hotTotalPages || hotLoading}
                  onClick={() => setHotPage(Math.min(hotTotalPages, hotPage + 1))}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
