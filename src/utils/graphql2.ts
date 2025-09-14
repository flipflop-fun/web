// PostGraphile-style GraphQL queries
// NOTE: These are plain string queries (no gql tag) adapted from src/utils/graphql.ts
// Collections use `all*` root fields with { nodes { ... } totalCount }
// Pagination uses `first` and `offset`. Simple equals go in `condition`,
// complex logic/inequalities go in `filter` with operators like equalTo, lessThan, greaterThan, includesInsensitive, in, etc.

// 1) InitializeTokenEvent — currentEra <= targetEras

export const queryInitializeTokenEvent = `
  query GetInitializedTokenEvents($targetEras: BigFloat!, $first: Int = 50, $offset: Int = 0) {
    allInitializeTokenEventEntities(
      filter: {
        and: [
          { status: { equalTo: 1 } },
          { currentEra: { lessThanOrEqualTo: $targetEras } }
        ]
      }
      first: $first
      offset: $offset
      orderBy: TIMESTAMP_DESC
    ) {
      nodes {
        id
        txId
        admin
        tokenId
        mint
        configAccount
        metadataAccount
        tokenVault
        timestamp
        tokenName
        tokenSymbol
        tokenUri
        supply
        currentEra
        currentEpoch
        elapsedSecondsEpoch
        startTimestampEpoch
        lastDifficultyCoefficientEpoch
        difficultyCoefficientEpoch
        mintSizeEpoch
        quantityMintedEpoch
        targetMintSizeEpoch
        totalMintFee
        totalReferrerFee
        totalTokens
        targetEras
        epochesPerEra
        targetSecondsPerEpoch
        reduceRatio
        initialMintSize
        initialTargetMintSizePerEpoch
        feeRate
        liquidityTokensRatio
        startTimestamp
        status
        metadataTimestamp
        valueManager
        wsolVault
        graduateEpoch
      }
      totalCount
    }
  }
`;

// 2) Hot InitializeTokenEvent — currentEra <= targetEras, first: 100
export const queryHotInitializeTokenEvent = `
  query QueryHotInitializeTokenEvent($targetEras: BigFloat!, $first: Int = 100, $offset: Int = 0) {
    allInitializeTokenEventEntities(
      filter: { and: [{ status: { equalTo: 1 } }, { currentEra: { lessThanOrEqualTo: $targetEras } }] }
      first: $first
      offset: $offset
      orderBy: TIMESTAMP_DESC
    ) {
      nodes {
        id
        currentEra
        targetEras
        txId
        admin
        tokenId
        mint
        configAccount
        metadataAccount
        tokenVault
        timestamp
        tokenName
        tokenSymbol
        tokenUri
        supply
        currentEpoch
        elapsedSecondsEpoch
        startTimestampEpoch
        lastDifficultyCoefficientEpoch
        difficultyCoefficientEpoch
        mintSizeEpoch
        quantityMintedEpoch
        targetMintSizeEpoch
        totalMintFee
        totalReferrerFee
        totalTokens
        epochesPerEra
        targetSecondsPerEpoch
        reduceRatio
        initialMintSize
        initialTargetMintSizePerEpoch
        feeRate
        liquidityTokensRatio
        startTimestamp
        status
        metadataTimestamp
        valueManager
        wsolVault
        graduateEpoch
      }
      totalCount
    }
  }
`;

// 3) InitializeTokenEvent Graduated — currentEra > targetEras
export const queryInitializeTokenEventGraduated = `
  query GetInitializedTokenEvents($targetEras: BigFloat!, $first: Int = 50, $offset: Int = 0) {
    allInitializeTokenEventEntities(
      filter: {
        and: [
          { status: { equalTo: 1 } },
          { currentEra: { greaterThan: $targetEras } }
        ]
      }
      first: $first
      offset: $offset
      orderBy: TIMESTAMP_DESC
    ) {
      nodes {
        id
        txId
        admin
        tokenId
        mint
        configAccount
        metadataAccount
        tokenVault
        timestamp
        tokenName
        tokenSymbol
        tokenUri
        supply
        currentEra
        currentEpoch
        elapsedSecondsEpoch
        startTimestampEpoch
        lastDifficultyCoefficientEpoch
        difficultyCoefficientEpoch
        mintSizeEpoch
        quantityMintedEpoch
        targetMintSizeEpoch
        totalMintFee
        totalReferrerFee
        totalTokens
        targetEras
        epochesPerEra
        targetSecondsPerEpoch
        reduceRatio
        initialMintSize
        initialTargetMintSizePerEpoch
        feeRate
        liquidityTokensRatio
        startTimestamp
        status
        metadataTimestamp
        valueManager
        wsolVault
        graduateEpoch
      }
      totalCount
    }
  }
`;

