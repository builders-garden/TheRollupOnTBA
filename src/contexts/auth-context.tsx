import { sdk as miniappSdk } from "@farcaster/miniapp-sdk";
import { useQueryClient } from "@tanstack/react-query";
import posthog from "posthog-js";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
// hooks
import { useAccount, useDisconnect, useSignMessage } from "wagmi";
import { useFarcaster } from "@/contexts/farcaster-context";
import {
  useAuthCheck,
  useFarcasterSignIn,
  useLogout,
  useWalletSignIn,
} from "@/hooks/use-auth-hooks";
import { env } from "@/lib/env";
// other
import { User } from "@/types";
import { useEnvironment } from "./environment-context";

export type AuthMethod = "farcaster" | "wallet" | null;

interface AuthContextType {
  // User data
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;

  // Environment info
  authMethod: AuthMethod;

  // Wallet-specific data (only available when using wallet auth)
  walletAddress?: string;
  isWalletConnected: boolean;

  // Auth actions
  signOut: () => void;

  // Loading states
  isSigningIn: boolean;
  isSignedIn: boolean;

  // Utils
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  // Environment context (single source of truth for isMiniApp)
  const { isInMiniApp, isLoading: isEnvironmentLoading } = useEnvironment();

  // Miniapp context
  const { context: miniAppContext, isMiniAppReady } = useFarcaster();

  // Query client for cache invalidation
  const queryClient = useQueryClient();

  // Wallet hooks
  const { address: walletAddress, isConnected: isWalletConnected } =
    useAccount();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();

  // Local state
  const [user, setUser] = useState<User | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [authMethod, setAuthMethod] = useState<AuthMethod>(null);
  const [hasTriedInitialAuth, setHasTriedInitialAuth] = useState(false);
  const [environmentTimeout, setEnvironmentTimeout] = useState(false);

  // Ref to track logout state and prevent multiple logout calls
  const isLoggingOutRef = useRef(false);

  // Single user query - this is the only place we fetch user data
  // Always try to fetch on load to check for existing valid token
  const {
    user: authUser,
    refetch: refetchUser,
    isLoading: isFetchingUser,
    error: userError,
  } = useAuthCheck(); // Always fetch to check for existing token

  // Farcaster sign-in mutation
  const { mutate: farcasterSignIn } = useFarcasterSignIn({
    onSuccess: (data) => {
      console.log("Farcaster sign-in success:", data);
      if (data.success && data.user) {
        setAuthMethod("farcaster");
        setIsSigningIn(false);
        setIsSignedIn(true);
        setError(null);
        setUser(data.user);
        if (!env.NEXT_PUBLIC_POSTHOG_DISABLED) {
          posthog.identify(
            data.user.farcasterFid
              ? data.user.farcasterFid.toString()
              : data.user.id,
          );
        }
      }
    },
    onError: (error: Error) => {
      console.error("Farcaster sign-in error:", error);
      setError(error);
      setIsSigningIn(false);
      setIsSignedIn(false);
    },
  });

  // Wallet sign-in mutation
  const { mutate: walletSignIn } = useWalletSignIn({
    onSuccess: (data) => {
      console.log("Wallet sign-in success:", data);
      if (data.success && data.user) {
        setAuthMethod("wallet");
        setIsSigningIn(false);
        setIsSignedIn(true);
        setError(null);
        setUser(data.user);
        if (!env.NEXT_PUBLIC_POSTHOG_DISABLED) {
          posthog.identify(
            data.user.farcasterFid
              ? data.user.farcasterFid.toString()
              : data.user.id,
          );
        }
      }
    },
    onError: (error: Error) => {
      console.error("Wallet sign-in error:", error);
      setError(error);
      setIsSigningIn(false);
      setIsSignedIn(false);
    },
  });

  // Logout mutation
  const { mutate: logoutMutation } = useLogout({
    onSuccess: () => {
      isLoggingOutRef.current = false;
      // Clear auth state
      setAuthMethod(null);
      setIsSignedIn(false);
      setError(null);
      setHasTriedInitialAuth(false);
      setUser(null);
      // Invalidate user query after logout to clear cache
      queryClient.invalidateQueries({ queryKey: ["auth-check"] });
      queryClient.removeQueries({ queryKey: ["auth-check"] });
    },
    onError: () => {
      isLoggingOutRef.current = false;
    },
  });

