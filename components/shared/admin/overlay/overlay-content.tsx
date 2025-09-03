import { motion } from "motion/react";

export const OverlayContent = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}>
      <p>OverlayContent</p>
    </motion.div>
  );
};
