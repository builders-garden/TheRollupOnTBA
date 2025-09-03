import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

interface StreamNotificationProps {
  username: string;
  profilePicture: string;
  text?: string;
  onClose?: () => void;
}

export function StreamNotification({
  username,
  profilePicture,
  text,
  onClose,
}: StreamNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed top-4 right-4 bg-white rounded-lg shadow-lg p-4 flex items-center gap-3 min-w-[300px] border border-gray-200">
          <img
            src={profilePicture}
            alt={username}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{username}</h3>
            {text && <p className="text-sm text-gray-600">{text}</p>}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
