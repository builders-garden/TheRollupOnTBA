import { createBaseAccountSDK } from "@base-org/account";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Address } from "viem";
// hooks
import { useMiniApp } from "@/contexts/mini-app-context";
import { useAuthCheck, useBaseSignIn, useLogout } from "@/hooks/use-auth-hooks";
import { useFeaturedTokens } from "@/hooks/use-featured-tokens";
import { useTipSettings } from "@/hooks/use-tip-settings";
import { Brand, FeaturedToken, TipSettings } from "@/lib/database/db.schema";
import { getBasenameName, getEnsName } from "@/lib/ens/client";
import { AuthTokenType } from "@/lib/enums";

interface AdminAuthContextType {
  brand: {
    data: Brand | undefined;
    refetch: () => Promise<void>;
    brandNotFound: boolean;
    isFetched: boolean;
  };
  tipSettings: {
    data: TipSettings | undefined;
    refetch: () => Promise<void>;
    tipSettingsNotFound: boolean;
    isFetched: boolean;
  };
  admin: {
    address?: string;
    baseName?: string;
    ensName?: string;
  };
  featuredTokens: {
    data: FeaturedToken[];
    refetch: () => Promise<void>;
    featuredTokensNotFound: boolean;
    isFetched: boolean;
  };
  signInWithBase: () => void;
  executeLogout: () => void;
  isLoading: boolean;
  isRefetching: boolean;
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
  const [tipSettings, setTipSettings] = useState<TipSettings>();
  const [admin, setAdmin] = useState<{
    address?: string;
    baseName?: string;
    ensName?: string;
  }>();
  const [featuredTokens, setFeaturedTokens] = useState<FeaturedToken[]>([]);
  const [brandNotFound, setBrandNotFound] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isFetchingAdmin, setIsFetchingAdmin] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Single brand query - this is the only place we fetch brand data
  // Always try to fetch on load to check for existing valid token
  const {
    brand: authBrand,
    refetch: refetchBrand,
    isLoading: isFetchingBrand,
    isFetched: isFetchedAuthBrand,
    isRefetching: isRefetchingBrand,
    error: brandError,
  } = useAuthCheck(AuthTokenType.ADMIN_AUTH_TOKEN); // Always fetch to check for existing token

  // Single tip settings query
  const {
    data: tipSettingsData,
    refetch: refetchTipSettings,
    isLoading: isFetchingTipSettings,
    isFetched: isFetchedAuthTipSettings,
    isRefetching: isRefetchingTipSettings,
    error: tipSettingsError,
  } = useTipSettings({
    brandId: brand?.id,
    enabled: !!brand?.id,
  });

  // Single featured tokens query
  const {
    data: featuredTokensData,
    refetch: refetchFeaturedTokens,
    isLoading: isFetchingFeaturedTokens,
    isFetched: isFetchedAuthFeaturedTokens,
    isRefetching: isRefetchingFeaturedTokens,
    error: featuredTokensError,
  } = useFeaturedTokens({
    brandId: brand?.id,
    enabled: !!brand?.id,
  });

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
    logout({ tokenType: AuthTokenType.ADMIN_AUTH_TOKEN });
  }, [logout]);

  // A function to refetch the brand
  const executeRefetchBrand = useCallback(async () => {
    const newBrand = await refetchBrand();
    if (newBrand.isSuccess && newBrand.data?.brand) {
      setBrand(newBrand.data.brand);
      setBrandNotFound(false);
    }
  }, [refetchBrand]);

  // A function to refetch the tip settings
  const executeRefetchTipSettings = useCallback(async () => {
    const newTipSettings = await refetchTipSettings();
    if (newTipSettings.isSuccess && newTipSettings.data?.data) {
      setTipSettings(newTipSettings.data.data);
    }
  }, [refetchTipSettings]);

  // A function to refetch the featured tokens
  const executeRefetchFeaturedTokens = useCallback(async () => {
    const newFeaturedTokens = await refetchFeaturedTokens();
    if (newFeaturedTokens.isSuccess && newFeaturedTokens.data?.data) {
      setFeaturedTokens(newFeaturedTokens.data.data as FeaturedToken[]);
    }
  }, [refetchFeaturedTokens]);

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

      // Get the admin's address, base name, and ENS name
      const address: string = addresses[0];
      const baseName = await getBasenameName(address as Address);
      const ensName = await getEnsName(address as Address);

      // Set the admin
      setAdmin({
        address,
        baseName: baseName?.normalize(),
        ensName: ensName?.normalize(),
      });

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

  // Auto set tip settings logic
  useEffect(() => {
    // Wait for the brand to be fetched
    if (!isFetchedAuthTipSettings) {
      return;
    }

    // If we have a tip settings from the initial fetch, set the tip settings
    if (tipSettingsData) {
      setTipSettings(tipSettingsData.data);
    }
  }, [isFetchedAuthTipSettings]);

  // Auto fetch admin logic, only works if brand is fetched
  useEffect(() => {
    const getAdmin = async () => {
      if (!brand || !!admin?.address) {
        return;
      }

      setIsFetchingAdmin(true);

      const provider = createBaseAccountSDK({}).getProvider();
      const addresses = await provider.request({
        method: "eth_requestAccounts",
      });

      if (!addresses || !Array.isArray(addresses) || addresses.length === 0) {
        console.log("No accounts available");
        return;
      }

      // Get the admin's address, base name, and ENS name
      const address: string = addresses[0];
      const baseName = await getBasenameName(address as Address);
      const ensName = await getEnsName(address as Address);

      setAdmin({
        ...admin,
        address,
        baseName: baseName?.normalize(),
        ensName: ensName?.normalize(),
      });

      setIsFetchingAdmin(false);
    };

    getAdmin();
  }, [brand]);

  // Auto fetch featured tokens logic
  useEffect(() => {
    if (!isFetchedAuthFeaturedTokens) {
      return;
    }
    setFeaturedTokens(featuredTokensData?.data as FeaturedToken[]);
  }, [isFetchedAuthFeaturedTokens]);

  const value: AdminAuthContextType = {
    brand: {
      data: brand,
      refetch: executeRefetchBrand,
      isFetched: isFetchedAuthBrand,
      brandNotFound,
    },
    tipSettings: {
      data: tipSettings,
      refetch: executeRefetchTipSettings,
      tipSettingsNotFound: tipSettingsData?.success === false,
      isFetched: isFetchedAuthTipSettings,
    },
    admin: {
      address: admin?.address,
      baseName: admin?.baseName,
      ensName: admin?.ensName,
    },
    featuredTokens: {
      data: featuredTokens,
      refetch: executeRefetchFeaturedTokens,
      featuredTokensNotFound: featuredTokensData?.success === false,
      isFetched: isFetchedAuthFeaturedTokens,
    },
    signInWithBase,
    executeLogout,
    isLoading:
      isFetchingBrand ||
      isFetchingTipSettings ||
      isFetchingFeaturedTokens ||
      isSigningIn ||
      isLoggingOut ||
      isFetchingAdmin,
    isRefetching:
      isRefetchingBrand ||
      isRefetchingTipSettings ||
      isRefetchingFeaturedTokens,
    error: error || brandError || tipSettingsError || featuredTokensError,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};
