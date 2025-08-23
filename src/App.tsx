import { useMemo, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import {
  ConnectionProvider,
  useAnchorWallet,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import {
  WalletModalProvider,
} from '@solana/wallet-adapter-react-ui';
import {
  SolanaMobileWalletAdapter,
  createDefaultAddressSelector,
  createDefaultAuthorizationResultCache,
  createDefaultWalletNotFoundHandler,
} from '@solana-mobile/wallet-adapter-mobile';
// import { clusterApiUrl } from '@solana/web3.js';
import { Navbar } from './components/common/Navbar';
import { Toaster } from 'react-hot-toast';
import { Sidebar } from './components/common/Sidebar';
import { menuItems } from './config/menu';
import { TokenDetail } from './pages/TokenDetail';
import { APP_NAME, COPILOTKIT_RUNTIME_URL, NETWORK_CONFIGS } from './config/constants';
import { Discover } from './pages/Discover';
import { MyMintedTokens } from './pages/MyMintedTokens';
import { MyDeployments } from './pages/MyDeployments';
import { AskAI } from './pages/AskAI';
import { LaunchTokenForm } from './pages/LaunchToken';
import { CheckURC } from './components/tools/CheckURC';
import { MyUniqueReferralCode } from './components/tools/MyUniqueReferralCode';
import { CreateLiquidityPool } from './pages/CreateLiquidityPool';
import { ManageLiquidity } from './pages/ManageLiquidity';
import { DelegatedTokens } from './pages/DelegatedTokens';
import { TradingBot } from './pages/TradingBot';
import { useLazyQuery } from '@apollo/client';
import { queryMyDelegatedTokens } from './utils/graphql';
import { CopilotKit } from "@copilotkit/react-core";
import "@copilotkit/react-ui/styles.css";
import { MyCopilotKit } from './components/agent/MyCopilotKit';
import { SocialFeed } from './pages/SocialFeed';
import { SocialProfile } from './pages/SocialProfile';
import { SocialExplore } from './pages/SocialExplore';
import { SocialUserDetails } from './pages/SocialUserDetails';
import { useDeviceType } from './hooks/device';
import { AuthProvider } from './hooks/auth';
import './i18n/i18n';
import { useTranslation } from 'react-i18next';
// import MaintenanceBanner from './components/common/MaintenanceBanner';
require('@solana/wallet-adapter-react-ui/styles.css');

const AppContent = () => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(true);
  const [hasDelegatedTokens, setHasDelegatedTokens] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState(() => {
    return localStorage.getItem('selectedMenuItem') || 'balance';
  });
  const { isMobile } = useDeviceType();
  const wallet = useAnchorWallet();
  const { t } = useTranslation();

  const [getDelegatedTokens, { data: delegatedTokens }] = useLazyQuery(queryMyDelegatedTokens);

  useEffect(() => {
    if(wallet) {
      getDelegatedTokens({
        variables: {
          wallet: wallet?.publicKey.toString(),
          skip: 0,
          first: 10,
        },
      });
    }
  }, [getDelegatedTokens, wallet]);

  useEffect(() => {
    if (delegatedTokens && delegatedTokens.initializeTokenEventEntities && delegatedTokens.initializeTokenEventEntities.length > 0) {
      setHasDelegatedTokens(true);
    } else {
      setHasDelegatedTokens(false);
    }
  }, [delegatedTokens]);

  useEffect(() => {
    localStorage.setItem('selectedMenuItem', selectedMenuItem);
  }, [selectedMenuItem]);

  // const getActiveComponent = () => {
  //   for (const item of menuItems(expanded, hasDelegatedTokens)) {
  //     if (item.subItems) {
  //       const subItem = item.subItems.find(sub => sub.id === selectedMenuItem);
  //       if (subItem) return subItem.component;
  //     }
  //     if (item.id === selectedMenuItem) return item.component;
  //   }
  //   return null;
  // };

  return (
    <div className="min-h-screen bg-base-100 flex flex-col">
      <Navbar
        title={APP_NAME}
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        isMenuOpen={isSidebarOpen}
      />

      <div className="flex-1 flex flex-col md:flex-row mt-16">
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <div className={`
            fixed md:top-16 inset-y-0 left-0 z-30
            transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            md:translate-x-0 transition-transform duration-300 ease-in-out
        `}>
          <Sidebar
            menuItems={menuItems(expanded, hasDelegatedTokens, t)}
            activeMenuItem={selectedMenuItem}
            onMenuItemClick={(id: string) => {
              setSelectedMenuItem(id);
              setIsSidebarOpen(false);
              navigate(`/${id}`);
            }}
            isMobileOpen={isSidebarOpen}
            onExpandedChange={setExpanded}
          />
        </div>

        <div className="flex-1 p-4 md:p-8 pb-20">
          <Routes>
            <Route path="/" element={<Discover expanded={expanded} hasDelegatedTokens={hasDelegatedTokens} graduatedToken={false} />} />
            <Route path="/discover" element={<Discover expanded={expanded} hasDelegatedTokens={hasDelegatedTokens} graduatedToken={false} />} />
            <Route path="/graduated" element={<Discover expanded={expanded} hasDelegatedTokens={hasDelegatedTokens} graduatedToken={true} />} />
            <Route path="/launch-token" element={<LaunchTokenForm expanded={expanded} />} />
            <Route path="/my-minted-tokens" element={<MyMintedTokens expanded={expanded} />} />
            <Route path="/my-deployments" element={<MyDeployments expanded={expanded} />} />
            <Route path="/my-delegated-tokens" element={<DelegatedTokens expanded={expanded} />} />
            <Route path="/create-liquidity-pool" element={<CreateLiquidityPool expanded={expanded} />} />
            <Route path="/create-liquidity-pool/:mint" element={<CreateLiquidityPool expanded={expanded} />} />
            <Route path="/manage-liquidity/:mint" element={<ManageLiquidity expanded={expanded} operator='vm' />} />
            <Route path="/manage-liquidity" element={<ManageLiquidity expanded={expanded} operator='vm' />} />
            <Route path="/burn-lp/:mint" element={<ManageLiquidity expanded={expanded} operator='issuer' />} />
            <Route path="/trading-bot" element={<TradingBot expanded={expanded} />} />
            <Route path="/trading-bot/:mint" element={<TradingBot expanded={expanded} />} />
            <Route path="/check-urc" element={<CheckURC expanded={expanded} />} />
            <Route path="/my-urc" element={<MyUniqueReferralCode expanded={expanded} />} />
            <Route path="/ask-ai" element={<AskAI expanded={expanded} />} />
            <Route path="/social-explore" element={<SocialExplore expanded={expanded} />} />
            <Route path="/token/:tokenMintAddress" element={<TokenDetail expanded={expanded} />} />
            <Route path="/token/:tokenMintAddress/:referrerCode" element={<TokenDetail expanded={expanded} />} />
            <Route path="/social-feed" element={<SocialFeed expanded={expanded} />} />
            <Route path="/social-profile" element={<SocialProfile expanded={expanded} />} />
            <Route path="/social-user-details/:address" element={<SocialUserDetails expanded={expanded} />} />
          </Routes>
        </div>
      </div>
      <Toaster
        position={isMobile ? "top-center" : "bottom-right"}
        toastOptions={{
          duration: 5000,
        }}
      />
      {/* <Footer /> */}
      <MyCopilotKit />
    </div>
  );
};
// https://brinna-qcbvnp-fast-mainnet.helius-rpc.com
function App() {
  const network = (process.env.REACT_APP_NETWORK as keyof typeof NETWORK_CONFIGS) || "devnet";
  // const endpoint = useMemo(() => clusterApiUrl(network.replace("_", "-") as WalletAdapterNetwork), [network]);
  const endpoint = network === 'devnet' ? process.env.REACT_APP_DEVNET_RPC : process.env.REACT_APP_MAINNET_RPC;

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new SolanaMobileWalletAdapter({
        addressSelector: createDefaultAddressSelector(),
        appIdentity: {
          name: "Flipflop",
          uri: NETWORK_CONFIGS[network].frontendUrl,
          icon: "logo192.png", // resolves to https://myapp.io/relative/path/to/icon.png
        },
        authorizationResultCache: createDefaultAuthorizationResultCache(),
        cluster: process.env.REACT_APP_NETWORK as WalletAdapterNetwork,
        onWalletNotFound: createDefaultWalletNotFoundHandler(),
      }),
    ],
    [],
  );

  // if (NETWORK_CONFIGS[network].isPaused) {
  //   return (
  //     <div className="min-h-screen bg-base-100 flex flex-col">
  //       <Navbar title={APP_NAME} />
  //       <MaintenanceBanner />
  //     </div>
  //   )
  // } else {
    return (
      <Router>
        <CopilotKit runtimeUrl={COPILOTKIT_RUNTIME_URL}>
          <ConnectionProvider endpoint={endpoint || "https://api.devnet.solana.com"}>
            <WalletProvider
              wallets={wallets}
              autoConnect
              onError={(error: Error) => {
                console.error('Wallet error:', error);
              }}
            >
              <WalletModalProvider>
                <AuthProvider>
                  <AppContent />
                </AuthProvider>
              </WalletModalProvider>
            </WalletProvider>
          </ConnectionProvider>
        </CopilotKit>
      </Router>
    )
  // }
}

export default App;
