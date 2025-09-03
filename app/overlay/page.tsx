"use client";

import { useEffect, useState } from "react";
import { StreamNotification } from "@/components/shared/stream-notification";
import { useSocket } from "@/hooks/use-socket";
import { useSocketUtils } from "@/hooks/use-socket-utils";
import { ServerToClientSocketEvents } from "@/lib/enums";
import { StreamJoinedEvent } from "@/lib/types/socket";

export default function OverlayPage() {
  const { subscribe } = useSocket();
  const { joinStream } = useSocketUtils();
  const [notifications, setNotifications] = useState<
    Array<{
      id: string;
      username: string;
      profilePicture: string;
      text?: string;
    }>
  >([]);

  const showPopupCallback = (data: {
    username: string;
    profilePicture: string;
    text?: string;
  }) => {
    console.log("showPopupCallback", data);
    const id = Math.random().toString(36).substring(7);
    setNotifications((prev) => [...prev, { ...data, id }]);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  useEffect(() => {
    joinStream({
      username: "Overlay",
      profilePicture: "https://via.placeholder.com/150",
    });
    subscribe(
      ServerToClientSocketEvents.STREAM_JOINED,
      (data: StreamJoinedEvent) => {
        showPopupCallback({
          username: data.username,
          profilePicture: data.profilePicture,
          text: "joined the stream",
        });
      },
    );
  }, [subscribe]);

  return (
    <div>
      {notifications.map((notification) => (
        <StreamNotification
          key={notification.id}
          username={notification.username}
          profilePicture={notification.profilePicture}
          text={notification.text}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
}
