"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import { SideNavbar } from "@/components/shared/admin/side-navbar";
import { AdminPageContent } from "@/lib/enums";
import { capitalizeFirstLetter } from "@/lib/utils";

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
        <div className="relative flex justify-center items-center w-full border-b-[1px] border-border">
          <Image
            src="/images/admin_page_banner.svg"
            alt="Admin page banner"
            width={106}
            height={73}
            priority
            className="h-auto w-full"
          />
          <AnimatePresence mode="wait">
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              key={selectedPageContent}
              className="font-bold text-[36px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              {capitalizeFirstLetter(selectedPageContent)}
            </motion.h1>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