// 4) Hot InitializeTokenEvent Graduated — currentEra > targetEras, first 100
export const queryHotInitializeTokenEventGraduated = `
  query QueryHotInitializeTokenEvent($targetEras: BigFloat!, $first: Int = 100, $offset: Int = 0) {
    allInitializeTokenEventEntities(
      filter: { and: [{ status: { equalTo: 1 } }, { currentEra: { greaterThan: $targetEras } }] }
      first: $first
      offset: $offset
      orderBy: TIMESTAMP_DESC
    ) {
      nodes {
        id
        currentEra
        targetEras
        txId
        admin
        tokenId
        mint
        configAccount
        metadataAccount
        tokenVault
        timestamp
        tokenName
        tokenSymbol
        tokenUri
        supply
        currentEpoch
        elapsedSecondsEpoch
        startTimestampEpoch
        lastDifficultyCoefficientEpoch
        difficultyCoefficientEpoch
        mintSizeEpoch
        quantityMintedEpoch
        targetMintSizeEpoch
        totalMintFee
        totalReferrerFee
        totalTokens
        epochesPerEra
        targetSecondsPerEpoch
        reduceRatio
        initialMintSize
        initialTargetMintSizePerEpoch
        feeRate
        liquidityTokensRatio
        startTimestamp
        status
        metadataTimestamp
        valueManager
        wsolVault
        graduateEpoch
      }
      totalCount
    }
  }
`;

// 5) My Deployments — by admin
export const queryMyDeployments = `
  query GetMyDeployments($wallet: String!, $offset: Int!, $first: Int!) {
    allInitializeTokenEventEntities(
      condition: { admin: $wallet, status: 1 }
      offset: $offset
      first: $first
      orderBy: TIMESTAMP_DESC
    ) {
      nodes {
        id
        txId
        admin
        tokenId
        mint
        configAccount
        metadataAccount
        tokenVault
        timestamp
        tokenName
        tokenSymbol
        tokenUri
        supply
        currentEra
        currentEpoch
        elapsedSecondsEpoch
        startTimestampEpoch
        lastDifficultyCoefficientEpoch
        difficultyCoefficientEpoch
        mintSizeEpoch
        quantityMintedEpoch
        targetMintSizeEpoch
        totalMintFee
        totalReferrerFee
        totalTokens
        targetEras
        epochesPerEra
        targetSecondsPerEpoch
        reduceRatio
        initialMintSize
        initialTargetMintSizePerEpoch
        feeRate
        liquidityTokensRatio
        startTimestamp
        status
        metadataTimestamp
        valueManager
        wsolVault
        graduateEpoch
      }
      totalCount
    }
  }
`;

// 6) My Delegated Tokens — by valueManager
export const queryMyDelegatedTokens = `
  query GetMyDelegatedTokens($wallet: String!, $offset: Int!, $first: Int!) {
    allInitializeTokenEventEntities(
      condition: { valueManager: $wallet, status: 1 }
      offset: $offset
      first: $first
      orderBy: TIMESTAMP_DESC
    ) {
      nodes {
        id
        txId
        admin
        tokenId
        mint
        configAccount
        metadataAccount
        tokenVault
        timestamp
        tokenName
        tokenSymbol
        tokenUri
        supply
        currentEra
        currentEpoch
        elapsedSecondsEpoch
        startTimestampEpoch
        lastDifficultyCoefficientEpoch
        difficultyCoefficientEpoch
        mintSizeEpoch
        quantityMintedEpoch
        targetMintSizeEpoch
        totalMintFee
        totalReferrerFee
        totalTokens
        targetEras
        epochesPerEra
        targetSecondsPerEpoch
        reduceRatio
        initialMintSize
        initialTargetMintSizePerEpoch
        feeRate
        liquidityTokensRatio
        startTimestamp
        status
        metadataTimestamp
        valueManager
        wsolVault
        graduateEpoch
      }
      totalCount
    }
  }
`;

