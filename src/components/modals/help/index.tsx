"use client";

import { XIcon } from "lucide-react";
import { motion } from "motion/react";
import React from "react";
import { Button } from "@/components/ui/button";
import { useFarcaster } from "@/contexts/farcaster-context";

interface HelpModalProps {
  onClose: () => void;
}

export function HelpModal({ onClose }: HelpModalProps) {
  const { safeAreaInsets } = useFarcaster();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="bg-[#7E4E31] w-full h-[calc(100%-env(safe-area-inset-top)-env(safe-area-inset-bottom))]">
        <div
          className="w-full h-full p-3 xs:p-4 flex flex-col max-w-4xl mx-auto"
          style={{
            marginTop: safeAreaInsets.top,
            marginBottom: safeAreaInsets.bottom,
            marginLeft: safeAreaInsets.left,
            marginRight: safeAreaInsets.right,
          }}>
          {/* Header */}
          <div className="flex justify-end items-center mb-2 xs:mb-4">
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="text-white/90 flex items-center justify-center text-2xl">
              <XIcon className="size-7 sm:size-8" />
            </Button>
          </div>

          {/* Content area */}
          <div className="flex-1 flex flex-col items-center justify-center gap-3 xs:gap-4 min-h-0">
            {/* If you need help */}
            <div className="flex flex-col items-center text-center text-white/90 gap-3 xs:gap-4">
              <div className="flex flex-col gap-0.5 xs:gap-1 items-center">
                <p className="text-sm xs:text-base font-medium text-white/80">
                  If you need help, please contact support.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex-none p-3 xs:p-4">
            <div className="flex justify-center gap-2 xs:gap-3">
              <Button
                onClick={onClose}
                className="px-4 xs:px-6 py-2 xs:py-2.5 bg-black/10 hover:bg-black/30 rounded-lg text-white/90 transition-colors font-medium text-xs xs:text-sm">
                Cancel
              </Button>

              <Button
                disabled={false}
                onClick={onClose}
                className="px-4 xs:px-6 py-2 xs:py-2.5 bg-green-600/80 hover:bg-green-600 disabled:bg-green-600/20 disabled:text-white/50 disabled:cursor-not-allowed rounded-lg text-white transition-colors font-medium text-xs xs:text-sm">
                Accept
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
