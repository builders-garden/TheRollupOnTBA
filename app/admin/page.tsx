"use client";

import { AnimatePresence } from "motion/react";
import { useState } from "react";
import { AdminBanner } from "@/components/shared/admin/admin-banner";
import { OverlayContent } from "@/components/shared/admin/overlay/overlay-content";
import { PluginsContent } from "@/components/shared/admin/plugins/plugins-content";
import { SideNavbar } from "@/components/shared/admin/side-navbar";
import { AdminPageContent } from "@/lib/enums";

export default function AdminPage() {
  const [selectedPageContent, setSelectedPageContent] =
    useState<AdminPageContent>(AdminPageContent.PLUGINS);

  // Whether the page content is plugins or overlay
  const isContentPlugins = selectedPageContent === AdminPageContent.PLUGINS;
  const isContentOverlay = selectedPageContent === AdminPageContent.OVERLAY;

  return (
    <div className="flex justify-between items-center w-full h-screen">
      <div className="h-full w-fit p-5">
        <SideNavbar
          isContentOverlay={isContentOverlay}
          isContentPlugins={isContentPlugins}
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
          ) : (
            <PluginsContent key="plugins" />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
