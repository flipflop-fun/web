import { useConnection } from "@solana/wallet-adapter-react";
import { EpochInfo } from "@solana/web3.js";
import { FC, useEffect, useState } from "react"
import { useTranslation } from "react-i18next";

type DexStatusBarProps = {
  openTime: number,
  isDexOpen: boolean,
  setIsDexOpen: (isDexOpen: boolean) => void,
}

export const DexStatusBar:FC<DexStatusBarProps> = ({
  openTime,
  isDexOpen,
  setIsDexOpen
}) => {
  const { connection } = useConnection();
  const [remainingTime, setRemainingTime] = useState<string>("");
  const { t } = useTranslation();
  useEffect(() => {
    const fetchEpochInfo = async () => {
      try {
        const epochInfo: EpochInfo = await connection.getEpochInfo();
        const now = await connection.getBlockTime(epochInfo.absoluteSlot) as number;
        if (now >= openTime) {
          setIsDexOpen(true);
        } else {
          const timeUntilOpen = openTime - now;
          const days = Math.floor(timeUntilOpen / (24 * 60 * 60));
          const hours = Math.floor((timeUntilOpen % (24 * 60 * 60)) / (60 * 60));
          const minutes = Math.floor((timeUntilOpen % (60 * 60)) / 60);

          setRemainingTime(t('vm.willOpenIn') + ` ${days}d ${hours}h ${minutes}m`);
        }
      } catch (error) {
        console.error("Error fetching epoch info:", error);
      }
    };

    fetchEpochInfo();

    const interval = setInterval(fetchEpochInfo, 60000);
    return () => clearInterval(interval);
  }, [connection, openTime, setIsDexOpen]);

  return (
    <div>
    {!isDexOpen && (
      <div className="mt-3 space-y-2 text-error font-bold">
        <div className="flex justify-between mb-2">
          <span className="">
            {t('vm.dexProgress')}: {isDexOpen ? t('vm.opened') : t('vm.notOpen')}
          </span>
          <span className="">
            {remainingTime}
          </span>
        </div>
      </div>
    )}
    </div>
  );
};