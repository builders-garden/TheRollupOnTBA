import { Loader2 } from "lucide-react";
import { motion } from "motion/react";

export default function LoadingPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="flex flex-col min-h-screen h-full items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin" />
    </motion.div>
  );
}
