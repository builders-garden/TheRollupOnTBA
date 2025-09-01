"use client";

import {
  MiniAppContext,
  SafeAreaInsets,
} from "@farcaster/miniapp-core/dist/context";
import {
  MiniAppHostCapability,
  sdk as miniappSdk,
} from "@farcaster/miniapp-sdk";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface FarcasterContextType {
  isMiniAppReady: boolean;
  isInMiniApp: boolean;
  isLoading: boolean;
  context: MiniAppContext | null;
  capabilities: MiniAppHostCapability[] | null;
  safeAreaInsets: SafeAreaInsets;
  error: string | null;
}

export const FarcasterContext = createContext<FarcasterContextType | undefined>(
  undefined,
);

export function useFarcaster() {
  const context = useContext(FarcasterContext);
  if (context === undefined) {
    throw new Error("useFarcaster must be used within a FarcasterProvider");
  }
  return context;
}

export function FarcasterProvider({
  addMiniAppOnLoad,
  children,
}: {
  addMiniAppOnLoad?: boolean;
  children: ReactNode;
}) {
  const [isInMiniApp, setIsInMiniApp] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [context, setContext] = useState<MiniAppContext | null>(null);
  const [isMiniAppReady, setIsMiniAppReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [capabilities, setCapabilities] = useState<
    MiniAppHostCapability[] | null
  >(null);

  const [safeAreaInsets, setSafeAreaInsets] = useState<SafeAreaInsets>({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  });

  const loadMiniApp = useCallback(async () => {
    try {
      // Set loading to true
      setIsLoading(true);

      // first thing first, call ready on the miniapp sdk
      await miniappSdk.actions.ready();

      // check if the app is in the miniapp
      const tmpIsInMiniApp = await miniappSdk.isInMiniApp();
      setIsInMiniApp(tmpIsInMiniApp);

      // then get the context
      const tmpContext = await miniappSdk.context;

      // if the context is not null, set the context
      if (tmpContext) {
        setContext(tmpContext as MiniAppContext);
        // then get the safe area insets
        if (tmpContext.client.safeAreaInsets) {
          setSafeAreaInsets(tmpContext.client.safeAreaInsets);
        }
        setIsMiniAppReady(true);

        if (addMiniAppOnLoad) {
          await miniappSdk.actions.addMiniApp();
        }

        try {
          const tmpCapabilities = await miniappSdk.getCapabilities();
          setCapabilities(tmpCapabilities);
        } catch (err) {
          console.error("Failed to get capabilities", err);
          setError(
            err instanceof Error ? err.message : "Failed to get capabilities",
          );
        }
      } else {
        setError("Failed to load Farcaster context");
        setIsInMiniApp(false);
      }
    } catch (err) {
      console.error("SDK initialization error:", err);
      setError(err instanceof Error ? err.message : "Failed to initialize SDK");
    } finally {
      setIsLoading(false);
    }
  }, [addMiniAppOnLoad]);

  const handleAddMiniApp = useCallback(async () => {
    try {
      const result = await miniappSdk.actions.addMiniApp();
      if (result) {
        return result;
      }
      return null;
    } catch (error) {
      console.error("[error] adding miniapp", error);
      return null;
    }
  }, []);

  useEffect(() => {
    // on load, add the miniapp
    if (
      isMiniAppReady &&
      context &&
      !context?.client?.added &&
      addMiniAppOnLoad
    ) {
      handleAddMiniApp();
    }
  }, [
    isMiniAppReady,
    context?.client?.added,
    handleAddMiniApp,
    addMiniAppOnLoad,
    context,
  ]);

  useEffect(() => {
    if (!isMiniAppReady) {
      loadMiniApp().then(() => {
        console.log("MiniApp loaded");
      });
    }
  }, [isMiniAppReady, loadMiniApp]);

  const value = useMemo(
    () => ({
      isInMiniApp,
      isMiniAppReady,
      isLoading,
      context,
      capabilities,
      safeAreaInsets,
      error,
    }),
    [
      isInMiniApp,
      isMiniAppReady,
      isLoading,
      context,
      capabilities,
      safeAreaInsets,
      error,
    ],
  );

  return (
    <FarcasterContext.Provider value={value}>
      {children}
    </FarcasterContext.Provider>
  );
}
