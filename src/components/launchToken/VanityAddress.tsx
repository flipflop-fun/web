import { FC, useState } from "react";
import { Keypair } from "@solana/web3.js";
import { useTranslation } from 'react-i18next';

type VanityAddressProps = {
    vanityAddress: string;
    onVanityAddressChange: (vanityAddress: string) => void;
}

export const VanityAddress: FC<VanityAddressProps> = ({
    vanityAddress,
    onVanityAddressChange,
}) => {
    const { t } = useTranslation();
    const [prefix, setPrefix] = useState("");
    const [position, setPosition] = useState<"start" | "end">("start");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const maxAttempts = 100000;
    const maxLength = 4;

    // Base58 character set
    const base58Chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

    const validateInput = (input: string) => {
        if (input.length > maxLength) {
            setError(t('common.lengthCannotExceed', { length: maxLength }));
            return false;
        }

        const invalidChars = input.split('').filter(char => !base58Chars.includes(char));
        if (invalidChars.length > 0) {
            setError(t('common.invalidBase58Characters', { chars: invalidChars.join(', ') }));
            return false;
        }

        setError("");
        return true;
    };

    const generateAddress = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!validateInput(prefix)) return;
        setLoading(true);
        setProgress(0);
        onVanityAddressChange("");

        try {
            let found = false;
            let attempts = 0;

            const runBatch = () => {
                const batchSize = 1000;
                let batchCount = 0;

                while (batchCount < batchSize && !found && attempts < maxAttempts) {
                    const keypair = Keypair.generate();
                    const address = keypair.publicKey.toBase58();

                    if ((position === "start" && address.toLowerCase().startsWith(prefix.toLowerCase())) ||
                        (position === "end" && address.toLowerCase().endsWith(prefix.toLowerCase()))) {
                        onVanityAddressChange(address);
                        found = true;
                        setLoading(false);
                        return;
                    }
                    attempts++;
                    batchCount++;
                }

                setProgress((attempts / maxAttempts) * 100);

                if (!found && attempts < maxAttempts) {
                    setTimeout(runBatch, 0);
                } else if (!found) {
                    setError(t('common.failedToFindAddress', { attempts: maxAttempts }));
                    setLoading(false);
                }
            };

            runBatch();
        } catch (err) {
            setError(t('common.errorGeneratingAddress'));
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="alert alert-info">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <div>
                    <h3 className="font-bold">{t('launch.vanityAddressTitle')}</h3>
                    <p>{t('launch.vanityAddressDescription')}</p>
                </div>
            </div>

            <div>
                <label className="label">
                    <span className="label-text">{t('launch.enterCharacters', { maxLength })}</span>
                </label>
                <input
                    type="text"
                    className="input input-bordered w-full"
                    value={prefix}
                    onChange={(e) => {
                        const value = e.target.value.toUpperCase();
                        setPrefix(value);
                        validateInput(value);
                    }}
                    placeholder={t('placeholder.vanityAddressExample')}
                    maxLength={maxLength}
                />
            </div>

            <div>
                <label className="label">
                    <span className="label-text">{t('launch.selectPosition')}</span>
                </label>
                <div className="join w-full">
                    <button
                        className={`join-item btn flex-1 ${position === 'start' ? 'btn-active' : ''}`}
                        onClick={() => {
                            setPosition('start');
                        }}
                        type="button"
                    >
                        {t('common.start')}
                    </button>
                    <button
                        className={`join-item btn flex-1 ${position === 'end' ? 'btn-active' : ''}`}
                        onClick={() => {
                            setPosition('end');
                        }}
                        type="button"
                    >
                        {t('common.end')}
                    </button>
                </div>
            </div>

            {error && (
                <div className="alert alert-error">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>{error}</span>
                </div>
            )}

            {loading && (
                <div className="w-full">
                    <div className="flex justify-between mb-1">
                        <span className="text-base font-medium">{t('common.generating')}</span>
                        <span className="text-base font-medium">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-base-200 rounded-full h-4">
                        <div
                            className="bg-primary h-4 rounded-full transition-all duration-300 ease-in-out"
                            style={{
                                width: `${progress}%`,
                                minWidth: '2rem'
                            }}
                        ></div>
                    </div>
                </div>
            )}

            <button
                className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
                onClick={generateAddress}
                disabled={loading || !prefix}
            >
                {loading ? t('common.generating') : t('common.generateAddress')}
            </button>

            {vanityAddress && (
                <div className="alert alert-success">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <div>
                        <div className="font-bold">{t('common.addressGenerated')}</div>
                        <div className="break-all">{vanityAddress}</div>
                    </div>
                </div>
            )}
        </div>
    );
};