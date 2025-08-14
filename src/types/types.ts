import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';

export type Theme = 'light' | 'dark';

export type TokenParams = {
  targetEras: string;
  epochesPerEra: string;
  targetSecondsPerEpoch: string;
  reduceRatio: string;
  initialMintSize: string;
  initialTargetMintSizePerEpoch: string;
  feeRate: string;
  liquidityTokensRatio: string;
};

export type TokenMetadata = {
  name: string;
  symbol: string;
  uri: string;
  decimals?: number;
  sellerFeeBasisPoints?: number;
  creators?: null;
  collection?: null;
  uses?: null;
}

export type TokenMetadataExtensions = {
  twitter?: string;
  discord?: string;
  website?: string;
  github?: string;
  medium?: string;
  telegram?: string;
}

export type TokenMetadataIPFS = {
  name?: string;
  symbol?: string;
  image?: string;
  header?: string;
  description?: string;
  extensions?: TokenMetadataExtensions;
  attributes?: string[];
}

export type InitializeTokenConfig = {
  targetEras: BN;
  epochesPerEra: BN;
  targetSecondsPerEpoch: BN;
  reduceRatio: BN;
  initialMintSize: BN;
  initialTargetMintSizePerEpoch: BN;
  feeRate: BN;
  liquidityTokensRatio: BN;
}

export type InitializeTokenAccounts = {
  protocolFeeAccount: PublicKey;
  mint: PublicKey;
  metadata: PublicKey;
  payer: PublicKey;
  configAccount: PublicKey;
  tokenVaultAta?: PublicKey;
  rent: PublicKey;
  systemProgram: PublicKey;
  systemConfigAccount: PublicKey;
  tokenProgram: PublicKey;
  tokenMetadataProgram: PublicKey;
}

export type InitiazlizedTokenData = {
  id: string;
  txId: string;
  admin: string;
  tokenId: string;
  mint: string;
  configAccount: string;
  metadataAccount: string;
  tokenVault: string;
  timestamp: string;
  status: number;
  metadataTimestamp: string;
  valueManager: string;
  wsolVault: string;
  graduateEpoch: string;

  // TokenMetadata
  tokenName: string;
  tokenSymbol: string;
  tokenUri: string;

  // TokenMintState
  supply: string;
  currentEra: string;
  currentEpoch: string;
  elapsedSecondsEpoch: string;
  startTimestampEpoch: string;
  lastDifficultyCoefficientEpoch: string;
  difficultyCoefficientEpoch: string;
  mintSizeEpoch: string;
  quantityMintedEpoch: string;
  targetMintSizeEpoch: string;
  totalMintFee: string;
  totalReferrerFee: string;
  totalTokens: string;

  // InitializeTokenConfigData
  targetEras: string;
  epochesPerEra: string;
  targetSecondsPerEpoch: string;
  reduceRatio: string;
  initialMintSize: string;
  initialTargetMintSizePerEpoch: string;
  feeRate: string;
  liquidityTokensRatio: string;
  startTimestamp: string;

  tokenMetadata?: TokenMetadataIPFS;
}

export type MintTokenData = {
  id: string;
  txId: string;
  sender: string;
  mint: string;
  configAccount: string;
  tokenVault: string;
  referralAccount: string;
  referrerMain: string;
  referrerAta: string;
  refundAccount: string;
  timestamp: string;

  // TokenMintState
  supply: string;
  currentEra: string;
  currentEpoch: string;
  elapsedSecondsEpoch: string;
  startTimestampEpoch: string;
  lastDifficultyCoefficientEpoch: string;
  difficultyCoefficientEpoch: string;
  mintSizeEpoch: string;
  quantityMintedEpoch: string;
  targetMintSizeEpoch: string;
  totalMintFee: string;
  totalReferrerFee: string;
  totalTokens: string;
}

export type RefundTokenData = {
  owner: PublicKey;
  totalTokens: BN;
  totalMintFee: BN;
  totalReferrerFee: BN;
}

