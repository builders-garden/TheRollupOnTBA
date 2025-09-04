"use client";

import { AnimatePresence } from "motion/react";
import { useState } from "react";
import { AdminBanner } from "@/components/shared/admin/admin-banner";
import { BrandContent } from "@/components/shared/admin/brand/brand-content";
import { OverlayContent } from "@/components/shared/admin/overlay/overlay-content";
import { PluginsContent } from "@/components/shared/admin/plugins/plugins-content";
import { SideNavbar } from "@/components/shared/admin/side-navbar";
import { AdminPageContent } from "@/lib/enums";

export default function AdminPage() {
  const [selectedPageContent, setSelectedPageContent] =
    useState<AdminPageContent>(AdminPageContent.BRAND);

  // Whether the page content is overlay or brand
  const isContentOverlay = selectedPageContent === AdminPageContent.OVERLAY;
  const isContentBrand = selectedPageContent === AdminPageContent.BRAND;

  return (
    <div className="flex justify-between items-center w-full h-screen">
      <div className="h-full w-fit py-5 px-6">
        <SideNavbar
          selectedPageContent={selectedPageContent}
          setSelectedPageContent={setSelectedPageContent}
        />
      </div>
      <div className="flex flex-col justify-start items-center h-full w-full">
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
    </div>
  );
}
