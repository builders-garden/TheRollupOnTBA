import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";
import { useAccount, useDisconnect, useSignMessage } from "wagmi";
// hooks
import { useMiniApp } from "@/contexts/mini-app-context";
import {
  useAuthCheck,
  useLogout,
  useWebAppSignIn,
} from "@/hooks/use-auth-hooks";
import { useBrandBySlug } from "@/hooks/use-brands";
import { useFeaturedTokens } from "@/hooks/use-featured-tokens";
import { useTipSettings } from "@/hooks/use-tip-settings";
import { Brand, FeaturedToken, TipSettings } from "@/lib/database/db.schema";
import { User } from "@/lib/types/user.type";

interface WebAppAuthContextType {
  user: {
    data: User | undefined;
    refetch: () => Promise<void>;
  };
  brand: {
    brandSlug: string | undefined;
    setBrandSlug: (brandSlug: string) => void;
    data: Brand | undefined;
    refetch: () => Promise<void>;
    tipSettings: {
      data: TipSettings | undefined;
      refetch: () => Promise<void>;
    };
    featuredTokens: {
      data: FeaturedToken[];
      refetch: () => Promise<void>;
    };
  };
  signInWithWebApp: () => void;
  executeLogout: () => void;
  isSigningIn: boolean;
  isLoggingOut: boolean;
  sideBarLoading: boolean;
  isLoading: boolean;
  error: Error | null;
}

const WebAppAuthContext = createContext<WebAppAuthContextType | undefined>(
  undefined,
);

export const useWebAppAuth = () => {
  const context = useContext(WebAppAuthContext);
  if (!context) {
    throw new Error("useWebAppAuth must be used within an WebAppAuthProvider");
  }
  return context;
};