export type TokenImageProps = {
  imageUrl: string | null;
  name: string;
  metadataTimestamp: number;
  size?: number;
  className?: string;
  round?: boolean;
}

export type AddressDisplayProps = {
  address: string;
  type?: string;
  isDevnet?: boolean;
  showCharacters?: number;
}

export type DiscoverProps = {
  expanded: boolean;
  hasDelegatedTokens: boolean;
};

export type TokenDetailProps = {
  expanded: boolean;
};

export type LanguageSelectorProps = {
  currentLocale: Language;
  onLocaleChange: (locale: Language) => void;
}

export type NavbarProps = {
  title?: string;
  onMenuClick?: () => void;
  isMenuOpen?: boolean;
}

export type MenuItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  component?: React.ReactNode;
  subItems?: MenuItem[];
  visible?: boolean;
};

export type SidebarProps = {
  menuItems: MenuItem[];
  activeMenuItem: string;
  onMenuItemClick: (id: string) => void;
  onExpandedChange?: (expanded: boolean) => void;
  isMobileOpen?: boolean;
}

export type TokenCardProps = {
  token: InitiazlizedTokenData;
}

export type TokenCardWebProps = {
  token: InitiazlizedTokenData;
  number?: number;
  type?: "static" | "scroll";
}

export type TokenFormData = {
  name: string;
  symbol: string;
  imageUrl: string;
  imageCid: string;
  description: string;
}

export type TokenAccount = {
  mint: string;
  amount: number;
  decimals: number;
}

export type MetricsProps = {
  mode: string;
  targetEras: string;
  epochesPerEra: string;
  targetSecondsPerEpoch: string;
  reduceRatio: string;
  initialTargetMintSizePerEpoch: string;
  initialMintSize: string;
  feeRate: string;
  liquidityTokensRatio: string;
  symbol: string;
}

export type TokenImageUploadProps = {
  onImageChange: (file: File | null) => void;
}

export type MyAccountProps = {
  expanded: boolean;
}

export type TokenListItem = {
  mint: string;
  amount: string;
  tokenData?: InitiazlizedTokenData;
  metadata?: TokenMetadataIPFS | undefined;
  totalMintFee?: BN;
}

export type HolderData = {
  owner: string;
  amount: string;
}

export type MintTransactionData = {
  id: string;
  txId: string;
  sender: string;
  timestamp: string;
  currentEra: string;
  currentEpoch: string;
  mintSizeEpoch: string;
}

export type RefundTransactionData = {
  id: string;
  txId: string;
  sender: string;
  timestamp: string;
  burnAmountFromUser: string;
  burnAmountFromVault: string;
  refundFee: string;
  refundAmountIncludingFee: string;
}

export type ReferralCodeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  token: TokenListItem
  metadata: TokenMetadataIPFS;
}

export type ReferrerData = {
  codeHash: PublicKey;
  referrerMain: PublicKey;
  referrerAta: PublicKey;
  usageCount: number;
  activeTimestamp: BN;
}

export type PaginationProps = {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  hasMore?: boolean;
}

export type ShareButtonProps = {
  token: InitiazlizedTokenData;
  metadata: TokenMetadataIPFS;
  inputCode: string | undefined;
}

export type ToggleSwitchProps = {
  id: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}

export type AdvancedSettingsProps = {
  targetEras: string;
  epochesPerEra: string;
  targetSecondsPerEpoch: string;
  reduceRatio: string;
  displayInitialMintSize: string;
  displayInitialTargetMintSizePerEpoch: string;
  displayFeeRate: string;
  liquidityTokensRatio: string;
  onTargetErasChange: (value: string) => void;
  onEpochesPerEraChange: (value: string) => void;
  onTargetSecondsPerEpochChange: (value: string) => void;
  onReduceRatioChange: (value: string) => void;
  onDisplayInitialMintSizeChange: (value: string, mintSize: string) => void;
  onDisplayInitialTargetMintSizePerEpochChange: (value: string, targetMintSize: string) => void;
  onDisplayFeeRateChange: (value: string, feeRate: string) => void;
  onLiquidityTokensRatioChange: (value: string) => void;
}

