import { PublicKey } from '@solana/web3.js';
import { TokenParams, NetworkConfig, NetworkConfigs } from '../types/types';

export const APP_NAME = 'flipflop';
// export const VERSION_DESCRIPTION = 'Mainnet';

export const DEFAULT_PARAMS = {
  standard: {
    // must be same as program default params
    targetEras: '1',
    epochesPerEra: '200',
    targetSecondsPerEpoch: '2000',
    reduceRatio: '50',
    initialMintSize: '20000000000000',
    initialTargetMintSizePerEpoch: '200000000000000',
    feeRate: '250000000',
    liquidityTokensRatio: '20',
  },
  meme: {
    // config for mainnet, 100 - 557 SOL
    targetEras: '1',
    epochesPerEra: '200',
    targetSecondsPerEpoch: '2000',
    reduceRatio: '75',
    initialMintSize: '100000000000000',
    initialTargetMintSizePerEpoch: '1000000000000000',
    feeRate: '50000000',
    liquidityTokensRatio: '20',
  },
} as Record<string, TokenParams>;

// Solana program config
export const NETWORK_CONFIGS: NetworkConfigs = {
  devnet: {
    isPaused: false,
    frontendUrl: "https://test.flipflop.fun",
    irysGatewayUrl: "https://gateway.irys.xyz",
    scanUrl: 'https://explorer.solana.com',
    apiBaseUrl: 'https://api-dev.flipflop.plus',
    subgraphUrl: 'https://data.flipflop.plus/subgraphs/name/flipflop-pom',
    systemDeployer: new PublicKey('DJ3jvpv6k7uhq8h9oVHZck6oY4dQqY1GHaLvCLjSqxaD'),
    allowOwnerOffCurveForProtocolFeeAccount: false,
    tokenMetadataProgramId: new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"),
    cpSwapProgram: new PublicKey("CPMDWBwJDtYax9qW7AyRuVC19Cc4L4Vcy4n2BHAbHkCW"), // devnet
    cpSwapConfigAddress: new PublicKey("9zSzfkYy6awexsHvmggeH36pfVUdDGyCcwmjT3AQPBj6"), // find address on devnet
    createPoolFeeReceive: new PublicKey("G11FKBRaAkHAKuLCgLM6K6NUc9rTjPAznRCjZifrTQe2"), // find address on devnet
    memoProgram: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
    addressLookupTableAddress: new PublicKey("EebRqpLtUgjX17pJJNNbd6ngtYa34VGa51oYsibwJRXy"),
    launchRuleAccount: new PublicKey("G9KkZg3MQen877QPmNwvTFzfm9gY7fzQEdhbrHbpCXQj"),
    chartApiUrl: 'https://chart-api-testnet.flipflop.plus/api/v1/ohlc',
  } as NetworkConfig,
  mainnet_beta: {
    isPaused: true, // launching is paused, should be same as on-chain
    frontendUrl: "https://app.flipflop.fun",
    irysGatewayUrl: "https://gateway.irys.xyz",
    scanUrl: 'https://explorer.solana.com',
    apiBaseUrl: 'https://api.flipflop.plus',
    subgraphUrl: 'https://data-mainnet.flipflop.plus/subgraphs/name/proof_of_mint',
    systemDeployer: new PublicKey('DJ3jvpv6k7uhq8h9oVHZck6oY4dQqY1GHaLvCLjSqxaD'), // Must be the original deployer to fix the system config pda account
    allowOwnerOffCurveForProtocolFeeAccount: true,
    tokenMetadataProgramId: new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"),
    cpSwapProgram: new PublicKey("CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C"),
    cpSwapConfigAddress: new PublicKey("D4FPEruKEHrG5TenZ2mpDGEfu1iUvTiqBxvpU8HLBvC2"),
    createPoolFeeReceive: new PublicKey("DNXgeM9EiiaAbaWvwjHj9fQQLAX5ZsfHyvmYUNRAdNC8"),
    memoProgram: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
    addressLookupTableAddress: new PublicKey("7DK7pmNkUeeFB3yxt6bJcPCWcG4L3AdCe2WZaBguy9sq"),
    launchRuleAccount: new PublicKey("G9KkZg3MQen877QPmNwvTFzfm9gY7fzQEdhbrHbpCXQj"),
    chartApiUrl: 'https://chart-api.flipflop.plus/api/v1/ohlc',
  } as NetworkConfig,
};

