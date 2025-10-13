import { Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useMiniApp } from "@/contexts/mini-app-context";

export default function LoadingPage() {
  const { isInMiniApp } = useMiniApp();

  // If we are in the miniapp, show the miniapp loading page (smaller spinner)
  if (isInMiniApp) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="flex flex-col min-h-screen h-full items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin" />
      </motion.div>
    );
  } else {
    return (
      <motion.div
        key="loading"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="flex justify-center items-center w-full min-h-screen">
        <Loader2 className="size-14 animate-spin" />
      </motion.div>
    );
  }
}
