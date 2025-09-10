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
import { Brand } from "@/lib/database/db.schema";

interface AdminAuthContextType {
  brand: {
    data: Brand | undefined;
    refetch: (options?: RefetchOptions) => Promise<
      QueryObserverResult<
        {
          brand?: Brand;
          status: "ok" | "nok";
          error?: string;
        },
        Error
      >
    >;
    brandNotFound: boolean;
    isFetched: boolean;
  };
  signInWithBase: () => void;
  executeLogout: () => void;
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
  const [brand, setBrand] = useState<Brand>();
  const [brandNotFound, setBrandNotFound] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Single brand query - this is the only place we fetch brand data
  // Always try to fetch on load to check for existing valid token
  const {
    brand: authBrand,
    refetch: refetchBrand,
    isLoading: isFetchingBrand,
    isFetched: isFetchedAuthBrand,
    error: userError,
  } = useAuthCheck(); // Always fetch to check for existing token

  // Farcaster sign-in mutation
  const { mutate: baseSignIn } = useBaseSignIn({
    onSuccess: (data) => {
      console.log("Base sign-in success:", data);
      if (!data.brand) {
        setBrandNotFound(true);
      } else if (data.success && data.brand) {
        setBrandNotFound(false);
        setError(null);
        setBrand(data.brand);
      }
      setIsSigningIn(false);
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
      setBrand(undefined);
      setIsLoggingOut(false);
    },
    onError: (error: Error) => {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    },
  });

  // A function to logout
  const executeLogout = useCallback(() => {
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

      // Step 1: Request account access
      const addresses = await provider.request({
        method: "eth_requestAccounts",
      });

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

      // Step 3: Get nonce from backend
      const nonceResponse = await fetch(
        `/api/auth/base/nonce?address=${encodeURIComponent(address)}&chainId=8453`, // Base mainnet
      );

      if (!nonceResponse.ok) {
        throw new Error("Failed to get nonce from server");
      }

      const { nonce } = await nonceResponse.json();

      // Step 4: Create SIWE message
      const message = `${window.location.host} wants you to sign in with your Ethereum account:
${address}

Sign in with Base to authenticate your account.

URI: ${window.location.origin}
Version: 1
Chain ID: "8453"
Nonce: ${nonce}
Issued At: ${new Date().toISOString()}`;

      // Step 5: Sign the message
      const signature = (await provider.request({
        method: "personal_sign",
        params: [message, address],
      })) as string;

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
  }, [refetchBrand]);

  // Auto set brand logic
  useEffect(() => {
    // Wait for the brand to be fetched
    if (!isFetchedAuthBrand) {
      return;
    }

    // If we have a brand from the initial fetch, set the brand
    if (authBrand) {
      setBrand(authBrand);
    }
  }, [isFetchedAuthBrand]);

  const value: AdminAuthContextType = {
    brand: {
      data: brand,
      refetch: refetchBrand,
      isFetched: isFetchedAuthBrand,
      brandNotFound,
    },
    signInWithBase,
    executeLogout,
    isLoading: isFetchingBrand || isSigningIn || isLoggingOut,
    error: error || userError,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};
