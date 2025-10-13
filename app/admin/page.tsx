"use client";

import { SignInWithBaseButton } from "@base-org/account-ui/react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import { AdminBanner } from "@/components/custom-ui/admin/admin-banner";
import { AnalyticsContent } from "@/components/custom-ui/admin/analytics/analytics-content";
import { BrandContent } from "@/components/custom-ui/admin/brand/brand-content";
import { NotificationsContent } from "@/components/custom-ui/admin/notifications/notifications-content";
import { OverlayContent } from "@/components/custom-ui/admin/overlay/overlay-content";
import { PluginsContent } from "@/components/custom-ui/admin/plugins/plugins-content";
import { SideNavbar } from "@/components/custom-ui/admin/side-navbar";
import { SignUpContent } from "@/components/custom-ui/admin/sign-up-content";
import LoadingPage from "@/components/pages/loading-page";
import { useAdminAuth } from "@/contexts/auth/admin-auth-context";
import { AdminPageContent } from "@/lib/enums";

export default function AdminPage() {
  const [selectedPageContent, setSelectedPageContent] =
    useState<AdminPageContent>(AdminPageContent.BRAND);
  const { brand, isLoading, isRefetching, signInWithBase } = useAdminAuth();

  // Whether the page content is overlay, brand, analytics or notifications
  const isContentOverlay = selectedPageContent === AdminPageContent.OVERLAY;
  const isContentBrand = selectedPageContent === AdminPageContent.BRAND;
  const isContentAnalytics = selectedPageContent === AdminPageContent.ANALYTICS;
  const isContentNotifications =
    selectedPageContent === AdminPageContent.NOTIFICATIONS;

  return (
    <AnimatePresence mode="wait">
      {isLoading && !isRefetching ? (
        <LoadingPage key="loading" />
      ) : !!brand.data ? (
        <motion.div
          key="admin-page"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="flex justify-between items-stretch w-full min-h-screen">
          <div className="w-fit py-5 px-6">
            <SideNavbar
              selectedPageContent={selectedPageContent}
              setSelectedPageContent={setSelectedPageContent}
            />
          </div>
          <div className="flex flex-col justify-start items-center w-full">
            {/* Banner */}
            <AdminBanner selectedPageContent={selectedPageContent} />

            {/* Content */}
            <AnimatePresence mode="wait">
              {isContentOverlay ? (
                <OverlayContent key="overlay" />
              ) : isContentBrand ? (
                <BrandContent key="brand" />
              ) : isContentAnalytics ? (
                <AnalyticsContent key="analytics" />
              ) : isContentNotifications ? (
                <NotificationsContent key="notifications" />
              ) : (
                <PluginsContent key="plugins" brandId={brand.data.id} />
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      ) : brand.brandNotFound ? (
        <SignUpContent key="sign-up" />
      ) : (
        <motion.div
          key="sign-in-with-base"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="flex justify-center items-center w-full min-h-screen">
          <div className="flex flex-col items-center justify-center w-full px-10 gap-7">
            <div className="flex flex-col items-center justify-center w-full gap-4">
              <Image
                src="/images/rollup_logo_black.png"
                alt="The Rollup logo"
                width={560}
                height={100}
                priority
              />
              <p className="text-4xl font-bold text-center">
                Mini-app Administration Page
                <br />
                <span className="text-lg opacity-50 -mt-2">
                  Connect your Base account to access the admin functions
                </span>
              </p>
            </div>
            <div className="w-fit mt-3">
              <SignInWithBaseButton
                align="center"
                variant="solid"
                colorScheme="light"
                onClick={signInWithBase}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