export const METADATA_SEED = "metadata";
export const MINT_SEED = "fair_mint";
export const CONFIG_DATA_SEED = "config_data";
export const FREEZE_SEED = "freeze";
export const MINT_STATE_SEED = "mint_state";
export const REFERRAL_SEED = "referral";
export const REFUND_SEEDS = "refund";
export const SYSTEM_CONFIG_SEEDS = "system_config_v1.1";
export const REFERRAL_CODE_SEED = "referral_code";
export const CODE_ACCOUNT_SEEDS = "code_account";
export const MINT_VAULT_OWNER_SEEDS = "mint-vault-owner";
export const EXTRA_ACCOUNT_META_LIST_SEEDS = "extra-account-metas";


// LOCAL_STORAGE PREFIX
export const LOCAL_STORAGE_KEY_EXPANDED = 'flipflop_sidebar_expanded_menus';
export const LOCAL_STORAGE_KEY_THEME = 'flipflop_theme';
export const LOCAL_STORAGE_MY_REFERRAL_CODE = 'flipflop_my_referral_code';
export const LOCAL_STORAGE_AUTH_TOKEN = 'flipflop_token';
export const LOCAL_STORAGE_HISTORY_CACHE_PREFIX = 'flipflop_mint_history_';
export const LOCAL_STORAGE_HISTORY_CACHE_EXPIRY = 24 * 60 * 60 * 1000;

export const DEFAULT_IMAGE = "/images/flip-flops-outline.png";
export const COMMENT_MIN_BALANCE = 0.2;

export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];
const network = (process.env.REACT_APP_NETWORK as keyof typeof NETWORK_CONFIGS) || "devnet";
export const API_BASE_URI = process.env.REACT_APP_ENV === "development" ? "http://127.0.0.1:8000" : NETWORK_CONFIGS[network].apiBaseUrl;
export const STORAGE = "irys" as "irys" | "arweave";
export const UPLOAD_API_URL = STORAGE === "arweave" ? `${API_BASE_URI}/api/arweave` : `${API_BASE_URI}/api/irys`; // PRODUCTION
export const COPILOTKIT_RUNTIME_URL = `${API_BASE_URI}/api/gpt/copilotkit`;
export const USER_API_URL = `${API_BASE_URI}/api/user`;

export const ARWEAVE_GATEWAY_URL = "https://arweave.net";
export const ARSEEDING_GATEWAY_URL = "https://arseed.web3infra.dev";
export const ARWEAVE_DEFAULT_SYNC_TIME = 2 * 60 * 60;

export const VALID_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
export const MAX_AVATAR_FILE_SIZE = 0.25 * 1024 * 1024; // 1MB
export const MAX_HEADER_FILE_SIZE = 3 * 1024 * 1024; // 3MB

export const U32_MAX = 4294967295;
export const WALLET_SIGN_MESSAGE = 'Welcome to flipflop!';

export const DARK_THEME = 'skypixel';
export const LIGHT_THEME = 'pixel';

export const BADGE_BG_COLORS = [
    "#2FFF2F",
    "#FF00F5",
    "#FF4911",
    "#FFFF00",
    "#7DF9FF",
    "#3300FF",
    "#7FBC8C",
    "#E3A018",
    "#9723C9"
]
export const BADGE_TEXT_COLORS = ["black", "white", "white", "black", "black", "white", "black", "black", "white"]
export const SEARCH_CACHE_ITEMS = 10;

// IndexedDB config
export const INDEX_DB_NAME = 'POM_IMAGE_CACHE';
export const STORE_NAME_IMAGE = 'token_images';
export const INDEX_DB_VERSION = 1;

export const CACHE_DURATION = 60 * 24 * 60 * 60 * 1000; // 60 days

// Deprecated mints list
export const DEPRECATED_MINTS = ["",
    "BitJngSe2MFQNnuBiA6bajRyZoFp7pkXYnBjVKMJMiCv",
    
]