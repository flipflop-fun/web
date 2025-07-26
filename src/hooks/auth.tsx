// ==========================================
// ============ Auth Context ===============
// ==========================================

import { createContext, FC, useCallback, useContext, useEffect, useRef, useState } from "react";
import { User } from "../types/types";
import { getFollowing, login, register } from "../utils/user";
import toast from "react-hot-toast";
import { getWalletAddressFromToken } from "../utils/web3";
import { UsernameModal } from "../components/common/UsernameModal";
import { generateDefaultUsername } from "../utils/format";
import { useWallet } from "@solana/wallet-adapter-react";
import { WALLET_SIGN_MESSAGE } from "../config/constants";
import bs58 from 'bs58';
import { PublicKey } from "@solana/web3.js";
import { useTranslation } from "react-i18next";

type AuthContextType = {
  token: string | null;
  walletAddress: string | null;
  following: User[];
  isUsernameModalOpen: boolean;
  isLoggingIn: boolean;
  handleLogin: () => Promise<void>;
  logout: () => void;
  refreshFollowing: () => Promise<void>;
}

type AuthProviderProps = {
  children: React.ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const { publicKey: pubKey, connect, wallet, disconnect, connected, signMessage } = useWallet();
  const [token, setToken] = useState<string | null>(localStorage.getItem('flipflop_token'));
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [following, setFollowing] = useState<User[]>([]);
  const [isUsernameModalOpen, setIsUsernameModalOpen] = useState(false);
  const [pendingRegistration, setPendingRegistration] = useState<{
    publicKey: string;
    signatureBase58: string;
    message: string;
  } | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const initialLoginAttemptedRef = useRef(false);
  const handledLoginRef = useRef(false);
  const { t } = useTranslation();

  // Define callback functions first
  const refreshFollowing = useCallback(async () => {
    if (signMessage && connected && token) {
      try {
        const result = await getFollowing(token);
        if (!result.success) {
          if (result.message === "Invalid token") {
            if (!isLoggingIn) handleLogin();
          } else {
            toast.error(result.message as string);
          }
          return;
        }
        setFollowing(result.data);
      } catch (error) {
        console.error('Failed to fetch following:', error);
        toast.error(t('auth.refreshFollowingFailed'));
      }
    }
  }, [connected, signMessage, token, t, isLoggingIn]);

  const logout = useCallback(() => {
    setToken(null);
    setWalletAddress(null);
    setFollowing([]);
    localStorage.removeItem('flipflop_token');
    disconnect();
  }, [disconnect]);

  const handleLogin = useCallback(async () => {
    if (isLoggingIn || isUsernameModalOpen || pendingRegistration || !signMessage || !pubKey) {
      return;
    }
    setIsLoggingIn(true);

    try {
      const encodedMessage = new TextEncoder().encode(WALLET_SIGN_MESSAGE);
      const signature = await signMessage(encodedMessage);
      const signatureBase58 = bs58.encode(signature);

      const publicKey = pubKey.toString();
      const result = await login(publicKey, signatureBase58, WALLET_SIGN_MESSAGE);
      
      if (result.success) {
        const { token } = result.data;
        setToken(token);
        setWalletAddress(publicKey);
        localStorage.setItem('flipflop_token', token);
        await refreshFollowing();
        toast.success(t('auth.loginSuccessful'));
      } else {
        setPendingRegistration({ publicKey, signatureBase58, message: WALLET_SIGN_MESSAGE });
        setIsUsernameModalOpen(true);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.message?.includes('User rejected')) {
        toast.error(t('auth.userRejected'));
      } else if (error.message?.includes('Wallet not connected')) {
        toast.error(t('auth.walletNotConnected'));
        try {
          await connect();
        } catch (connectError) {
          console.error('Connection error:', connectError);
        }
      } else {
        toast.error(t('auth.loginFailed') + (error.message || t('auth.unknownError')));
      }
    } finally {
      setIsLoggingIn(false);
    }
  }, [connect, isUsernameModalOpen, pendingRegistration, pubKey, refreshFollowing, signMessage, t, isLoggingIn]);

  // Handle username submission from modal
  const handleUsernameSubmit = async (username: string) => {
    if (!pendingRegistration) return;
    try {
      const { publicKey, signatureBase58, message } = pendingRegistration;
      const roles = 'issuer,participant,promoter'; // Deprecated => roles: participant, promoter, manager, issuer
      const result = await register(publicKey, username, roles, signatureBase58, message);
      if (result.success) {
        toast.success(t('auth.registrationSuccessful'))
        setIsUsernameModalOpen(false);
        const token = result.data.token;
        setToken(token);
        setWalletAddress(publicKey);
        localStorage.setItem('flipflop_token', token);
        await refreshFollowing();
      } else {
        toast.error(t('auth.registrationFailed') + ': ' + result.message as string);
        setPendingRegistration({ publicKey, signatureBase58, message });
        setIsUsernameModalOpen(true);
      }
    } catch (error) {
      alert(t('auth.registrationFailedGeneric'));
    }
  };

  const tryLoadLocalToken = useCallback(async () => {
    if (pubKey && signMessage && connected) {
      const storedToken = localStorage.getItem('flipflop_token');
      if (storedToken) {
        setToken(storedToken);
        const walletAddressFromToken = getWalletAddressFromToken(storedToken);
        if (walletAddressFromToken && walletAddressFromToken === pubKey.toString()) {
          setWalletAddress(walletAddressFromToken);
          refreshFollowing();
        } else {
          logout();
          handleLogin();
        }
      } else {
        if (!isLoggingIn && !isUsernameModalOpen && !pendingRegistration && !handledLoginRef.current) {
          handledLoginRef.current = true;
          handleLogin();
        }
      }
    }
  }, [pubKey, signMessage, connected, refreshFollowing, logout, handleLogin, isUsernameModalOpen, pendingRegistration, isLoggingIn]);

  useEffect(() => {
    if(signMessage && connected && pubKey && !isLoggingIn) {
      if (!initialLoginAttemptedRef.current) {
        initialLoginAttemptedRef.current = true;
        tryLoadLocalToken();
      }
    }
  }, [signMessage, connected, pubKey, tryLoadLocalToken, isLoggingIn]);

  return (
    <AuthContext.Provider
      value={{
        token,
        walletAddress,
        following,
        isLoggingIn: isLoggingIn,
        isUsernameModalOpen,
        handleLogin,
        logout,
        refreshFollowing,
      }}
    >
      {children}
      {pendingRegistration && (
        <UsernameModal
          isOpen={isUsernameModalOpen}
          onClose={() => {
            setIsUsernameModalOpen(false);
            setPendingRegistration(null);
          }}
          onSubmit={handleUsernameSubmit}
          defaultUsername={generateDefaultUsername(pendingRegistration.publicKey)}
        />
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const { t } = useTranslation();
  const context = useContext(AuthContext);
  if (!context) throw new Error(t('auth.authProviderError'));
  return context;
};