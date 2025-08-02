# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## FlipFlop.plus Web Client

**Overview**: A cutting-edge decentralized application (DApp) built on the Solana blockchain for token management, liquidity operations, and social trading features.

**Tech Stack**: React 18.3.1 + TypeScript, Solana Web3.js, Anchor Framework, Tailwind CSS, Raydium SDK v2

## Development Commands

### Setup & Installation
```bash
# Install dependencies
yarn install

# Environment setup
cp .env.example .env
```

### Development Workflow
```bash
# Start development server
yarn start

# Build for production
yarn build

# Run tests
yarn test
```

### Environment Configuration
Set these in `.env`:
- `REACT_APP_ENV`: development/production
- `REACT_APP_NETWORK`: devnet/mainnet_beta
- `REACT_APP_DEVNET_RPC`: Custom devnet RPC
- `REACT_APP_MAINNET_RPC`: Custom mainnet RPC

## Code Architecture

### Core Systems
- **Blockchain Layer**: Solana Web3.js + Anchor Framework
- **Wallet Integration**: Solana Wallet Adapter (Phantom, Solflare, Mobile)
- **State Management**: Apollo Client for GraphQL, React hooks for local state
- **Storage**: Arweave/Irys for metadata, IPFS fallback
- **Trading Engine**: Raydium SDK v2 for AMM operations

### Key PDA Structures
- **Mint**: `[MINT_SEED, name, symbol]`
- **Config**: `[CONFIG_DATA_SEED, mint]`
- **Referral**: `[REFERRAL_SEED, mint, referrer_pubkey]`
- **Code Account**: `[CODE_ACCOUNT_SEEDS, code_hash]`
- **Refund**: `[REFUND_SEEDS, mint, user_pubkey]`

### Directory Structure
- `src/` - Main application code
  - `components/` - Reusable UI components organized by feature
  - `pages/` - Route components for different views
  - `utils/web3.ts` - All Solana blockchain interactions (1700+ lines)
  - `utils/raydium_cpmm/` - Raydium concentrated liquidity instructions
  - `config/` - Environment configs and menu definitions
  - `types/` - TypeScript definitions and Anchor IDL types
  - `idl/` - Anchor program JSON definitions (devnet/mainnet)

## Communication Rules

### Language Guidelines
- **Chat interactions**: All conversations with Claude must be in English
- **Code comments**: All comments in source code must be in English
- **Console outputs**: All console.log/error/warn statements must be in English
- **Error messages**: All error messages and user-facing text must be in English
- **Exception**: Only i18n configuration files and locale JSON files may contain non-English content

### Code Standards
- **Components**: Use PascalCase (e.g., `TokenDetail`, `LaunchTokenForm`)
- **Functions**: Use camelCase for all utility functions
- **Constants**: Use UPPER_SNAKE_CASE for configuration constants
- **Files**: Use kebab-case for file names (e.g., `fair-mint-token.ts`)

### API Error Handling
All blockchain operations must use try-catch blocks with proper error handling:
```typescript
try {
  const result = await initializeToken(metadata, wallet, connection, config);
  return result;
} catch (error) {
  console.error('Failed to initialize token:', error);
  throw new Error('Token initialization failed');
}
```

### Chrome Extension Considerations
When working with browser extension features:
- **Content Scripts**: Handle DOM manipulation and page interactions
- **Background Scripts**: Handle Chrome extension APIs and background processing
- **Never** use Chrome APIs directly in React components

## Build System
- **Build Tool**: Craco (Create React App Configuration Override)
- **Bundler**: Webpack 5 via react-scripts
- **CSS**: Tailwind CSS + DaisyUI components
- **TypeScript**: 4.9.5 with strict mode