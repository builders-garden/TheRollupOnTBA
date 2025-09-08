import { useEffect } from "react";
import { Notification } from "@/components/custom-ui/notification";
import { useNotificationQueue } from "@/contexts/notification-queue-context";
import { PopupPositions } from "@/lib/enums";

interface NotificationContainerProps {
  position?: PopupPositions;
  className?: string;
}

export function NotificationContainer({
  position = PopupPositions.TOP_LEFT,
  className = "",
}: NotificationContainerProps) {
  const { activeNotification, isTransitioning, removeFromQueue } =
    useNotificationQueue();

  const isRightSide = position?.includes("right");
  const slideOffset = isRightSide ? 100 : -100;

  useEffect(() => {
    if (activeNotification) {
      const timer = setTimeout(() => {
        removeFromQueue(activeNotification.id);
      }, 2000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [activeNotification, removeFromQueue]);

  return (
    <div
      className={`relative flex ${
        position?.includes("right") ? "justify-end" : "justify-start"
      } ${className}`}>
      <Notification
        data={activeNotification}
        isTransitioning={isTransitioning}
        slideOffset={slideOffset}
      />
    </div>
  );
}
