"use client";

import { SignInWithBaseButton } from "@base-org/account-ui/react";
import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import { AdminBanner } from "@/components/custom-ui/admin/admin-banner";
import { BrandContent } from "@/components/custom-ui/admin/brand/brand-content";
import { OverlayContent } from "@/components/custom-ui/admin/overlay/overlay-content";
import { PluginsContent } from "@/components/custom-ui/admin/plugins/plugins-content";
import { SideNavbar } from "@/components/custom-ui/admin/side-navbar";
import { useAdminAuth } from "@/contexts/auth/admin-auth-context";
import { AdminPageContent } from "@/lib/enums";

export default function AdminPage() {
  const [selectedPageContent, setSelectedPageContent] =
    useState<AdminPageContent>(AdminPageContent.BRAND);
  const { brand, isLoading, isRefetching, signInWithBase } = useAdminAuth();

  // Whether the page content is overlay or brand
  const isContentOverlay = selectedPageContent === AdminPageContent.OVERLAY;
  const isContentBrand = selectedPageContent === AdminPageContent.BRAND;

  return (
    <AnimatePresence mode="wait">
      {isLoading && !isRefetching ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="flex justify-center items-center w-full min-h-screen">
          <Loader2 className="size-14 animate-spin" />
        </motion.div>
      ) : !!brand.data ? (
        <motion.div
          key="admin-page"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
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
              ) : (
                <PluginsContent key="plugins" />
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="sign-in-with-base"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
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
              <AnimatePresence mode="wait">
                {brand.brandNotFound ? (
                  <motion.p
                    key="brand-not-found"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="text-4xl font-bold text-center">
                    We could not find your brand
                    <br />
                    <span className="text-lg opacity-50 -mt-2">
                      Please try again with a different account
                    </span>
                  </motion.p>
                ) : (
                  <motion.p
                    key="normal-login"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="text-4xl font-bold text-center">
                    Mini-app Administration Page
                    <br />
                    <span className="text-lg opacity-50 -mt-2">
                      Connect your Base account to access the admin functions
                    </span>
                  </motion.p>
                )}
              </AnimatePresence>
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