// 7) Search initialize token events
export const queryInitializeTokenEventBySearch = `
  query GetInitializedTokenEvents($offset: Int!, $first: Int!, $searchQuery: String!) {
    allInitializeTokenEventEntities(
      first: $first
      offset: $offset
      filter: {
        and: [
          { status: { equalTo: 1 } },
          { or: [
              { tokenName: { includesInsensitive: $searchQuery } },
              { tokenSymbol: { includesInsensitive: $searchQuery } },
              { admin: { includesInsensitive: $searchQuery } },
              { mint: { includesInsensitive: $searchQuery } }
            ]
          }
        ]
      }
      orderBy: DIFFICULTY_COEFFICIENT_EPOCH_DESC
    ) {
      nodes {
        id
        txId
        admin
        tokenId
        mint
        configAccount
        metadataAccount
        tokenVault
        timestamp
        tokenName
        tokenSymbol
        tokenUri
        supply
        currentEra
        currentEpoch
        elapsedSecondsEpoch
        startTimestampEpoch
        lastDifficultyCoefficientEpoch
        difficultyCoefficientEpoch
        mintSizeEpoch
        quantityMintedEpoch
        targetMintSizeEpoch
        totalMintFee
        totalReferrerFee
        totalTokens
        targetEras
        epochesPerEra
        targetSecondsPerEpoch
        reduceRatio
        initialMintSize
        initialTargetMintSizePerEpoch
        feeRate
        liquidityTokensRatio
        startTimestamp
        status
        metadataTimestamp
        valueManager
        wsolVault
        graduateEpoch
      }
      totalCount
    }
  }
`;

export const queryInitializeTokenEventBySearchGraduated = `
  query GetInitializedTokenEvents($offset: Int!, $first: Int!, $searchQuery: String!) {
    allInitializeTokenEventEntities(
      filter: { and: [{ status: { equalTo: 1 } }, { currentEra: { greaterThan: $targetEras } }] }
      first: $first
      offset: $offset
      filter: {
        and: [
          { status: { equalTo: 1 } },
          { or: [
              { tokenName: { includesInsensitive: $searchQuery } },
              { tokenSymbol: { includesInsensitive: $searchQuery } },
              { admin: { includesInsensitive: $searchQuery } },
              { mint: { includesInsensitive: $searchQuery } }
            ]
          }
        ]
      }
      orderBy: DIFFICULTY_COEFFICIENT_EPOCH_DESC
    ) {
      nodes {
        id
        txId
        admin
        tokenId
        mint
        configAccount
        metadataAccount
        tokenVault
        timestamp
        tokenName
        tokenSymbol
        tokenUri
        supply
        currentEra
        currentEpoch
        elapsedSecondsEpoch
        startTimestampEpoch
        lastDifficultyCoefficientEpoch
        difficultyCoefficientEpoch
        mintSizeEpoch
        quantityMintedEpoch
        targetMintSizeEpoch
        totalMintFee
        totalReferrerFee
        totalTokens
        targetEras
        epochesPerEra
        targetSecondsPerEpoch
        reduceRatio
        initialMintSize
        initialTargetMintSizePerEpoch
        feeRate
        liquidityTokensRatio
        startTimestamp
        status
        metadataTimestamp
        valueManager
        wsolVault
        graduateEpoch
      }
      totalCount
    }
  }
`;