export type SocialInformationProps = {
  description: string;
  website: string;
  twitter: string;
  discord: string;
  telegram: string;
  github: string;
  medium: string;
  onDescriptionChange: (value: string) => void;
  onWebsiteChange: (value: string) => void;
  onTwitterChange: (value: string) => void;
  onDiscordChange: (value: string) => void;
  onTelegramChange: (value: string) => void;
  onGithubChange: (value: string) => void;
  onMediumChange: (value: string) => void;
}

export type RefundModalProps = {
  isOpen: boolean;
  onClose: () => void;
  token: TokenListItem;
}

export type TokenChartsProps = {
  token: InitiazlizedTokenData;
  height: number;
}

export type TokenHoldersProps = {
  token: InitiazlizedTokenData;
}

export type TokenInfoProps = {
  token: InitiazlizedTokenData;
  referrerCode: string | undefined;
  tokenData: OrderedToken | null;
  fetchTokenData: () => Promise<void>;
  isCommentOpen: boolean;
  setIsCommentOpen: (bl: boolean) => void;
}

export type TokenMintTransactionsProps = {
  token: InitiazlizedTokenData;
}

export type TokenRefundTransactionsProps = {
  token: InitiazlizedTokenData;
}

export type SocialLink = {
  name: string;
  url: string;
}

export type LaunchTokenFormProps = {
  expanded: boolean;
}

export type ToastBoxProps = {
  title: string
  url: string
  urlText: string
}

export type RenderSocialIconsProps = {
  metadata: TokenMetadataIPFS;
}

export type DataBlockProps = {
  label: string;
  value: any;
  tooltip?: string;
}

export type MyUniqueReferralCodeProps = {
  expanded: boolean;
}


export type CheckURCProps = {
  expanded: boolean;
}

export type CommonPageProps = {
  expanded: boolean;
}

export type SetRefererCodeEntity = {
  id?: string;
  mint: string;
  referralAccount: string;
  referrerAta: string;
  referrerMain: string;
  activeTimestamp: number;
  usageCount?: number;
  codeHash?: string;
  tokenBalance?: number | null;
  isProcessing?: boolean;
}

export type OnChainReferralData = {
  codeHash: string;
  usageCount: number;
  activeTimestamp: number;
  tokenBalance: number | null;
}

export type ResponseData = {
  success: boolean;
  message?: string;
  data?: any;
}

export type MintData = {
  timestamp: string;
  mintSizeEpoch: string;
};

export type ReferralData = {
  referralAccount: PublicKey;
  mint: PublicKey;
  codeHash: PublicKey;
  referrerMain: PublicKey;
  referrerAta: PublicKey;
  usageCount: number;
  activeTimestamp: BN;
  tokenBalance?: number | null;
  acturalPay?: BN;
  urcProviderBonus?: BN;
}

export type TokenHeroProps = {
  token: InitiazlizedTokenData;
  metadata: TokenMetadataIPFS;
  referrerCode: string | undefined;
  tokenData: OrderedToken | null;
  fetchTokenData: () => Promise<void>;
  isCommentOpen: boolean;
  setIsCommentOpen: (isCommentOpen: boolean) => void;
}

export type MetadataAccouontData = {
  key: number;
  updateAuthority: PublicKey;
  mint: PublicKey;
  data: {
    name: string;
    symbol: string;
    uri: string;
    sellerFeeBasisPoints: number;
    creators: {
      address: PublicKey;
      verified: boolean;
      share: number;
    }[];
  };
  isMutable: boolean;
  collection: {
    key: string;
    verified: boolean;
  } | null;
};

export type MintExtentionType = "transferHook" | "metadataPointer" | "tokenMetadata";
export type MintExtentionData = {
  extension: MintExtentionType;
  state: any;
}

export type TransferHookState = {
  authority: string | null;
  programId: string | null;
}

