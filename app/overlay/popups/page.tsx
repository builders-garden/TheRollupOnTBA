"use client";

import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import { ToastNotification } from "@/components/custom-ui/toast/toast-notification";
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

  const showPopupCallback = useCallback(
    (data: { username: string; profilePicture: string; text?: string }) => {
      const slideOffset = 100; // overlay defaults to top-right in Toaster
      toast.custom(
        () => <ToastNotification data={data} slideOffset={slideOffset} />,
        { duration: 2000 },
      );
    },
    [],
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

  return null;
}