export const WebAppAuthProvider = ({ children }: { children: ReactNode }) => {
  // Environment context
  const { isLoading: isEnvironmentLoading } = useMiniApp();

  // Local state
  const [brandSlug, setBrandSlug] = useState<string>();
  const [brand, setBrand] = useState<Brand>();
  const [tipSettings, setTipSettings] = useState<TipSettings>();
  const [featuredTokens, setFeaturedTokens] = useState<FeaturedToken[]>([]);
  const [user, setUser] = useState<User>();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { signMessage } = useSignMessage();
  const { disconnect } = useDisconnect();
  const { address: connectedAddress } = useAccount();

  // Single user query - this is the only place we fetch user data
  // Always try to fetch on load to check for existing valid token
  const {
    user: authUser,
    refetch: refetchUser,
    isLoading: isFetchingUser,
    isRefetching: isRefetchingUser,
  } = useAuthCheck(); // Always fetch to check for existing token

  // Fetching the brand when the user is connected
  const {
    data: brandData,
    isLoading: isFetchingBrand,
    error: brandError,
    refetch: refetchBrand,
  } = useBrandBySlug({ brandSlug, enabled: !!brandSlug });

  // Fetching the tip settings when the brand is connected
  const {
    data: tipSettingsData,
    isLoading: isFetchingTipSettings,
    error: tipSettingsError,
    refetch: refetchTipSettings,
  } = useTipSettings({
    brandId: brand?.id,
    enabled: !!brand?.id && !!user,
  });

  // Fetching the featured tokens when the brand is connected
  const {
    data: featuredTokensData,
    isLoading: isFetchingFeaturedTokens,
    error: featuredTokensError,
    refetch: refetchFeaturedTokens,
  } = useFeaturedTokens({
    brandId: brand?.id,
    enabled: !!brand?.id && !!user,
  });

  // Auto set user logic
  useEffect(() => {
    if (authUser) {
      setUser(authUser);
    }
  }, [authUser]);

  // Auto set brand logic
  useEffect(() => {
    if (brandData && brandData.data) {
      setBrand(brandData.data);
    }
  }, [brandData]);

  // Auto set tip settings logic
  useEffect(() => {
    if (tipSettingsData && tipSettingsData.data) {
      setTipSettings(tipSettingsData.data);
    }
  }, [tipSettingsData]);

  // Auto set featured tokens logic
  useEffect(() => {
    if (featuredTokensData && featuredTokensData.data) {
      setFeaturedTokens(featuredTokensData.data as FeaturedToken[]);
    }
  }, [featuredTokensData]);

  // Handles the refetching of the brand
  const executeRefetchBrand = useCallback(async () => {
    const newBrand = await refetchBrand();
    if (newBrand.isSuccess && newBrand.data?.data) {
      setBrand(newBrand.data.data);
    }
  }, [refetchBrand]);

  // Handles the refetching of the user
  const executeRefetchUser = useCallback(async () => {
    const newUser = await refetchUser();
    if (newUser.isSuccess && newUser.data?.user) {
      setUser(newUser.data.user);
    }
  }, [refetchUser]);

  // Handles the refetching of the tip settings
  const executeRefetchTipSettings = useCallback(async () => {
    const newTipSettings = await refetchTipSettings();
    if (newTipSettings.isSuccess && newTipSettings.data?.data) {
      setTipSettings(newTipSettings.data.data);
    }
  }, [refetchTipSettings]);

  // Handles the refetching of the featured tokens
  const executeRefetchFeaturedTokens = useCallback(async () => {
    const newFeaturedTokens = await refetchFeaturedTokens();
    if (newFeaturedTokens.isSuccess && newFeaturedTokens.data?.data) {
      setFeaturedTokens(newFeaturedTokens.data.data as FeaturedToken[]);
    }
  }, [refetchFeaturedTokens]);

  // Logout mutation
  const { mutate: logout } = useLogout({
    onSuccess: () => {
      setUser(undefined);
      disconnect(
        {},
        {
          onSuccess: () => {
            setIsLoggingOut(false);
          },
        },
      );
    },
    onError: (error: Error) => {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    },
  });

  // A function to logout
  const executeLogout = useCallback(() => {
    setIsLoggingOut(true);
    logout({ tokenType: "web_app_auth_token" });
  }, [logout]);

  // Web app sign-in mutation
  const { mutate: webAppSignIn } = useWebAppSignIn({
    onSuccess: (data) => {
      console.log("Web app sign-in success:", data);
      if (data.success && data.user) {
        setIsSigningIn(false);
        setError(null);
        setUser(data.user);
      }
    },
    onError: (error: Error) => {
      console.log("Web app sign-in error:", error);
      setError(error);
      setIsSigningIn(false);
    },
  });

  // Handles the sign-in with web app
  const executeSignInWithWebApp = useCallback(() => {
    if (!connectedAddress) return;
    setIsSigningIn(true);

    // The message to sign
    const message = "Sign in to the control the stream app";

    // Request a signature to the user
    signMessage(
      {
        message,
      },
      {
        onSuccess: (data) => {
          // If the signature was produced, sign in with the web app
          webAppSignIn(
            {
              signature: data,
              address: connectedAddress,
              message,
            },
            {
              onSuccess: async () => {
                await executeRefetchUser();
                toast.success("Successfully logged in");
                setIsSigningIn(false);
              },
              onError: () => {
                toast.error("Failed to log in");
                setIsSigningIn(false);
              },
            },
          );
        },
        onError: () => {
          toast.error("Signature rejected");
          setIsSigningIn(false);
        },
      },
    );
  }, [webAppSignIn, signMessage, connectedAddress]);

  const value: WebAppAuthContextType = {
    user: {
      data: user,
      refetch: executeRefetchUser,
    },
    brand: {
      data: brand,
      brandSlug,
      setBrandSlug,
      refetch: executeRefetchBrand,
      tipSettings: {
        data: tipSettings,
        refetch: executeRefetchTipSettings,
      },
      featuredTokens: {
        data: featuredTokens,
        refetch: executeRefetchFeaturedTokens,
      },
    },
    isLoggingOut,
    executeLogout,
    signInWithWebApp: executeSignInWithWebApp,
    isSigningIn,
    sideBarLoading:
      isFetchingUser ||
      isRefetchingUser ||
      isFetchingTipSettings ||
      isFetchingFeaturedTokens,
    isLoading: isEnvironmentLoading || isFetchingBrand,
    error: error || brandError || tipSettingsError || featuredTokensError,
  };

  return (
    <WebAppAuthContext.Provider value={value}>
      {children}
    </WebAppAuthContext.Provider>
  );
};
