import { createBaseAccountSDK } from "@base-org/account";
import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
// hooks
import { useMiniApp } from "@/contexts/mini-app-context";
import { useAuthCheck, useBaseSignIn, useLogout } from "@/hooks/use-auth-hooks";
import { User } from "@/lib/types/user.type";

interface AdminAuthContextType {
  user: {
    data: User | undefined;
    refetch: (options?: RefetchOptions) => Promise<
      QueryObserverResult<
        {
          user?: User;
          status: "ok" | "nok";
          error?: string;
        },
        Error
      >
    >;
  };
  signInWithBase: () => void;
  userLogout: () => void;
  isLoading: boolean;
  error: Error | null;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(
  undefined,
);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
};

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  // Environment context
  const { isInMiniApp } = useMiniApp();

  // Local state
  const [user, setUser] = useState<User>();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Single user query - this is the only place we fetch user data
  // Always try to fetch on load to check for existing valid token
  const {
    user: authUser,
    refetch: refetchUser,
    isLoading: isFetchingUser,
    isFetched: isFetchedAuthUser,
    error: userError,
  } = useAuthCheck(); // Always fetch to check for existing token

  // Farcaster sign-in mutation
  const { mutate: baseSignIn } = useBaseSignIn({
    onSuccess: (data) => {
      console.log("Base sign-in success:", data);
      if (data.success && data.user) {
        setIsSigningIn(false);
        setError(null);
        setUser(data.user);
      }
    },
    onError: (error: Error) => {
      console.error("Farcaster sign-in error:", error);
      setError(error);
      setIsSigningIn(false);
    },
  });

  // Logout mutation
  const { mutate: logout } = useLogout({
    onSuccess: () => {
      setUser(undefined);
      setIsLoggingOut(false);
    },
    onError: (error: Error) => {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    },
  });

  // A function to logout the user
  const userLogout = useCallback(() => {
    setIsLoggingOut(true);
    logout({});
  }, [logout]);

  const signInWithBase = useCallback(async () => {
    if (isInMiniApp) return;

    setIsSigningIn(true);
    setError(null);

    try {
      // Initialize the Base Account SDK
      const provider = createBaseAccountSDK({}).getProvider();
      console.log("Base provider initialized:", provider);

      // Step 1: Request account access
      const addresses = await provider.request({
        method: "eth_requestAccounts",
      });
      console.log("Connected addresses:", addresses);

      if (!addresses) {
        throw new Error("No accounts available");
      }

      if (!Array.isArray(addresses) || addresses.length === 0) {
        throw new Error("No accounts available");
      }

      const address: string = addresses[0];

      // Step 2: Switch to Base chain
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x2105" }], // Base mainnet
      });
      console.log("Switched to Base chain");

      // Step 3: Get nonce from backend
      const nonceResponse = await fetch(
        `/api/auth/base/nonce?address=${encodeURIComponent(address)}&chainId=8453`, // Base mainnet
      );

      if (!nonceResponse.ok) {
        throw new Error("Failed to get nonce from server");
      }

      const { nonce } = await nonceResponse.json();
      console.log("Generated nonce:", nonce);

      // Step 4: Create SIWE message
      const message = `${window.location.host} wants you to sign in with your Ethereum account:
${address}

Sign in with Base to authenticate your account.

URI: ${window.location.origin}
Version: 1
Chain ID: "8453"
Nonce: ${nonce}
Issued At: ${new Date().toISOString()}`;

      console.log("SIWE message:", message);

      // Step 5: Sign the message
      const signature = (await provider.request({
        method: "personal_sign",
        params: [message, address],
      })) as string;
      console.log("Signature:", signature);

      // Step 6: Verify signature with backend and sign in
      baseSignIn({
        address,
        message,
        signature,
        nonce,
      });
    } catch (err: any) {
      console.log("Base sign-in error:", err);
      setError(err.message || "Sign in with Base failed");
      setIsSigningIn(false);
    }
  }, [refetchUser]);

  // Auto set user logic
  useEffect(() => {
    // Wait for the user to be fetched
    if (!isFetchedAuthUser) {
      return;
    }

    // If we have a user from the initial fetch, set the user
    if (authUser) {
      setUser(authUser);
    }
  }, [isFetchedAuthUser]);

  const value: AdminAuthContextType = {
    user: {
      data: user,
      refetch: refetchUser,
    },
    signInWithBase,
    userLogout,
    isLoading: isFetchingUser || isSigningIn || isLoggingOut,
    error: error || userError,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};
