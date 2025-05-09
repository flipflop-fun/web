import { FC, useState } from "react";
import { Keypair } from "@solana/web3.js";
// import bs58 from "bs58";

type VanityAddressProps = {
    vanityAddress: string;
    onVanityAddressChange: (vanityAddress: string) => void;
}

export const VanityAddress: FC<VanityAddressProps> = ({
    vanityAddress,
    onVanityAddressChange,
}) => {
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
            setError(`Length cannot exceed ${maxLength} characters`);
            return false;
        }

        const invalidChars = input.split('').filter(char => !base58Chars.includes(char));
        if (invalidChars.length > 0) {
            setError(`The following characters do not comply with Base58 address standard: ${invalidChars.join(', ')}`);
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

            // 使用 setTimeout 来避免阻塞 UI
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
                    setError(`Failed to find matching address in ${maxAttempts} attempts, please try again`);
                    setLoading(false);
                }
            };

            runBatch();
        } catch (err) {
            setError("Error generating address");
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="alert alert-info">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <div>
                    <h3 className="font-bold">What is a Vanity Address?</h3>
                    <p>A Vanity address is a custom Solana address that contains specific characters you want. For example, the address can start or end with "ABC". This makes the address easier to remember and identify.</p>
                </div>
            </div>

            <div className="">
                <label className="label">
                    <span className="label-text">Enter 1-{maxLength} characters (letters and numbers only)</span>
                </label>
                <input
                    type="text"
                    className="input input-bordered w-full"
                    value={prefix}
                    onChange={(e) => {
                        setPrefix(e.target.value);
                        validateInput(e.target.value);
                    }}
                    maxLength={maxLength}
                    placeholder="Example: ABC"
                />
            </div>

            <div>
                <label className="label">
                    <span className="label-text">Select Position</span>
                </label>
                <div className="join w-full">
                    <button
                        className={`join-item btn flex-1 ${position === 'start' ? 'btn-active' : ''}`}
                        onClick={(e) => {
                            e.preventDefault();
                            setPosition('start');
                        }}
                    >
                        Starts with
                    </button>
                    <button
                        className={`join-item btn flex-1 ${position === 'end' ? 'btn-active' : ''}`}
                        onClick={(e) => {
                            e.preventDefault();
                            setPosition('end');
                        }}
                    >
                        Ends with
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
                        <span className="text-base font-medium">Generating...</span>
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

            {!loading && <button
                className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
                onClick={generateAddress}
                disabled={loading || !prefix}
            >
                {loading ? 'Generating...' : 'Generate Address'}
            </button>}

            {!loading && vanityAddress && (
                <div className="alert alert-success">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <div>
                        <div className="font-bold">Address Generated</div>
                        <div className="break-all">{vanityAddress}</div>
                    </div>
                </div>
            )}
        </div>
    );
};