// 8) InitializeTokenEvent by mints (IN)
export const queryInitializeTokenEventByMints = `
  query GetInitializedTokenEvents($mints: [String!]!, $first: Int = 50, $offset: Int = 0) {
    allInitializeTokenEventEntities(
      first: $first
      offset: $offset
      filter: { and: [ { status: { equalTo: 1 } }, { mint: { in: $mints } } ] }
      orderBy: TIMESTAMP_DESC
    ) {
      nodes {
        id
        txId
        admin
        tokenId
        mint
        configAccount
        metadataAccount
        tokenVault
        timestamp
        tokenName
        tokenSymbol
        tokenUri
        supply
        currentEra
        currentEpoch
        elapsedSecondsEpoch
        startTimestampEpoch
        lastDifficultyCoefficientEpoch
        difficultyCoefficientEpoch
        mintSizeEpoch
        quantityMintedEpoch
        targetMintSizeEpoch
        totalMintFee
        totalReferrerFee
        totalTokens
        targetEras
        epochesPerEra
        targetSecondsPerEpoch
        reduceRatio
        initialMintSize
        initialTargetMintSizePerEpoch
        feeRate
        liquidityTokensRatio
        startTimestamp
        status
        metadataTimestamp
        valueManager
        wsolVault
        graduateEpoch
      }
      totalCount
    }
  }
`;

// 9) Token mint transactions (short list)
export const queryTokenMintTransactions = `
  query GetTokenTransactions($mint: String!, $offset: Int!, $first: Int!) {
    allMintTokenEntities(
      condition: { mint: $mint }
      offset: $offset
      first: $first
      orderBy: TIMESTAMP_DESC
    ) {
      nodes {
        id
        txId
        sender
        timestamp
        currentEra
        currentEpoch
        mintSizeEpoch
      }
      totalCount
    }
  }
`;

// 10) All token mints for chart (example provided by user)
export const queryAllTokenMintForChart = `
  query QueryAllTokenMintForChart($mint: String!, $offset: Int!, $first: Int!) {
    allMintTokenEntities(
      condition: { mint: $mint }
      offset: $offset
      first: $first
      orderBy: TIMESTAMP_DESC
    ) {
      nodes {
        timestamp
        mintSizeEpoch
        mintFee
        currentEra
        currentEpoch
      }
    }
  }
`;

// 10b) Additional general query (example provided by user)
export const GET_MINT_TRANSACTIONS = `
  query GetMintTransactions($mintAddress: String!, $limit: Int, $offset: Int) {
    allMintTokenEntities(
      condition: { mint: $mintAddress }
      offset: $offset
      first: $limit
      orderBy: TIMESTAMP_DESC
    ) {
      nodes {
        timestamp
        mintSizeEpoch
        mintFee
        currentEra
        currentEpoch
      }
      totalCount
    }
  }
`;

// 11) Refund transactions
export const queryTokenRefundTransactions = `
  query GetTokenTransactions($mint: String!, $offset: Int!, $first: Int!) {
    allRefundEventEntities(
      condition: { mint: $mint }
      offset: $offset
      first: $first
      orderBy: TIMESTAMP_DESC
    ) {
      nodes {
        id
        txId
        sender
        timestamp
        burnAmountFromUser
        burnAmountFromVault
        refundFee
        refundAmountIncludingFee
      }
      totalCount
    }
  }
`;

// 12) Holders by mint
export const queryHolders = `
  query GetHolders($mint: String!, $offset: Int!, $first: Int!) {
    allHoldersEntities(
      condition: { mint: $mint }
      offset: $offset
      first: $first
      orderBy: AMOUNT_DESC
    ) {
      nodes {
        owner
        amount
      }
      totalCount
    }
  }
`;

// 13) My token list (holders by owner)
export const queryMyTokenList = `
  query GetHolders($owner: String!, $offset: Int!, $first: Int!) {
    allHoldersEntities(
      condition: { owner: $owner }
      offset: $offset
      first: $first
      orderBy: AMOUNT_DESC
    ) {
      nodes {
        mint
        amount
      }
      totalCount
    }
  }
`;

