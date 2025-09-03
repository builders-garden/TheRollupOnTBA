import { createContext, useContext, useEffect, useState } from "react";

interface NotificationData {
  id: string;
  username: string;
  profilePicture: string;
  text?: string;
}

interface NotificationQueueContextType {
  addToQueue: (notification: Omit<NotificationData, "id">) => void;
  removeFromQueue: (id: string) => void;
  activeNotification: NotificationData | null;
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

  const addToQueue = (notification: Omit<NotificationData, "id">) => {
    const newNotification = {
      ...notification,
      id: Math.random().toString(36).substring(7),
    };
    setQueue((prev) => [...prev, newNotification]);
  };

  const removeFromQueue = (id: string) => {
    console.log("removeFromQueue called with id:", id);
    console.log("Current queue:", queue);
    console.log("Current activeNotification:", activeNotification);

    setQueue((prev) => {
      const newQueue = prev.filter((n) => n.id !== id);
      console.log("New queue after removal:", newQueue);
      return newQueue;
    });

    if (activeNotification?.id === id) {
      console.log("Setting activeNotification to null");
      setActiveNotification(null);
    }
  };

  useEffect(() => {
    console.log("Queue processing effect running");
    console.log("Current queue:", queue);
    console.log("Current activeNotification:", activeNotification);

    if (!activeNotification && queue.length > 0) {
      console.log("Processing next notification from queue");
      const nextNotification = queue[0];
      setActiveNotification(nextNotification);
      setQueue((prev) => {
        const newQueue = prev.slice(1);
        console.log("New queue after processing:", newQueue);
        return newQueue;
      });
    }
  }, [queue, activeNotification]);

  return (
    <NotificationQueueContext.Provider
      value={{
        addToQueue,
        removeFromQueue,
        activeNotification,
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
