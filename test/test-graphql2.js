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
  const started = Date.now();
  try {
    const res = await axios.post(
      ENDPOINT,
      { query, variables },
      { headers: { 'Content-Type': 'application/json' }, timeout: 30_000 }
    );
    const took = Date.now() - started;
    const { data } = res;
    if (data.errors) {
      return { ok: false, took, error: data.errors, summary: null, status: res.status };
    }
    const summary = summarizeData(data.data);
    return { ok: true, took, error: null, summary, status: res.status, data: data.data };
  } catch (err) {
    const took = Date.now() - started;
    return { ok: false, took, error: err?.response?.data || err?.message || err, summary: null, status: err?.response?.status };
  }
}

function summarizeData(payload) {
  if (!payload || typeof payload !== 'object') return 'no data';
  const keys = Object.keys(payload);
  if (keys.length === 0) return 'empty object';
  const rootKey = keys[0];
  const root = payload[rootKey];
  let count = undefined;
  if (root && typeof root === 'object') {
    if (Array.isArray(root.nodes)) count = root.nodes.length;
    else if (typeof root.totalCount === 'number') count = root.totalCount;
  }
  return { rootKey, count, keys: Object.keys(root || {}) };
}

function pickFirstNode(payload) {
  if (!payload || typeof payload !== 'object') return null;
  const rootKey = Object.keys(payload)[0];
  const root = payload[rootKey];
  if (!root || !Array.isArray(root.nodes) || root.nodes.length === 0) return null;
  return root.nodes[0];
}

function extractNodes(payload) {
  if (!payload || typeof payload !== 'object') return [];
  const rootKey = Object.keys(payload)[0];
  const root = payload[rootKey];
  if (!root || !Array.isArray(root.nodes)) return [];
  return root.nodes;
}

function logResult(name, result, opts = {}) {
  if (opts.skipped) {
    console.log(`[SKIP] ${name} - ${opts.reason || 'skipped'}`);
    return;
  }
  const status = result.ok ? 'PASS' : 'FAIL';
  const summary = result.ok ? JSON.stringify(result.summary) : JSON.stringify(result.error);
  console.log(`[${status}] ${name} (${result.status || 'ERR'}) - ${result.took}ms -> ${summary}`);
}

function getErrorMessages(error) {
  if (!error) return [];
  if (Array.isArray(error)) {
    return error.map(e => (e && typeof e.message === 'string' ? e.message : JSON.stringify(e))).filter(Boolean);
  }
  if (typeof error === 'object') {
    if (Array.isArray(error.errors)) {
      return error.errors.map(e => (e && typeof e.message === 'string' ? e.message : JSON.stringify(e))).filter(Boolean);
    }
    if (typeof error.message === 'string') return [error.message];
    try { return [JSON.stringify(error)]; } catch { return ['<non-serializable error>']; }
  }
  return [String(error)];
}

