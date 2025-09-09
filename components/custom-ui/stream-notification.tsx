import { NotificationContainer } from "@/components/custom-ui/notification-container";
import { PopupPositions } from "@/lib/enums";

export function StreamNotification() {
  return <NotificationContainer position={PopupPositions.TOP_LEFT} />;
}