// 14) Tokens by mints (IN)
export const queryTokensByMints = `
  query GetTokensByMints($offset: Int!, $first: Int!, $mints: [String!]!) {
    allInitializeTokenEventEntities(
      offset: $offset
      first: $first
      filter: { and: [ { status: { equalTo: 1 } }, { mint: { in: $mints } } ] }
      orderBy: TOKEN_ID_DESC
    ) {
      nodes {
        id
        txId
        admin
        tokenId
        mint
        configAccount
        metadataAccount
        tokenVault
        timestamp
        tokenName
        tokenSymbol
        tokenUri
        supply
        currentEra
        currentEpoch
        elapsedSecondsEpoch
        startTimestampEpoch
        lastDifficultyCoefficientEpoch
        difficultyCoefficientEpoch
        mintSizeEpoch
        quantityMintedEpoch
        targetMintSizeEpoch
        totalMintFee
        totalReferrerFee
        totalTokens
        targetEras
        epochesPerEra
        targetSecondsPerEpoch
        reduceRatio
        initialMintSize
        initialTargetMintSizePerEpoch
        feeRate
        liquidityTokensRatio
        startTimestamp
        status
        metadataTimestamp
        valueManager
        wsolVault
        graduateEpoch
      }
      totalCount
    }
  }
`;

// 15) SetReferrerCode by owner
export const querySetRefererCodeEntitiesByOwner = `
  query GetSetRefererCodeEntity($owner: String!, $offset: Int!, $first: Int!) {
    allSetRefererCodeEventEntities(
      condition: { referrerMain: $owner }
      offset: $offset
      first: $first
      orderBy: ID_DESC
    ) {
      nodes {
        id
        mint
        referralAccount
        referrerAta
        referrerMain
        activeTimestamp
      }
      totalCount
    }
  }
`;

// 16) Total referrer bonus (list by mint + referrerMain)
export const queryTotalReferrerBonus = `
  query GetTotalReferrerBonus($mint: String!, $referrerMain: String!) {
    allMintTokenEntities(
      filter: { and: [ { mint: { equalTo: $mint } }, { referrerMain: { equalTo: $referrerMain } } ] }
      orderBy: TIMESTAMP_DESC
    ) {
      nodes {
        txId
        sender
        mint
        refundAccount
        referrerMain
        timestamp
        currentEra
        currentEpoch
        mintSizeEpoch
        mintFee
        referrerFee
      }
      totalCount
    }
  }
`;

// 17) Total referrer bonus sum (per mints)
export const queryTotalReferrerBonusSum = `
  query GetTotalReferrerBonusSum($mints: [String!]!, $referrerMain: String!) {
    allMintTokenEntities(
      filter: { and: [ { mint: { in: $mints } }, { referrerMain: { equalTo: $referrerMain } } ] }
    ) {
      nodes {
        mint
        referrerFee
      }
      totalCount
    }
  }
`;

// 18) Trades
export const queryTrades = `
  query GetTrades($mint: String!, $offset: Int!, $first: Int!) {
    allProxySwapBaseEventEntities(
      offset: $offset
      first: $first
      condition: { tokenMint: $mint }
      orderBy: BLOCK_TIMESTAMP_DESC
    ) {
      nodes {
        id
        txId
        tokenMint
        tokenName
        tokenSymbol
        action
        baseMint
        priceMint
        baseAmount
        priceAmount
        poolState
        blockTimestamp
      }
      totalCount
    }
  }
`;

// 19) Liquidities
export const queryLiquidities = `
  query GetLiquidities($mint: String!, $offset: Int!, $first: Int!) {
    allProxyLiquidityEventEntities(
      offset: $offset
      first: $first
      condition: { tokenMint: $mint }
      orderBy: BLOCK_TIMESTAMP_DESC
    ) {
      nodes {
        id
        txId
        tokenMint
        tokenName
        tokenSymbol
        action
        token0Mint
        token1Mint
        token0Amount
        token1Amount
        poolState
        lpMint
        lpAmount
        blockTimestamp
      }
      totalCount
    }
  }
`;

// 20) Burn LP
export const queryBurnLp = `
  query GetBurnLp($mint: String!, $offset: Int!, $first: Int!) {
    allProxyBurnLpTokensEventEntities(
      offset: $offset
      first: $first
      condition: { tokenMint: $mint }
      orderBy: BLOCK_TIMESTAMP_DESC
    ) {
      nodes {
        id
        txId
        tokenMint
        tokenName
        tokenSymbol
        lpMint
        lpAmount
        blockTimestamp
      }
      totalCount
    }
  }
`;