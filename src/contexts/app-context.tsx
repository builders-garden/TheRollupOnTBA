"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { createContext, useContext, useState, type ReactNode } from "react";
import {
  OverlayConfig,
  OverlayContent,
  PageContent,
  PageContentHistory,
  User,
} from "@/types";

export interface AppContextType {
  // pages
  pageContent: PageContent;
  setPageContent: (content: PageContent) => void;
  extraPageContentData: unknown;
  pageContentHistory: PageContentHistory[];
  handlePageChange: (content: PageContent, extra?: unknown) => void;
  handlePageBack: () => void;
  // modals
  overlayContent: OverlayContent;
  setOverlayContent: (content: OverlayContent) => void;
  activeUserId: string | null;
  handleModalChange: (content: OverlayContent) => void;
  // profile page
  activeProfile: User | null;
  setActiveProfile: (user: User) => void;
  setActiveUserId: (userId: string) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within a AppProvider");
  }
  return context;
}

interface AppProviderProps {
  children: ReactNode;
  initialPageContent?: PageContent;
  initialOverlayContent?: OverlayConfig;
}

export function AppProvider({
  children,
  initialPageContent = PageContent.HOME,
  initialOverlayContent = {
    type: OverlayContent.NONE,
  },
}: AppProviderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // pages
  const [pageContent, setPageContent] =
    useState<PageContent>(initialPageContent);
  const [extraPageContentData, setExtraPageContentData] =
    useState<unknown>(null);
  const [pageContentHistory, setPageContentHistory] = useState<
    PageContentHistory[]
  >([]);
  // modals
  const [overlayContent, setOverlayContent] = useState<OverlayContent>(
    initialOverlayContent.type,
  );
  const [activeUserId, setActiveUserId] = useState<string | null>(
    initialOverlayContent.type === OverlayContent.VIEW_PROFILE
      ? initialOverlayContent.userId
      : null,
  );

  // profile page state
  const [activeProfile, setActiveProfile] = useState<User | null>(null);

  // Scroll to the navbar when the page content changes
  const scrollToNavbar = () => {
    const navbarElement = document.getElementById("navbar");
    if (navbarElement) navbarElement.scrollIntoView({ behavior: "smooth" });
  };

  // Handle page change
  const handlePageChange = (content: PageContent, extra?: unknown) => {
    // Get the current query params
    const currentParams: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      currentParams[key] = value;
    });

    if (extra) setExtraPageContentData(extra);

    // Add the new page content to the history and remove the oldest if full (7 items)
    setPageContentHistory([
      ...(pageContentHistory.length === 7
        ? pageContentHistory.slice(1)
        : pageContentHistory),
      { pageContent: pageContent, queryParams: currentParams },
    ]);
    setPageContent(content);

    scrollToNavbar();
  };

  // Go back to the previous page content
  const handlePageBack = () => {
    if (pageContentHistory.length > 1) {
      // Take the last visited page
      const lastPage = pageContentHistory[pageContentHistory.length - 1];

      // Remove current page
      const newHistory = [...pageContentHistory];
      newHistory.pop(); // Remove current page

      // Generate the new query params
      const searchParams = new URLSearchParams();
      Object.entries(lastPage.queryParams).forEach(([key, value]) => {
        searchParams.set(key, value);
      });

      // Update history and state
      setPageContentHistory(newHistory);
      setPageContent(lastPage.pageContent);
      router.push(`?${searchParams.toString()}`);

      scrollToNavbar();
    }
  };

  // Handle modal change
  const handleModalChange = (content: OverlayContent) => {
    setOverlayContent(content);
  };

  return (
    <AppContext.Provider
      value={{
        // pages
        pageContent,
        setPageContent,
        extraPageContentData,
        pageContentHistory,
        handlePageChange,
        handlePageBack,
        // modals
        overlayContent,
        setOverlayContent,
        activeUserId,
        handleModalChange,
        // profile page
        activeProfile,
        setActiveProfile,
        setActiveUserId,
      }}>
      {children}
    </AppContext.Provider>
  );
}
