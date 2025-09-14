import { FC, useCallback, useEffect, useState } from "react";
import { PageHeader } from "../components/common/PageHeader";
import { useConnection, useAnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { toast } from "react-hot-toast";
import { queryTokensByMints } from "../utils/graphql2";
import { AddressDisplay } from "../components/common/AddressDisplay";
import {
  getLiquidityPoolData,
  getTokenBalance,
  // proxyCreatePool,
} from "../utils/web3";
import { InitiazlizedTokenData, PoolData, ResponseData } from "../types/types";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { runGraphQuery } from "../hooks/graphquery";
import { NETWORK_CONFIGS } from "../config/constants";

type CreateLiquidityPoolProps = {
  expanded: boolean;
};

export const CreateLiquidityPool: FC<CreateLiquidityPoolProps> = ({
  expanded,
}) => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const [mintAddress, setMintAddress] = useState<string | undefined>("");
  const [currentEpoch, setCurrentEpoch] = useState<number | null>(null);
  const [tokenData, setTokenData] = useState<InitiazlizedTokenData | null>(
    null
  );
  const [tokenVaultBalance, setTokenVaultBalance] = useState(0);
  const [wsolVaultBalance, setWsolVaultBalance] = useState(0);
  const [poolAddress, setPoolAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();
  const { mint } = useParams();
  const subgraphUrl =
    NETWORK_CONFIGS[
      (process.env.REACT_APP_NETWORK as keyof typeof NETWORK_CONFIGS) ||
        "devnet"
    ].subgraphUrl2;

  // Get current Epoch
  const fetchCurrentEpoch = useCallback(async () => {
    try {
      const epochInfo = await connection.getEpochInfo();
      setCurrentEpoch(epochInfo.epoch);
    } catch (error) {
      console.error("Error fetching epoch:", error);
      toast.error(t('errors.fetchCurrentEpoch'));
    }
  }, [connection, t]);

  const handleFetch = useCallback(
    async (mint: string) => {
      if (!mint.trim()) {
        toast.error(t('errors.enterMintAddress'));
        return;
      }
      try {
        new PublicKey(mint); // Verify address
        await fetchCurrentEpoch();

        setIsLoading(true);
        const data = await runGraphQuery(subgraphUrl, queryTokensByMints, {
          mints: [mint],
          offset: 0,
          first: 10,
        });

        const _tokenData = data?.allInitializeTokenEventEntities?.nodes?.[0] as InitiazlizedTokenData | undefined;
        if (!_tokenData) {
          setTokenData(null);
          toast.error(t('errors.fetchTokenData'));
          return;
        }

        setTokenData(_tokenData);

        try {
          const [tokenBal, wsolBal] = await Promise.all([
            getTokenBalance(new PublicKey(_tokenData.tokenVault), connection),
            getTokenBalance(new PublicKey(_tokenData.wsolVault), connection),
          ]);
          setTokenVaultBalance((tokenBal as number) || 0);
          setWsolVaultBalance((wsolBal as number) || 0);
        } catch (balanceErr) {
          console.error("Error fetching balances:", balanceErr);
        }

        try {
          const res: ResponseData = await getLiquidityPoolData(
            wallet,
            connection,
            _tokenData
          );
          if (res?.success) {
            const poolData = res.data as PoolData;
            setPoolAddress(poolData.poolAddress);
          }
        } catch (poolErr) {
          console.error("Error fetching pool data:", poolErr);
        }
      } catch (error) {
        toast.error(t('errors.invalidMintAddress'));
        return;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchCurrentEpoch, connection, wallet, subgraphUrl, t]
  );

  useEffect(() => {
    if (mint) {
      setMintAddress(mint);
      handleFetch(mint);
    }
  }, [handleFetch, mint]);

  return (
    <div
      className={`space-y-0 md:p-4 md:mb-20 ${
        expanded ? "md:ml-64" : "md:ml-20"
      }`}
    >
      <PageHeader title="Create Liquidity Pool" bgImage="/bg/group1/8.jpg" />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl mb-6">{t('createLiquidityPool.tokenMintAddress')}</h1>
          {!mint && (
            <div className="mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={mintAddress}
                  onChange={(e) => setMintAddress(e.target.value)}
                  placeholder={t('vm.enterTokenPlaceholder')}
                  className="input input-bordered flex-1"
                />
                <button
                  onClick={() => handleFetch(mintAddress as string)}
                  disabled={isLoading}
                  className="btn btn-primary"
                >
                  {isLoading ? "Loading..." : t('vm.getInfo')}
                </button>
              </div>
            </div>
          )}

          {/* show token information */}
          {tokenData && (
            <div className="bg-base-200 p-4 rounded-lg mb-6">
              <h2 className="text-xl font-semibold mb-4">{t('urc.tokenInformation')}</h2>
              <div className="grid gap-3">
                <div className="flex justify-between">
                  <span>{t('launch.tokenName')}</span>
                  <span>{tokenData.tokenName}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('launch.tokenSymbol')}</span>
                  <span>{tokenData.tokenSymbol}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('createLiquidityPool.currentEra')}</span>
                  <span>{tokenData.currentEra}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('createLiquidityPool.targetEra')}</span>
                  <span>{tokenData.targetEras}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('createLiquidityPool.tokenVault')}</span>
                  <span className="">
                    <AddressDisplay address={tokenData.tokenVault} />
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{t('createLiquidityPool.tokenVaultBalance')}</span>
                  <span className="">
                    {tokenVaultBalance} {tokenData.tokenSymbol}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>SOL Vault:</span>
                  <span className="">
                    <AddressDisplay address={tokenData.wsolVault} />
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{t('createLiquidityPool.solVaultBalance')}</span>
                  <span className="">{wsolVaultBalance} SOL</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('createLiquidityPool.valueManager')}</span>
                  <span className="">
                    <AddressDisplay address={tokenData.valueManager} />
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{t('createLiquidityPool.graduateEpoch')}</span>
                  <span>
                    {parseInt(tokenData.graduateEpoch) === 4294967295
                      ? "Not graduated"
                      : "graduated"}
                  </span>
                </div>
                {currentEpoch !== null && (
                  <div className="flex justify-between">
                    <span>{t('createLiquidityPool.currentEpoch')}</span>
                    <span>{currentEpoch}</span>
                  </div>
                )}
                {poolAddress !== "" && (
                  <div className="grid gap-3 mt-3">
                    <div className="flex justify-between">
                      <span>{t('createLiquidityPool.poolCreated')}</span>
                      <span className="">Yes</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('createLiquidityPool.poolAddress')}</span>
                      <span className="">
                        <AddressDisplay address={poolAddress} />
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Create Pool button */}
          {/* {tokenData && poolAddress === "" && (
            <div className="text-center">
              <button
                onClick={handleCreatePool}
                disabled={!tokenData || loading}
                className={`btn btn-primary mt-5 ${!tokenData ? 'btn-disabled' : ''}`}
              >
                {loading ? 'Creating...' : 'Create Pool'}
              </button>
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
};