  // Helper function to safely call logout
  const safeLogout = useCallback(
    (reason: string) => {
      if (!isLoggingOutRef.current) {
        isLoggingOutRef.current = true;
        logoutMutation({});
      }
    },
    [logoutMutation],
  );

  // Sign in with Farcaster (miniapp)
  const signInWithFarcaster = useCallback(async () => {
    if (!miniAppContext) {
      throw new Error("Not in mini app");
    }

    try {
      setIsSigningIn(true);
      setError(null);

      const referrerFid =
        miniAppContext.location?.type === "cast_embed"
          ? miniAppContext.location.cast.author.fid
          : undefined;

      const result = await miniappSdk.quickAuth.getToken();

      if (!result) {
        throw new Error("No token from SIWF Quick Auth");
      }

      farcasterSignIn({
        token: result.token,
        fid: miniAppContext.user.fid,
        referrerFid,
      });
    } catch (err) {
      console.error("Farcaster sign-in error:", err);
      setError(
        err instanceof Error ? err : new Error("Farcaster sign-in failed"),
      );
      setIsSigningIn(false);
    }
  }, [miniAppContext, farcasterSignIn]);

  // Sign in with wallet
  const signInWithWallet = useCallback(async () => {
    if (!walletAddress || !isWalletConnected) {
      throw new Error("No wallet connected");
    }

    try {
      setIsSigningIn(true);
      setError(null);

      // Create a message to sign
      const message = `Sign this message to verify your wallet address and log in.\n\nAddress: ${walletAddress}\nTimestamp: ${Date.now()}`;

      // Request signature
      const signature = await signMessageAsync({ message });

      // Send to backend for verification
      walletSignIn({
        address: walletAddress,
        message,
        signature,
      });
    } catch (err) {
      console.error("Wallet sign-in error:", err);
      setError(err instanceof Error ? err : new Error("Wallet sign-in failed"));
      setIsSigningIn(false);
    }
  }, [walletAddress, isWalletConnected, signMessageAsync, walletSignIn]);

  // Sign out
  const signOut = useCallback(() => {
    // Disconnect wallet if connected
    if (isWalletConnected && authMethod === "wallet") {
      disconnect();
    }

    // Call logout (state clearing happens in onSuccess)
    safeLogout("User initiated signOut");
  }, [isWalletConnected, authMethod, disconnect, safeLogout]);

  // Handle wallet disconnection
  useEffect(() => {
    // Skip if we're in the middle of logging out
    if (isLoggingOutRef.current) {
      return;
    }

    if (authMethod === "wallet" && !isWalletConnected) {
      // Wallet was disconnected, clear auth
      signOut();
    }
  }, [authMethod, isWalletConnected, signOut]);

