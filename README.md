# FlipFlop.plus Web Client

[![Version](https://img.shields.io/badge/version-0.2.17-blue.svg)](https://github.com/your-repo/flipflop-client)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-3178C6.svg)](https://www.typescriptlang.org/)
[![Solana](https://img.shields.io/badge/Solana-Anchor_0.30.1-9945FF.svg)](https://solana.com/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## Overview

FlipFlop.plus is a cutting-edge decentralized application (DApp) built on the Solana blockchain, providing a comprehensive platform for token management, liquidity operations, and social trading features. This repository contains the React-based frontend client that interfaces with Solana programs and backend APIs.

## 🚀 Key Features

- **Token Ecosystem Management**
  - Fair mint token creation and deployment
  - Advanced token metadata management
  - Multi-signature token operations

- **Liquidity Infrastructure**
  - Automated Market Maker (AMM) integration with Raydium
  - Liquidity pool creation and management
  - Real-time trading analytics

- **Social Trading Platform**
  - Community-driven token discovery
  - Social feeds and user profiles
  - AI-powered trading insights

- **Advanced Trading Tools**
  - Automated trading bot integration
  - Portfolio management dashboard
  - Transaction history and analytics

## 🛠 Technology Stack

- **Frontend Framework**: React 18.3.1 with TypeScript
- **Blockchain Integration**: Solana Web3.js, Anchor Framework
- **Wallet Connectivity**: Solana Wallet Adapter
- **UI Framework**: Tailwind CSS, DaisyUI
- **State Management**: Apollo Client (GraphQL)
- **Build Tools**: Craco, Webpack
- **Testing**: Jest, React Testing Library

## 📋 Prerequisites

- **Node.js**: Version 16.x or higher
- **Package Manager**: Yarn (recommended) or npm
- **Solana CLI**: Latest 2.0 or higher (for development)
- **Browser**: Modern browser(Chrome, Brave etc.) with Web3 wallet extension(phantom, solflare etc.)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/flipflop-fun/web.git
   cd web
   ```

2. **Install dependencies**
   
   ```
   yarn install
   or
   npm install
   ```

3. **Environment setup**
   
   ```
   cp .env.example .env
   ```

## ⚙️ Configuration
Configure your environment variables in the .env file:

### Environment Settings
- REACT_APP_ENV : Application environment
  - development : Uses local API endpoints for development
  - production : Uses deployed production API endpoints

- REACT_APP_NETWORK : Solana network configuration  
  - devnet : Connects to Solana Devnet with devnet-deployed programs
  - mainnet_beta : Connects to Solana Mainnet with mainnet-deployed programs

### Example Configuration
```
REACT_APP_ENV=development
REACT_APP_NETWORK=devnet
```

## 🚀 Development
### Start Development Server
```
yarn start
```
The application will be available at http://localhost:3000

### Build for Production
```
yarn build
```

## 🤝 Contributing
We welcome contributions from the community! Please follow these guidelines:

### Development Workflow
1. Fork the repository and create your feature branch
   
   ```
   git checkout -b feature/<amazing-feature>
   ```

2. Follow coding standards   
   - Use TypeScript for type safety
   - Follow ESLint and Prettier configurations
   - Write meaningful commit messages
   - Add tests for new features

3. Testing requirements
   - Ensure all existing tests pass
   - Add unit tests for new components
   - Test wallet integration thoroughly
   - Verify cross-browser compatibility

4. Code review process
   - Submit a detailed pull request
   - Include screenshots for UI changes
   - Reference related issues
   - Respond to review feedback promptly

### Contribution Areas
- 🐛 Bug fixes : Report and fix issues
- ✨ Feature development : Implement new functionality
- 📚 Documentation : Improve docs and examples
- 🎨 UI/UX improvements : Enhance user experience
- 🔧 Performance optimization : Improve app performance
- 🌐 Internationalization : Add language support

### Development Setup
- Ensure you have the latest dependencies installed
- Run the development server with hot reload
- Use browser developer tools for debugging
- Test with multiple Solana wallets

## 🐛 Issues and Support
If you encounter any issues or need support:

1. Check existing GitHub Issues: https://github.com/flipflop-fun/web/issues
2. Create a new issue with detailed information

## 📄 License
This project is licensed under the MIT License.

## 🙏 Acknowledgments
- Solana Foundation for the robust blockchain infrastructure
- Anchor team for the excellent development framework
- React and TypeScript communities for amazing tools
- All contributors who help improve this project
----

### Built with ❤️ for the Solana ecosystem