import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { InitiazlizedTokenData, Liquidity, PoolData } from '../types/types';
import { queryBurnLp, queryLiquidities, queryTokensByMints, queryTrades } from '../utils/graphql2';
import { Trades } from '../components/liquidity/Trades';
import { Liquidities } from '../components/liquidity/Liquidities';
import { LpBurns } from '../components/liquidity/LpBurns';
import { PoolInformation } from '../components/liquidity/PoolInformation';
import { useParams } from 'react-router-dom';
import { sleep } from '@raydium-io/raydium-sdk-v2';
import { useTranslation } from 'react-i18next';
import { runGraphQuery } from '../hooks/graphquery';
import { NETWORK_CONFIGS } from '../config/constants';

type ManageLiquidityProps = {
  expanded: boolean;
  operator: 'vm' | 'issuer';
}

export function ManageLiquidity({
  expanded,
  operator,
}: ManageLiquidityProps
) {
  const [mintAddress, setMintAddress] = useState('');
  const [tokenData, setTokenData] = useState<InitiazlizedTokenData | null>(null);
  const [poolData, setPoolData] = useState<PoolData | null>(null);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [tradesData, setTradesData] = useState([]);
  const [liquiditiesData, setLiquiditiesData] = useState<Liquidity[]>([]);
  const [lpBurnData, setLpBurnData] = useState([]);
  const [activeTab, setActiveTab] = useState('trades');
  const [tokenVaultBalance, setTokenVaultBalance] = useState(0);
  const [wsolVaultBalance, setWsolVaultBalance] = useState(0);
  const [poolTokenBalance, setPoolTokenBalance] = useState(0);
  const [poolSOLBalance, setPoolSOLBalance] = useState(0);
  const [vaultLpTokenBalance, setVaultLpTokenBalance] = useState(0);
  const [totalLpToken, setTotalLpToken] = useState(0);
  const [isDexOpen, setIsDexOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const initialFetchDone = useRef(false);
  const nonce = useRef(0);
  const { mint } = useParams();
  const { t } = useTranslation();
  const subgraphUrl = NETWORK_CONFIGS[(process.env.REACT_APP_NETWORK as keyof typeof NETWORK_CONFIGS) || 'devnet'].subgraphUrl2;

  const fetchAllData = useCallback(async (address: string) => {
    if (!address) {
      toast.error('Please enter mint address');
      return;
    }

    try {
      setIsLoading(true);
      await sleep(2000);

      const [tokenResp, liquiditiesResp, lpBurnResp, tradesResp] = await Promise.all([
        runGraphQuery(subgraphUrl, queryTokensByMints, { mints: [address], offset: 0, first: 10 }),
        runGraphQuery(subgraphUrl, queryLiquidities, { mint: address, offset: 0, first: 10 }),
        runGraphQuery(subgraphUrl, queryBurnLp, { mint: address, offset: 0, first: 10 }),
        runGraphQuery(subgraphUrl, queryTrades, { mint: address, offset: 0, first: 10 }),
      ]);

      const tokenNode = tokenResp?.allInitializeTokenEventEntities?.nodes?.[0] as InitiazlizedTokenData | undefined;
      if (tokenNode) setTokenData(tokenNode);

      const liqNodes = (liquiditiesResp?.allProxyLiquidityEventEntities?.nodes || []) as Liquidity[];
      setLiquiditiesData([...liqNodes]);

      const burnNodes = (lpBurnResp?.allProxyBurnLpTokensEventEntities?.nodes || []) as [];
      setLpBurnData([...burnNodes]);

      const tradeNodes = (tradesResp?.allProxySwapBaseEventEntities?.nodes || []) as [];
      setTradesData([...tradeNodes]);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  }, [subgraphUrl]);

  useEffect(() => {
    if(mint && !initialFetchDone.current) {
      initialFetchDone.current = true;
      setMintAddress(mint as string);
      fetchAllData(mint);
    }
  }, [fetchAllData, mint])

  const onDone = () => {
    initialFetchDone.current = false;
    nonce.current += 1;
    fetchAllData(mintAddress);
  }

  return (
    <div className={`space-y-0 md:p-4 md:mb-20 ${expanded ? 'md:ml-64' : 'md:ml-20'}`}>
      <div className="container mx-auto md:px-4 px-1 py-8">
        <div className='max-w-4xl mx-auto'>
          <h1 className='text-2xl mb-6'>{t('vm.manageMarketValue')}</h1>
          {!mint && (
          <div className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={t('vm.enterTokenPlaceholder')}
                className="input input-bordered flex-1"
                value={mintAddress}
                onChange={(e) => setMintAddress(e.target.value)}
              />
              <button
                onClick={() => fetchAllData(mintAddress)}
                disabled={isLoading || !mintAddress}
                className="btn btn-primary"
              >
                {isLoading ? 'Loading...' : t('vm.getInfo')}
              </button>
            </div>
          </div>)}

          {tokenData && (
            <PoolInformation
              tokenData={tokenData}
              currentPrice={currentPrice}
              setPoolData={setPoolData}
              setCurrentPrice={setCurrentPrice}
              nonce={nonce.current}
              tokenVaultBalance={tokenVaultBalance}
              setTokenVaultBalance={setTokenVaultBalance}
              wsolVaultBalance={wsolVaultBalance}
              setWsolVaultBalance={setWsolVaultBalance}
              poolTokenBalance={poolTokenBalance}
              setPoolTokenBalance={setPoolTokenBalance}
              poolSOLBalance={poolSOLBalance}
              setPoolSOLBalance={setPoolSOLBalance}
              vaultLpTokenBalance={vaultLpTokenBalance}
              setVaultLpTokenBalance={setVaultLpTokenBalance}
              totalLpToken={totalLpToken}
              setTotalLpToken={setTotalLpToken}
              isDexOpen={isDexOpen}
              setIsDexOpen={setIsDexOpen}
              operator={operator}
            />
          )}

          {poolData && isDexOpen &&
            <div className="bg-base-200 md:p-6 p-3 rounded-lg md:text-md text-sm">
              <div className="grid gap-8">
                <div className="tabs tabs-boxed">
                  {operator === 'vm' &&
                  <div
                    className={`tab px-0 h-12 ${activeTab === 'trades' ? 'bg-gray-700 text-white' : ''}`}
                    onClick={() => setActiveTab('trades')}
                  >
                    <div className='font-bold'>[Trade]</div>
                  </div>}
                  {operator === 'vm' && <div
                    className={`tab px-0 h-12 ${activeTab === 'liquidity' ? 'bg-gray-700 text-white' : ''}`}
                    onClick={() => setActiveTab('liquidity')}
                  >
                    <div className='font-bold'>[Liquidity]</div>
                  </div>}
                  {operator === 'issuer' &&
                    <button 
                      className='btn btn-primary'
                      onClick={() => setActiveTab('burn')}
                    >{t('tokenInfo.burnLp')}</button>
                  }
                </div>

                {activeTab === 'trades' && operator === 'vm' && (
                  <Trades
                    tradesData={tradesData}
                    tokenData={tokenData as InitiazlizedTokenData}
                    currentPrice={currentPrice}
                    onDone={onDone}
                    tokenVaultBalance={tokenVaultBalance}
                    wsolVaultBalance={wsolVaultBalance}
                    poolTokenBalance={poolTokenBalance}
                    poolSOLBalance={poolSOLBalance}
                  />
                )}
                {activeTab === 'liquidity' && operator === 'vm' && (
                  <Liquidities
                    tokenData={tokenData as InitiazlizedTokenData}
                    liquiditiesData={liquiditiesData}
                    currentPrice={currentPrice}
                    onDone={onDone}
                    tokenVaultBalance={tokenVaultBalance}
                    wsolVaultBalance={wsolVaultBalance}
                    poolTokenBalance={poolTokenBalance}
                    poolSOLBalance={poolSOLBalance}
                    vaultLpTokenBalance={vaultLpTokenBalance}
                    totalLpToken={totalLpToken}
                  />
                )}
                {activeTab === 'burn' && operator === 'issuer' && (
                  <LpBurns
                    tokenData={tokenData as InitiazlizedTokenData}
                    lpBurnData={lpBurnData}
                    onDone={onDone}
                    vaultLpTokenBalance={vaultLpTokenBalance}
                  />
                )}
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  );
}
