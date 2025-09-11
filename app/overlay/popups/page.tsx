"use client";

import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import { ToastNotification } from "@/components/custom-ui/toast/toast-notification";
import { useSocket } from "@/hooks/use-socket";
import { useSocketUtils } from "@/hooks/use-socket-utils";
import { PopupPositions, ServerToClientSocketEvents } from "@/lib/enums";
import {
  TipReceivedEvent,
  TokenTradedEvent,
  VoteReceivedEvent,
} from "@/lib/types/socket";

export default function OverlayPage() {
  const { subscribe, unsubscribe } = useSocket();
  const { joinStream } = useSocketUtils();

  const showPopupCallback = useCallback(
    (data: {
      username: string;
      profilePicture: string;
      text?: string;
      position: PopupPositions;
    }) => {
      toast.custom(() => <ToastNotification data={data} slideOffset={100} />, {
        duration: 2000,
        position: PopupPositions.TOP_CENTER,
      });
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
    const handleTipReceived = (data: TipReceivedEvent) => {
      showPopupCallback({
        username: data.username,
        profilePicture: data.profilePicture,
        text: `sent a $${data.tipAmount} tip`,
        position: data.position,
      });
    };

    const handleTokenTraded = (data: TokenTradedEvent) => {
      showPopupCallback({
        username: data.username,
        profilePicture: data.profilePicture,
        text: `traded ${data.tokenInAmount} $${data.tokenInName} for ${data.tokenOutAmount} $${data.tokenOutName}`,
        position: data.position,
      });
    };

    const handleVoteReceived = (data: VoteReceivedEvent) => {
      showPopupCallback({
        username: data.username,
        profilePicture: data.profilePicture,
        text: `voted ${data.voteAmount} ${data.isBull ? "bull" : "bear"}`,
        position: data.position,
      });
    };

    // Set up subscriptions
    subscribe(ServerToClientSocketEvents.TIP_RECEIVED, handleTipReceived);
    subscribe(ServerToClientSocketEvents.TOKEN_TRADED, handleTokenTraded);
    subscribe(ServerToClientSocketEvents.VOTE_RECEIVED, handleVoteReceived);

    // Cleanup subscriptions
    return () => {
      unsubscribe(ServerToClientSocketEvents.TIP_RECEIVED, handleTipReceived);
      unsubscribe(ServerToClientSocketEvents.TOKEN_TRADED, handleTokenTraded);
      unsubscribe(ServerToClientSocketEvents.VOTE_RECEIVED, handleVoteReceived);
    };
  }, [subscribe, unsubscribe, joinStream, showPopupCallback]);

  return (
    <div className="flex h-screen w-[100vw]">
      <div className="flex h-full w-full"> </div>
    </div>
  );
}
