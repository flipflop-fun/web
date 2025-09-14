#!/usr/bin/env node
/*
  GraphQL queries smoke test for src/utils/graphql2.ts
  - Reads and parses exported template-string queries from graphql2.ts
  - Bootstraps sample variables by fetching a few InitializeTokenEvent rows
  - Executes every query with reasonable variables against the endpoint
  - Prints a concise PASS/FAIL/SKIP report with basic summaries

  Usage:
    node test/test-graphql2.js [--endpoint URL] [--limit N] [--offset N]

  Env overrides:
    GQL_ENDPOINT  - GraphQL HTTP endpoint
    LIMIT         - default page size (default 5)
    OFFSET        - default offset (default 0)
*/

const fs = require('fs');
const path = require('path');
const axios = require('axios');

// ---- CLI / ENV ----
const argv = process.argv.slice(2);
const getArg = (name, fallback) => {
  const idx = argv.indexOf(`--${name}`);
  if (idx !== -1 && argv[idx + 1]) return argv[idx + 1];
  return fallback;
};

const ENDPOINT = getArg('endpoint', process.env.GQL_ENDPOINT || 'https://graph-mainnet.flipflop.plus/graphql');
const DEFAULT_FIRST = parseInt(getArg('limit', process.env.LIMIT || '5'), 10) || 5;
const DEFAULT_OFFSET = parseInt(getArg('offset', process.env.OFFSET || '0'), 10) || 0;

const GRAPHQL2_PATH = path.resolve(__dirname, '../src/utils/graphql2.ts');

// ---- Utilities ----
function parseQueries(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const regex = /export const\s+(\w+)\s*=\s*`([\s\S]*?)`;/g;
  const queries = {};
  let match;
  while ((match = regex.exec(raw)) !== null) {
    const [, name, query] = match;
    queries[name] = query;
  }
  return queries;
}

async function runQuery(name, query, variables) {
  try {
    const res = await axios.post(
      ENDPOINT,
      { query, variables },
      { headers: { 'Content-Type': 'application/json' }, timeout: 30_000 }
    );

    const httpBody = res.data;
    console.log("httpBody", httpBody.data);
    return httpBody.data;
  } catch (err) {
    console.log(err)
    return null;
  }
}

(async function main() {
  console.log(`Using endpoint: ${ENDPOINT}`);
  const queries = parseQueries(GRAPHQL2_PATH);
  const names = Object.keys(queries);
  if (names.length === 0) {
    console.error('No exported queries found in graphql2.ts');
    process.exit(1);
  }

  // Bootstrap: fetch a few tokens WITHOUT using filter plugin features
  // const bootstrapQuery = `
  //   query Bootstrap($first: Int!, $offset: Int!) {
  //     allInitializeTokenEventEntities(
  //       first: $first
  //       offset: $offset
  //       orderBy: TIMESTAMP_DESC
  //     ) {
  //       nodes {
  //         mint
  //         admin
  //         valueManager
  //         tokenSymbol
  //         tokenName
  //       }
  //     }
  //   }
  // `;

  // const bootstrapQuery = `
  //   query Bootstrap($targetEras: BigFloat!, $first: Int!, $offset: Int!) {
  //     allInitializeTokenEventEntities(
  //       filter: { and: [{ status: { equalTo: 1 } }, { currentEra: { lessThanOrEqualTo: $targetEras } }] }
  //       first: $first
  //       offset: $offset
  //       orderBy: TIMESTAMP_DESC
  //     ) {
  //       nodes {
  //         mint
  //         admin
  //         valueManager
  //         tokenSymbol
  //         tokenName
  //       }
  //     }
  //   }
  // `;

  // const bootstrapQuery = `
  //   query GetHolders($mint: String!, $offset: Int!, $first: Int!) {
  //   allHoldersEntities(
  //     condition: { mint: $mint }
  //     offset: $offset
  //     first: $first
  //     orderBy: AMOUNT_DESC
  //   ) {
  //     nodes {
  //       owner
  //       amount
  //     }
  //     totalCount
  //   }
  // }
  // `;
  // const bootstrapQuery = `
  //   query GetTokenTransactions($mint: String!, $offset: Int!, $first: Int!) {
  //   allMintTokenEntities(
  //     condition: { mint: $mint }
  //     offset: $offset
  //     first: $first
  //     orderBy: TIMESTAMP_DESC
  //   ) {
  //     nodes {
  //       id
  //       txId
  //       sender
  //       timestamp
  //       currentEra
  //       currentEpoch
  //       mintSizeEpoch
  //     }
  //     totalCount
  //   }
  // }
  // `;
  // const bootstrapQuery = `
  //   query GetSetRefererCodeEntity($owner: String!, $offset: Int!, $first: Int!) {
  //   allSetRefererCodeEventEntities(
  //     condition: { referrerMain: $owner }
  //     offset: $offset
  //     first: $first
  //     orderBy: ID_DESC
  //   ) {
  //     nodes {
  //       id
  //       mint
  //       referralAccount
  //       referrerAta
  //       referrerMain
  //       activeTimestamp
  //     }
  //     totalCount
  //   }
  // }
  // `;

  // const bootstrapQuery = `
  //   query GetTotalReferrerBonusSum($mints: [String!]!, $referrerMain: String!) {
  //   allMintTokenEntities(
  //     filter: { and: [ { mint: { in: $mints } }, { referrerMain: { equalTo: $referrerMain } } ] }
  //   ) {
  //     nodes {
  //       mint
  //       referrerFee
  //     }
  //     totalCount
  //   }
  // }`

  // const bootstrapQuery = `
  //   query GetTotalReferrerBonusSum($referrerMain: String!) {
  //   allMintTokenEntities(
  //     filter: {
  //       or: [
  //         { mint: { equalTo: "FpuSjtzgiFKADiyPzW8EiayvmtYdqdQqoNYQS4Uz3PKR" } },
  //         { mint: { equalTo: "24goW3dRUodwy7zke7qyQWLueMiDAmpC4YBR5FohHMUn" } }
  //       ]
  //       referrerMain: { equalTo: $referrerMain }
  //     }
  //   ) {
  //     nodes {
  //       mint
  //       referrerFee
  //     }
  //     totalCount
  //   }
  // }`

  const bootstrapQuery = `
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
  }`
  const bootstrapVars = {wallet: "DJ3jvpv6k7uhq8h9oVHZck6oY4dQqY1GHaLvCLjSqxaD", first: Math.max(DEFAULT_FIRST, 10), offset: DEFAULT_OFFSET };
  // const bootstrapVars = {targetEras: 1, first: Math.max(DEFAULT_FIRST, 10), offset: DEFAULT_OFFSET };
  // const bootstrapVars = {
  //   mints: ["FpuSjtzgiFKADiyPzW8EiayvmtYdqdQqoNYQS4Uz3PKR", "24goW3dRUodwy7zke7qyQWLueMiDAmpC4YBR5FohHMUn"],
  //   referrerMain: "7Db1TTh4pHr1MuTmaJTpWoQqmkZ7712PEpQZ2DxWddep"
  // };
  const bootstrap = await runQuery('bootstrap', bootstrapQuery, bootstrapVars);
  // console.log(bootstrap);
})();