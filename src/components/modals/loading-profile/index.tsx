"use client";

import { Loader2Icon, XIcon } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { useFarcaster } from "@/contexts/farcaster-context";

interface LoadingProfileProps {
  onClose: () => void;
}

export function LoadingProfileModal({ onClose }: LoadingProfileProps) {
  const { safeAreaInsets } = useFarcaster();

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 size-full max-h-screen no-scrollbar">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="bg-background text-foreground w-full h-[calc(100%-env(safe-area-inset-top)-env(safe-area-inset-bottom))]">
        <div
          className="w-full h-full px-2 py-3 flex flex-col mx-auto"
          style={{
            marginTop: safeAreaInsets.top,
            marginBottom: safeAreaInsets.bottom,
            marginLeft: safeAreaInsets.left,
            marginRight: safeAreaInsets.right,
          }}>
          {/* Header */}
          <div className="flex justify-between items-center mb-2 px-1">
            <h2 className="text-lg xs:text-xl font-bold">Loading Profile</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="flex items-center justify-center text-2xl">
              <XIcon className="size-4" />
            </Button>
          </div>

          {/* Content area */}
          <div className="flex items-center justify-center gap-2 size-full">
            <div className="flex h-fit w-full items-center justify-center gap-4">
              <Loader2Icon className="w-4 h-4 animate-spin" />
              <span className="text-sm text-muted-foreground">
                Searching...
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
