import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { ConfirmedSignatureInfo } from '@solana/web3.js';
import { useEffect, useState } from 'react';
import { NETWORK_CONFIGS } from '../config/constants';
import { useTranslation } from 'react-i18next';

const network = (process.env.REACT_APP_NETWORK as keyof typeof NETWORK_CONFIGS) || "devnet";

export const TransactionHistory = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [transactions, setTransactions] = useState<ConfirmedSignatureInfo[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    if (!publicKey) return;

    const getTransactions = async () => {
      try {
        const signatures = await connection.getSignaturesForAddress(publicKey, {
          limit: 5,
        });
        setTransactions(signatures);
      } catch (e) {
        console.error('Error fetching transactions:', e);
      }
    };

    getTransactions();
  }, [connection, publicKey]);

  if (!publicKey) {
    return (
      <div className='flex justify-center items-center'>
        <div className="card w-96 bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">{t('transactionHistory.title')}</h2>
            <p>{t('transactionHistory.connectWalletMessage')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='flex justify-center items-center'>
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">{t('transactionHistory.title')}</h2>
          <div className="overflow-x-auto bg-base-100 rounded-xl shadow-xl">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>{t('transactionHistory.signature')}</th>
                  <th>{t('transactionHistory.slot')}</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.signature}>
                    <td className="truncate max-w-xs">
                      <a
                        href={`${NETWORK_CONFIGS[network].scanUrl}/tx/${tx.signature}?cluster=${network}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link link-primary"
                      >
                        {tx.signature.slice(0, 20)}...
                      </a>
                    </td>
                    <td>{tx.slot}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
