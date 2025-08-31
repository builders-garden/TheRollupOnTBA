import { motion } from "motion/react";
import { useEffect, useState } from "react";

export const CountdownTimer = ({
  maintenanceEnd,
}: {
  maintenanceEnd: Date;
}) => {
  const [, setTime] = useState(0); // Force re-render
  const now = new Date();
  const diff = maintenanceEnd.getTime() - now.getTime();
  let text = "";
  if (diff <= 0) text = "Finishing up...";
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  text = `${minutes}:${seconds.toString().padStart(2, "0")} remaining`;

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(Date.now()); // Update every second
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      animate={{
        y: [0, -5, 0],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
      }}
      className="text-green-400 text-xl font-bold text-center">
      {text}
    </motion.div>
  );
};
