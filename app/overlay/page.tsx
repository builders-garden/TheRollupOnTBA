"use client";

import { useCallback, useEffect } from "react";
import { StreamNotification } from "@/components/shared/stream-notification";
import { useNotificationQueue } from "@/contexts/notification-queue-context";
import { useSocket } from "@/hooks/use-socket";
import { useSocketUtils } from "@/hooks/use-socket-utils";
import { ServerToClientSocketEvents } from "@/lib/enums";
import {
  StreamJoinedEvent,
  TipReceivedEvent,
  TokenTradedEvent,
} from "@/lib/types/socket";

export default function OverlayPage() {
  const { subscribe, unsubscribe } = useSocket();
  const { joinStream } = useSocketUtils();
  const { addToQueue } = useNotificationQueue();

  const showPopupCallback = useCallback(
    (data: { username: string; profilePicture: string; text?: string }) => {
      console.log("showPopupCallback", data);
      addToQueue(data);
    },
    [addToQueue],
  );

  useEffect(() => {
    // Join the stream
    joinStream({
      username: "Overlay",
      profilePicture: "https://via.placeholder.com/150",
    });

    // Create event handlers
    const handleStreamJoined = (data: StreamJoinedEvent) => {
      showPopupCallback({
        username: data.username,
        profilePicture: data.profilePicture,
        text: "joined the stream",
      });
    };

    const handleTipReceived = (data: TipReceivedEvent) => {
      showPopupCallback({
        username: data.username,
        profilePicture: data.profilePicture,
        text: `sent a ${data.tipAmount} tip`,
      });
    };

    const handleTokenTraded = (data: TokenTradedEvent) => {
      showPopupCallback({
        username: data.username,
        profilePicture: data.profilePicture,
        text: `traded ${data.tokenInAmount} $${data.tokenInName} for ${data.tokenOutAmount} $${data.tokenOutName}`,
      });
    };

    // Set up subscriptions
    subscribe(ServerToClientSocketEvents.STREAM_JOINED, handleStreamJoined);
    subscribe(ServerToClientSocketEvents.TIP_RECEIVED, handleTipReceived);
    subscribe(ServerToClientSocketEvents.TOKEN_TRADED, handleTokenTraded);

    // Cleanup subscriptions
    return () => {
      unsubscribe(ServerToClientSocketEvents.STREAM_JOINED, handleStreamJoined);
      unsubscribe(ServerToClientSocketEvents.TIP_RECEIVED, handleTipReceived);
      unsubscribe(ServerToClientSocketEvents.TOKEN_TRADED, handleTokenTraded);
    };
  }, [subscribe, unsubscribe, joinStream, showPopupCallback]);

  return (
    <div>
      <StreamNotification />
    </div>
  );
}
