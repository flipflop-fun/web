import { FC, useCallback, useEffect, useState } from "react";
import { PageHeader } from "../components/common/PageHeader";
import { useConnection, useAnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useLazyQuery } from "@apollo/client";
import { toast } from "react-hot-toast";
import { queryTokensByMints } from "../utils/graphql";
import { AddressDisplay } from "../components/common/AddressDisplay";
import {
  getLiquidityPoolData,
  getTokenBalance,
  // proxyCreatePool,
} from "../utils/web3";
import { InitiazlizedTokenData, PoolData, ResponseData } from "../types/types";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

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
  // const [loading, setLoading] = useState(false);
  const [tokenData, setTokenData] = useState<InitiazlizedTokenData | null>(
    null
  );
  const [tokenVaultBalance, setTokenVaultBalance] = useState(0);
  const [wsolVaultBalance, setWsolVaultBalance] = useState(0);
  const [poolAddress, setPoolAddress] = useState("");
  const { t } = useTranslation();
  const { mint } = useParams();

  const [getTokenData, { loading: queryLoading }] = useLazyQuery(
    queryTokensByMints,
    {
      onCompleted: (data) => {
        const _tokenData = data.initializeTokenEventEntities[0];
        console.log(_tokenData);
        setTokenData(_tokenData);

        getTokenBalance(new PublicKey(_tokenData.tokenVault), connection).then(
          (balance) => {
            setTokenVaultBalance(balance as number);
          }
        );

        getTokenBalance(new PublicKey(_tokenData.wsolVault), connection).then(
          (balance) => {
            setWsolVaultBalance(balance as number);
          }
        );

        getLiquidityPoolData(wallet, connection, _tokenData).then(
          (res: ResponseData) => {
            if (res.success) {
              const poolData = res.data as PoolData;
              setPoolAddress(poolData.poolAddress);
            }
          }
        );
      },
      onError: (error) => {
        toast.error(t('errors.fetchTokenData'));
        console.error("Error fetching tokenData data:", error);
      },
    }
  );

  // Get current Epoch
  const fetchCurrentEpoch = useCallback(async () => {
    try {
      const epochInfo = await connection.getEpochInfo();
      setCurrentEpoch(epochInfo.epoch);
    } catch (error) {
      console.error("Error fetching epoch:", error);
      toast.error(t('errors.fetchCurrentEpoch'));
    }
  }, [connection]);

  const handleFetch = useCallback(
    async (mint: string) => {
      if (!mint.trim()) {
        toast.error(t('errors.enterMintAddress'));
        return;
      }
      try {
        new PublicKey(mint); // Verify address
        await fetchCurrentEpoch();
        await getTokenData({
          variables: {
            mints: [mint],
            skip: 0,
            first: 10,
          },
        });
      } catch (error) {
        toast.error(t('errors.invalidMintAddress'));
        return;
      }
    },
    [fetchCurrentEpoch, getTokenData]
  );

  useEffect(() => {
    if (mint) {
      setMintAddress(mint);
      handleFetch(mint);
    }
  }, [handleFetch, mint]);

  // Create Pool, deprecated
  // const handleCreatePool = async () => {
  //   setLoading(true);
  //   try {
  //     const result = await proxyCreatePool(
  //       wallet,
  //       connection,
  //       tokenData as InitiazlizedTokenData
  //     );
  //     if (!result?.success) {
  //       toast.error(result?.message as string);
  //       return;
  //     }
  //     toast.success(t('errors.poolCreatedSuccess'));
  //   } catch (error) {
  //     toast.error(t('errors.failedCreatePool'));
  //     console.error("Error creating pool:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

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
                  disabled={queryLoading}
                  className="btn btn-primary"
                >
                  {queryLoading ? "Loading..." : t('vm.getInfo')}
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
