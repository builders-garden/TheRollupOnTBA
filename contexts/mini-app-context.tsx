"use client";

import { AddMiniAppResult } from "@farcaster/miniapp-core/dist/actions/AddMiniApp";
import {
  MiniAppContext as MiniAppCoreContext,
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

interface MiniAppContextType {
  isMiniAppReady: boolean;
  isInMiniApp: boolean;
  isLoading: boolean;
  context: MiniAppCoreContext | undefined;
  capabilities: MiniAppHostCapability[] | undefined;
  safeAreaInsets: SafeAreaInsets;
  addMiniApp: () => Promise<AddMiniAppResult | null | undefined>;
  error: string | undefined;
}

export const MiniAppContext = createContext<MiniAppContextType | undefined>(
  undefined,
);

export function useMiniApp() {
  const context = useContext(MiniAppContext);
  if (context === undefined) {
    throw new Error("useMiniApp must be used within a MiniAppProvider");
  }
  return context;
}

export function MiniAppProvider({
  addMiniAppOnLoad,
  children,
}: {
  addMiniAppOnLoad?: boolean;
  children: ReactNode;
}) {
  const [isInMiniApp, setIsInMiniApp] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [context, setContext] = useState<MiniAppCoreContext>();
  const [isMiniAppReady, setIsMiniAppReady] = useState(false);
  const [error, setError] = useState<string>();
  const [capabilities, setCapabilities] = useState<MiniAppHostCapability[]>();

  // Declaring a basic set of safe area insets
  const [safeAreaInsets, setSafeAreaInsets] = useState<SafeAreaInsets>({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  });

  // A simple function to add a mini app to the client
  const handleAddMiniApp = useCallback(
    async (passedContext: MiniAppCoreContext | undefined = undefined) => {
      const usedContext = passedContext || context;
      // If the mini app was already added or the context is not set, return
      if (!usedContext || usedContext.client.added) return;
      try {
        const result = await miniappSdk.actions.addMiniApp();
        if (result) {
          return result;
        }
        return null;
      } catch (error) {
        console.log("[error] adding miniapp", error);
        return null;
      }
    },
    [context],
  );

  // The function to load the mini app
  const loadMiniApp = useCallback(async () => {
    try {
      // Set loading to true
      setIsLoading(true);

      // first things first, call ready on the miniapp sdk
      await miniappSdk.actions.ready();

      // check if the app is in the miniapp
      const tmpIsInMiniApp = await miniappSdk.isInMiniApp();
      setIsInMiniApp(tmpIsInMiniApp);

      // then get the context if we are in the miniapp
      const tmpContext = tmpIsInMiniApp ? await miniappSdk.context : null;

      // if the context is not null, set the context
      if (tmpContext) {
        setContext(tmpContext);
        // then get the safe area insets
        if (tmpContext.client.safeAreaInsets) {
          setSafeAreaInsets(tmpContext.client.safeAreaInsets);
        }
        setIsMiniAppReady(true);

        // If is is flagged, try to add the mini app on load
        if (addMiniAppOnLoad) {
          await handleAddMiniApp(tmpContext);
        }

        // Try to get the capabilities of the mini app client
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
  }, [addMiniAppOnLoad, handleAddMiniApp]);

  // Until the mini app is not ready, try to load it
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
      addMiniApp: handleAddMiniApp,
    }),
    [
      isInMiniApp,
      isMiniAppReady,
      isLoading,
      context,
      capabilities,
      safeAreaInsets,
      error,
      handleAddMiniApp,
    ],
  );

  return (
    <MiniAppContext.Provider value={value}>{children}</MiniAppContext.Provider>
  );
}