export type PoolData = {
  poolAddress: string;
  cpSwapPoolState: CpSwapPoolStateData;
  mintIsToken0?: boolean;
}
export type CpSwapPoolStateData = {
  openTime: number;
  ammConfig: string;
  poolCreator: string;
  lpMint: string;
  token0Vault: string;
  token1Vault: string;
  token0Mint: string;
  token0Program: string;
  token1Mint: string;
  token1Program: string;
  status: number;
  lpAmount: number;
  token0Amount: number | null;
  token1Amount: number | null;
}

export type RemainingAccount = {
  pubkey: PublicKey,
  isWritable: boolean,
  isSigner: boolean
}

// export type TargetTimestampData = {
//   currentTimestamp: number,
//   currentEpoch: number,
//   absoluteSlot: number,
//   slotsInEpoch: number,
//   slotIndex: number,
//   futureTimestamp: number;
//   wait: number;
//   secondsPerSlot: number;
// }

export type User = {
  id: number;
  wallet_address: string;
  username: string;
  avatar: string | null;
  roles: string;
  hides: string;
  email: string | null;
  bio: string | null;
  social_links: string | null;
  created_at: string;
  updated_at: string;
}

export type Activity = {
  id: number;
  userId: number;
  activityType: 'issue_token' | 'promote' | 'manage' | 'mint' | 'comment' | 'like_comment' | 'unlike_comment' | 'rate' | 'like' | 'unlike' | 'follow' | 'unfollow' | 'join' | 'delete_comment',
  targetId: string | null;
  avatar: string | null;
  targetType: 'token' | 'user' | null;
  createdAt: string;
  targetUsername: string | null;
  targetWalletAddress: string | null;
  userUsername: string | null;
  userWalletAddress: string | null;
  content: string | null;
};

export enum Role {
  ISSUER = "issuer", // developer
  PROMOTER = "promoter", // urc provider
  MANAGER = "manager", // value manager
}

export type OrderedUser = {
  admin: string;
  role: Role[] | Role;
  hides: Role[] | Role;
  tokenCount: number[] | number;
  userId: number | null;
  username?: string | null;
  email?: string | null;
  bio?: string | null;
  socialLinks?: string | null;
  totalLike: number;
  totalComments: number;
  avatar?: string | null;
  totalFollower: number;
  totalFollowee: number;
  isFollowedByMe: boolean;
  isFollowingMe: boolean;
  isLikedByMe: boolean;
  isLikingMe: boolean;
};

export type OrderedToken = {
  mint: string,
  admin: string,
  userId: number,
  isFollowedByMe: boolean,
  isLikedByMe: boolean,
  tokenName: string,
  tokenSymbol: string,
  tokenUri: string,
  timestamp: string,
  totalFollowee: number,
  totalLike: number,
  totalComments: number,
  valueManager: string,
}

export type Comment = {
  id: number;
  userId: number;
  username: string;
  walletAddress: string;
  avatar: string;
  content: string;
  likes: number;
  liked: boolean;
  totalReplies: number;
  createdAt: string;
  replies?: Comment[];
};

export type UserAPIResponse = {
  success: boolean;
  data?: any;
  message?: string;
}

export type FAQ = {
  id: number;
  label: string;
  questions: string[];
}

export type Language = 'en-US' | 'zh-CN' | 'zh-TW' | 'ja-JP' | 'es-ES' | 'vi-VN';

export interface NetworkConfig {
  isPaused: boolean;
  frontendUrl: string;
  irysGatewayUrl: string;
  apiBaseUrl: string;
  scanUrl: string;
  systemDeployer: PublicKey;
  protocolFeeAccount: PublicKey;
  allowOwnerOffCurveForProtocolFeeAccount: boolean;
  tokenMetadataProgramId: PublicKey;
  cpSwapProgram: PublicKey;
  cpSwapConfigAddress: PublicKey;
  createPoolFeeReceive: PublicKey;
  memoProgram: PublicKey;
  addressLookupTableAddress: PublicKey;
  subgraphUrl: string;
  thegraphApiKey?: string;
  launchRuleAccount: PublicKey;
  chartApiUrl: string;
}

export interface NetworkConfigs {
  devnet: NetworkConfig;
  mainnet_beta: NetworkConfig; 
}