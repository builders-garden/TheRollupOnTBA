"use client";

import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import { ToastPollNotification } from "@/components/custom-ui/toast/toast-poll-notification";
import { useSocket } from "@/hooks/use-socket";
import { useSocketUtils } from "@/hooks/use-socket-utils";
import { PopupPositions, ServerToClientSocketEvents } from "@/lib/enums";
import { PollNotificationEvent } from "@/lib/types/socket";

export default function OverlayPage() {
  const { subscribe, unsubscribe } = useSocket();
  const { joinStream } = useSocketUtils();

  const showPollNotificationCallback = useCallback(
    (data: {
      id: string;
      pollQuestion: string;
      endTime: Date;
      votes: number;
      voters: number;
      qrCodeUrl: string;
      position: PopupPositions;
      results: { bullPercent: number; bearPercent: number };
    }) => {
      toast.custom(() => <ToastPollNotification data={data} />, {
        duration: Infinity,
        position: data.position,
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
    const handleOpenSentimentPoll = (data: PollNotificationEvent) => {
      showPollNotificationCallback({
        id: data.id,
        pollQuestion: data.pollQuestion,
        endTime: data.endTime,
        votes: data.votes,
        voters: data.voters,
        qrCodeUrl: data.qrCodeUrl,
        position: data.position,
        results: data.results || { bullPercent: 0, bearPercent: 0 },
      });
    };

    const handleEndPollNotification = () => {
      toast.dismiss();
    };

    // Set up subscriptions
    subscribe(
      ServerToClientSocketEvents.START_SENTIMENT_POLL,
      handleOpenSentimentPoll,
    );
    subscribe(
      ServerToClientSocketEvents.END_SENTIMENT_POLL,
      handleEndPollNotification,
    );

    // Cleanup subscriptions
    return () => {
      unsubscribe(
        ServerToClientSocketEvents.START_SENTIMENT_POLL,
        handleOpenSentimentPoll,
      );
      unsubscribe(
        ServerToClientSocketEvents.END_SENTIMENT_POLL,
        handleEndPollNotification,
      );
    };
  }, [subscribe, unsubscribe, joinStream, showPollNotificationCallback]);

  return (
    <div className="flex h-screen w-[100vw]">
      <div className="flex h-full w-full"> </div>
    </div>
  );
}