  // Timeout for environment detection to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isEnvironmentLoading) {
        console.warn(
          "Environment detection timeout, proceeding with auth logic",
        );
        setEnvironmentTimeout(true);
      }
    }, 3000); // 3 second timeout

    return () => clearTimeout(timeout);
  }, [isEnvironmentLoading]);

  // Auto sign-in logic
  useEffect(() => {
    // Skip if we're in the middle of logging out
    if (isLoggingOutRef.current) {
      return;
    }

    // Wait for environment detection to complete (with timeout fallback)
    if (isEnvironmentLoading && !environmentTimeout) {
      return;
    }

    // If we're in a miniapp, wait for it to be ready
    if (isInMiniApp && !isMiniAppReady) {
      return;
    }

    // If we have a user from the initial fetch, determine the auth method
    if (authUser && !authMethod) {
      setIsSignedIn(true);
      setUser(authUser);
      if (!env.NEXT_PUBLIC_POSTHOG_DISABLED) {
        posthog.identify(
          authUser.farcasterFid
            ? authUser.farcasterFid.toString()
            : authUser.id,
        );
      }

      // For wallet users, validate that the current wallet matches the token
      if (authUser.wallets?.length > 0) {
        const userWalletAddresses = authUser.wallets.map((wa) =>
          wa.address.toLowerCase(),
        );
        const currentWalletAddress = walletAddress?.toLowerCase();

        // If there's a connected wallet and it matches the user's wallet, set auth method
        if (
          currentWalletAddress &&
          userWalletAddresses.includes(currentWalletAddress)
        ) {
          setAuthMethod("wallet");
          setHasTriedInitialAuth(true);
          return;
        }

        // If there's a connected wallet but it doesn't match, invalidate the session
        if (
          currentWalletAddress &&
          !userWalletAddresses.includes(currentWalletAddress)
        ) {
          // Clear current auth state but don't disconnect the wallet
          setAuthMethod(null);
          setError(null);
          setHasTriedInitialAuth(false);
          safeLogout("Wallet mismatch in auto sign-in logic");
          return;
        }

        // If no wallet is connected but user has wallet addresses, wait for wallet connection
        if (!currentWalletAddress) {
          setAuthMethod("wallet");
          setHasTriedInitialAuth(true);
          return;
        }
      } else if (authUser.farcasterFid) {
        setAuthMethod("farcaster");
        setHasTriedInitialAuth(true);
        return;
      }
    }

    // If we failed to fetch user (no valid token), mark that we've tried initial auth
    if (userError && !hasTriedInitialAuth) {
      setHasTriedInitialAuth(true);
    }

    // Only proceed with sign-in flows after we've tried the initial auth check
    if (!hasTriedInitialAuth || isSigningIn) {
      return;
    }

    // Auto sign-in with Farcaster if in miniapp and not authenticated
    if (isInMiniApp && miniAppContext && !authMethod && !authUser) {
      signInWithFarcaster();
    }
  }, [
    authUser,
    userError,
    authMethod,
    hasTriedInitialAuth,
    isInMiniApp,
    isMiniAppReady,
    isEnvironmentLoading,
    environmentTimeout,
    miniAppContext,
    isSigningIn,
    walletAddress,
    signInWithFarcaster,
    signOut,
    safeLogout,
    queryClient,
  ]);
  // NOTE: logoutMutation intentionally excluded to prevent infinite loops

  // Auto sign-in with wallet when wallet is connected
  useEffect(() => {
    // Skip if we're in the middle of logging out
    if (isLoggingOutRef.current) {
      return;
    }

    // Wait for environment detection to complete (with timeout fallback)
    if (isEnvironmentLoading && !environmentTimeout) {
      return;
    }

    // If we're in a miniapp, wait for it to be ready
    if (isInMiniApp && !isMiniAppReady) {
      return;
    }

    // Only proceed with wallet sign-in after we've tried initial auth check
    if (!hasTriedInitialAuth || isSigningIn) {
      return;
    }

    // If user is authenticated but with a different wallet, sign out and re-authenticate
    if (
      user &&
      authMethod === "wallet" &&
      walletAddress &&
      user.wallets?.length > 0
    ) {
      const userWalletAddresses = user.wallets.map((wa) =>
        wa.address.toLowerCase(),
      );
      const currentWalletAddress = walletAddress.toLowerCase();

      if (!userWalletAddresses.includes(currentWalletAddress)) {
        // Clear current auth and trigger new sign-in
        setAuthMethod(null);
        setHasTriedInitialAuth(false);
        // Don't call signOut() here as it would disconnect the wallet
        safeLogout("Wallet switch detected");
        return;
      }
    }

    // Auto sign-in with wallet if wallet is connected and not authenticated
    if (
      !isInMiniApp &&
      isWalletConnected &&
      walletAddress &&
      !authMethod &&
      (!user || userError) // Sign in if no user OR if there was an error fetching user
    ) {
      signInWithWallet();
    }
  }, [
    hasTriedInitialAuth,
    isInMiniApp,
    isMiniAppReady,
    isEnvironmentLoading,
    environmentTimeout,
    isWalletConnected,
    walletAddress,
    authMethod,
    user,
    userError,
    isSigningIn,
    signInWithWallet,
    safeLogout,
    queryClient,
  ]);
  // NOTE: logoutMutation intentionally excluded to prevent infinite loops

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user && authMethod !== null,
    isLoading:
      (isEnvironmentLoading && !environmentTimeout) || // Wait for environment detection
      (isInMiniApp && !isMiniAppReady) || // Wait for miniapp to be ready if we're in one
      isFetchingUser ||
      isSigningIn ||
      (!hasTriedInitialAuth && !userError),
    error: error || userError,
    authMethod,
    walletAddress,
    isWalletConnected,
    signOut,
    isSigningIn,
    isSignedIn,
    refetchUser: async () => {
      await refetchUser();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