function isFilterPluginError(error) {
  const messages = getErrorMessages(error);
  return messages.some(m => /Unknown argument\s+"?filter"?/i.test(m));
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
  const bootstrapQuery = `
    query Bootstrap($first: Int!, $offset: Int!) {
      allInitializeTokenEventEntities(
        first: $first
        offset: $offset
        orderBy: TIMESTAMP_DESC
      ) {
        nodes {
          mint
          admin
          valueManager
          tokenSymbol
          tokenName
        }
      }
    }
  `;
  const bootstrapVars = { first: Math.max(DEFAULT_FIRST, 10), offset: DEFAULT_OFFSET };
  const bootstrap = await runQuery('bootstrap', bootstrapQuery, bootstrapVars);
  logResult('bootstrap', bootstrap);

  let sampleToken = null;
  let tokens = [];
  if (bootstrap.ok && bootstrap.data) {
    sampleToken = pickFirstNode(bootstrap.data);
    tokens = extractNodes(bootstrap.data);
  }

  const sampleMint = sampleToken?.mint || process.env.SAMPLE_MINT || '';
  const sampleAdmin = sampleToken?.admin || process.env.SAMPLE_WALLET || '';
  const sampleValueManager = sampleToken?.valueManager || sampleAdmin || process.env.SAMPLE_WALLET || '';
  const sampleSymbol = sampleToken?.tokenSymbol || sampleToken?.tokenName || 'flip';
  const mints = tokens.map(t => t.mint).filter(Boolean);
  if (sampleMint) mints.unshift(sampleMint);

  const offset = DEFAULT_OFFSET;
  const first = DEFAULT_FIRST;

  // Variables provider per query name
  const vars = {
    queryInitializeTokenEvent: { targetEras: 9_999_999, first, offset },
    queryHotInitializeTokenEvent: { targetEras: 9_999_999, first: Math.max(first, 10), offset },
    queryInitializeTokenEventGraduated: { targetEras: 0, first, offset },
    queryHotInitializeTokenEventGraduated: { targetEras: 0, first: Math.max(first, 10), offset },
    queryMyDeployments: { wallet: sampleAdmin, first, offset },
    queryMyDelegatedTokens: { wallet: sampleValueManager, first, offset },
    queryInitializeTokenEventBySearch: { searchQuery: sampleSymbol, first, offset },
    queryInitializeTokenEventByMints: { mints: mints.length ? mints.slice(0, 10) : [sampleMint].filter(Boolean), first, offset },
    queryTokenMintTransactions: { mint: sampleMint, first, offset },
    queryAllTokenMintForChart: { mint: sampleMint, first, offset },
    GET_MINT_TRANSACTIONS: { mintAddress: sampleMint, limit: first, offset },
    queryTokenRefundTransactions: { mint: sampleMint, first, offset },
    queryHolders: { mint: sampleMint, first, offset },
    queryMyTokenList: { owner: sampleAdmin, first, offset },
    queryTokensByMints: { mints: mints.length ? mints.slice(0, 10) : [sampleMint].filter(Boolean), first, offset },
    querySetRefererCodeEntitiesByOwner: { owner: sampleAdmin, first, offset },
    queryTotalReferrerBonus: { mint: sampleMint, referrerMain: sampleAdmin },
    queryTotalReferrerBonusSum: { mints: mints.length ? mints.slice(0, 10) : [sampleMint].filter(Boolean), referrerMain: sampleAdmin },
    queryTrades: { mint: sampleMint, first, offset },
    queryLiquidities: { mint: sampleMint, first, offset },
    queryBurnLp: { mint: sampleMint, first, offset },
  };

  const results = [];

  for (const name of names) {
    const query = queries[name];
    let variables = vars[name] || {};

    // Heuristic: if variables contain required fields but values are empty, skip with warning
    const needMint = /\$mint\s*:\s*String!/.test(query);
    if (needMint && !variables.mint) {
      logResult(name, null, { skipped: true, reason: 'missing sample mint. Set SAMPLE_MINT to force.' });
      results.push({ name, ok: false, skipped: true });
      continue;
    }

    const needOwner = /\$owner\s*:\s*String!/.test(query);
    if (needOwner && !variables.owner) {
      logResult(name, null, { skipped: true, reason: 'missing sample owner. Set SAMPLE_WALLET to force.' });
      results.push({ name, ok: false, skipped: true });
      continue;
    }

    const res = await runQuery(name, query, variables);

    // If backend not enabling connection-filter plugin, mark those queries as SKIP
    if (!res.ok && isFilterPluginError(res.error)) {
      logResult(name, null, { skipped: true, reason: 'backend missing connection-filter plugin (filter unsupported)' });
      results.push({ name, ok: false, skipped: true, reason: 'no-filter-plugin' });
      continue;
    }

    logResult(name, res);
    results.push({ name, ...res });
  }

  const pass = results.filter(r => r.ok).length;
  const fail = results.filter(r => r.ok === false && !r.skipped).length;
  const skipped = results.filter(r => r.skipped).length;

  console.log('--- Summary ---');
  console.log(`Total: ${results.length}, PASS: ${pass}, FAIL: ${fail}, SKIP: ${skipped}`);

  // Non-zero exit code on failure ONLY if there are real failures
  process.exit(fail > 0 ? 1 : 0);
})();