import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAccount } from "wagmi";
// hooks
import { useMiniApp } from "@/contexts/mini-app-context";
import { useAuthCheck, useFakeFarcasterSignIn } from "@/hooks/use-auth-hooks";
import { useBrandById } from "@/hooks/use-brands";
import { useFeaturedTokens } from "@/hooks/use-featured-tokens";
import { useTipSettings } from "@/hooks/use-tip-settings";
import { Brand, FeaturedToken, TipSettings } from "@/lib/database/db.schema";
import { User } from "@/lib/types/user.type";
import { env } from "@/lib/zod";

interface MiniAppAuthContextType {
  user: {
    data: User | undefined;
    refetch: () => Promise<void>;
  };
  brand: {
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
  isLoading: boolean;
  error: Error | null;
}

const MiniAppAuthContext = createContext<MiniAppAuthContextType | undefined>(
  undefined,
);

export const useMiniAppAuth = () => {
  const context = useContext(MiniAppAuthContext);
  if (!context) {
    throw new Error(
      "useMiniAppAuth must be used within an MiniAppAuthProvider",
    );
  }
  return context;
};

export const MiniAppAuthProvider = ({ children }: { children: ReactNode }) => {
  // Environment context
  const {
    isInMiniApp,
    isLoading: isEnvironmentLoading,
    context: miniAppContext,
    isMiniAppReady,
  } = useMiniApp();

  // Local state
  const [brand, setBrand] = useState<Brand>();
  const [tipSettings, setTipSettings] = useState<TipSettings>();
  const [featuredTokens, setFeaturedTokens] = useState<FeaturedToken[]>([]);
  const [user, setUser] = useState<User>();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { address: connectedAddress } = useAccount();

  // Single user query - this is the only place we fetch user data
  // Always try to fetch on load to check for existing valid token
  const {
    user: authUser,
    refetch: refetchUser,
    isLoading: isFetchingUser,
    isFetched: isFetchedAuthUser,
  } = useAuthCheck(); // Always fetch to check for existing token

  // Fetching the brand when the user is connected
  // TODO: Remove the hardcoded brand id
  const {
    data: brandData,
    isLoading: isFetchingBrand,
    error: brandError,
    refetch: refetchBrand,
  } = useBrandById(
    env.NEXT_PUBLIC_ROLLUP_BRAND_ID,
    !!env.NEXT_PUBLIC_ROLLUP_BRAND_ID && !!user,
  );

  // Fetching the tip settings when the brand is connected
  const {
    data: tipSettingsData,
    isLoading: isFetchingTipSettings,
    error: tipSettingsError,
    refetch: refetchTipSettings,
  } = useTipSettings({
    brandId: env.NEXT_PUBLIC_ROLLUP_BRAND_ID,
    enabled: !!env.NEXT_PUBLIC_ROLLUP_BRAND_ID && !!user,
  });

  // Fetching the featured tokens when the brand is connected
  const {
    data: featuredTokensData,
    isLoading: isFetchingFeaturedTokens,
    error: featuredTokensError,
    refetch: refetchFeaturedTokens,
  } = useFeaturedTokens({
    brandId: env.NEXT_PUBLIC_ROLLUP_BRAND_ID,
    enabled: !!env.NEXT_PUBLIC_ROLLUP_BRAND_ID && !!user,
  });

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

  // Farcaster sign-in mutation
  const { mutate: fakeFarcasterSignIn } = useFakeFarcasterSignIn({
    onSuccess: (data) => {
      console.log("Farcaster sign-in success:", data);
      if (data.success && data.user) {
        setIsSigningIn(false);
        setError(null);
        setUser(data.user);
      }
    },
    onError: (error: Error) => {
      console.log("Farcaster sign-in error:", error);
      setError(error);
      setIsSigningIn(false);
    },
  });

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

      // The signin is not required but this will create the user if they don't exist
      fakeFarcasterSignIn({
        fid: miniAppContext.user.fid,
        referrerFid,
        connectedAddress,
      });
    } catch (err) {
      console.error("Farcaster sign-in error:", err);
      setError(
        err instanceof Error ? err : new Error("Farcaster sign-in failed"),
      );
      setIsSigningIn(false);
    }
  }, [miniAppContext, fakeFarcasterSignIn]);

  // Auto sign-in logic
  useEffect(() => {
    // Wait for the miniapp to be ready and the user to be fetched
    if (
      !isMiniAppReady ||
      !isFetchedAuthUser ||
      !isInMiniApp ||
      !miniAppContext
    ) {
      return;
    }

    // If we have a user from the initial fetch, set the user and return
    // because we don't need to sign in
    if (authUser) {
      setUser(authUser);
      return;
    }

    // Sign in with Farcaster if not authenticated
    signInWithFarcaster();
  }, [
    isMiniAppReady,
    isFetchedAuthUser,
    isInMiniApp,
    miniAppContext,
    authUser,
    signInWithFarcaster,
  ]);

  const value: MiniAppAuthContextType = {
    user: {
      data: user,
      refetch: executeRefetchUser,
    },
    brand: {
      data: brand,
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
    isLoading:
      isEnvironmentLoading ||
      (isInMiniApp && !isMiniAppReady) ||
      isFetchingUser ||
      isSigningIn ||
      isFetchingBrand ||
      isFetchingTipSettings ||
      isFetchingFeaturedTokens,
    error: error || brandError || tipSettingsError || featuredTokensError,
  };

  return (
    <MiniAppAuthContext.Provider value={value}>
      {children}
    </MiniAppAuthContext.Provider>
  );
};
