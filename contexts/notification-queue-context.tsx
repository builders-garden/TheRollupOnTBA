import { createContext, useContext, useEffect, useState } from "react";

export interface NotificationData {
  id: string;
  username: string;
  profilePicture: string;
  text?: string;
}

interface NotificationQueueContextType {
  addToQueue: (notification: Omit<NotificationData, "id">) => void;
  removeFromQueue: (id: string) => void;
  activeNotification: NotificationData | null;
  isTransitioning: boolean;
}

const NotificationQueueContext =
  createContext<NotificationQueueContextType | null>(null);

export function NotificationQueueProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queue, setQueue] = useState<NotificationData[]>([]);
  const [activeNotification, setActiveNotification] =
    useState<NotificationData | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const addToQueue = (notification: Omit<NotificationData, "id">) => {
    const newNotification = {
      ...notification,
      id: Math.random().toString(36).substring(7),
    };
    setQueue((prev) => [...prev, newNotification]);
  };

  const removeFromQueue = (id: string) => {
    if (activeNotification?.id === id) {
      if (queue.length > 0) {
        // If there's a next notification, trigger transition
        setIsTransitioning(true);
        setActiveNotification(null);

        // Reset transition state after animation completes
        setTimeout(() => {
          setIsTransitioning(false);
        }, 300); // This should match the exit animation duration
      } else {
        // If no next notification, just remove current
        setActiveNotification(null);
      }
    }

    setQueue((prev) => prev.filter((n) => n.id !== id));
  };

  useEffect(() => {
    if (!activeNotification && queue.length > 0) {
      const nextNotification = queue[0];
      setActiveNotification(nextNotification);
      setQueue((prev) => prev.slice(1));
    }
  }, [queue, activeNotification]);

  return (
    <NotificationQueueContext.Provider
      value={{
        addToQueue,
        removeFromQueue,
        activeNotification,
        isTransitioning,
      }}>
      {children}
    </NotificationQueueContext.Provider>
  );
}

export function useNotificationQueue() {
  const context = useContext(NotificationQueueContext);
  if (!context) {
    throw new Error(
      "useNotificationQueue must be used within a NotificationQueueProvider",
    );
  }
  return context;
}
