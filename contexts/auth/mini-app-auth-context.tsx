import { sdk as miniappSdk } from "@farcaster/miniapp-sdk";
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
import { useAuthCheck, useFarcasterSignIn } from "@/hooks/use-auth-hooks";
import { User } from "@/lib/types/user.type";

interface MiniAppAuthContextType {
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
  const [user, setUser] = useState<User>();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<Error | null>(null);

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
  const { mutate: farcasterSignIn } = useFarcasterSignIn({
    onSuccess: (data) => {
      console.log("Farcaster sign-in success:", data);
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
      refetch: refetchUser,
    },
    isLoading:
      isEnvironmentLoading ||
      (isInMiniApp && !isMiniAppReady) ||
      isFetchingUser ||
      isSigningIn,
    error: error || userError,
  };

  return (
    <MiniAppAuthContext.Provider value={value}>
      {children}
    </MiniAppAuthContext.Provider>
  );
};
