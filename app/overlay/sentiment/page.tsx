"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ToastPollNotification } from "@/components/custom-ui/toast/toast-poll-notification";
import { useActiveBullMeter } from "@/hooks/use-bull-meters";
import { useSocket } from "@/hooks/use-socket";
import { useSocketUtils } from "@/hooks/use-socket-utils";
import { PopupPositions, ServerToClientSocketEvents } from "@/lib/enums";
import {
  EndPollNotificationEvent,
  PollNotificationEvent,
  UpdatePollNotificationEvent,
} from "@/lib/types/socket";
import { env } from "@/lib/zod";

export default function OverlayPage() {
  const { subscribe, unsubscribe } = useSocket();
  const { data: activeBullMeter, isLoading: isLoadingActiveBullMeter } =
    useActiveBullMeter(env.NEXT_PUBLIC_ROLLUP_BRAND_ID);
  const { joinStream } = useSocketUtils();

  // Unified poll state and visibility flag
  type NormalizedPoll = {
    id: string;
    prompt: string;
    pollId?: string;
    deadlineSeconds: number | null;
    votes?: number;
    voters?: number;
    results?: { bullPercent: number; bearPercent: number };
  };
  const [poll, setPoll] = useState<NormalizedPoll | null>(null);
  const [showPoll, setShowPoll] = useState<boolean>(false);

  const toastId = useMemo(() => "sentiment-poll", []);

  const openToastFromPoll = useCallback(
    (p: NormalizedPoll, position: PopupPositions) => {
      toast.custom(
        () => (
          <ToastPollNotification
            data={{
              id: p.id,
              pollQuestion: p.prompt,
              endTime: new Date((p.deadlineSeconds || 0) * 1000),
              votes: p.votes || 0,
              voters: p.voters || 0,
              qrCodeUrl: p.pollId || "",
              position,
              results: p.results || { bullPercent: 0, bearPercent: 0 },
            }}
          />
        ),
        {
          id: toastId,
          duration: Infinity,
          position: PopupPositions.TOP_LEFT,
        },
      );
    },
    [toastId],
  );

  useEffect(() => {
    if (isLoadingActiveBullMeter) return;
    if (activeBullMeter?.data) {
      const totalVotes =
        (activeBullMeter.data.totalNoVotes || 0) +
        (activeBullMeter.data.totalYesVotes || 0);

      const normalized: NormalizedPoll = {
        id: activeBullMeter.data.id,
        prompt: activeBullMeter.data.prompt,
        pollId: activeBullMeter.data.pollId,
        deadlineSeconds: activeBullMeter.data.deadline || null,
        votes: totalVotes,
        voters: undefined,
        results: {
          bullPercent: activeBullMeter.data.totalYesVotes || 0,
          bearPercent: activeBullMeter.data.totalNoVotes || 0,
        },
      };
      setPoll(normalized);
      setShowPoll(true);
      openToastFromPoll(normalized, PopupPositions.TOP_LEFT);
    } else {
      setShowPoll(false);
      setPoll(null);
      toast.dismiss(toastId);
    }
  }, [activeBullMeter, isLoadingActiveBullMeter, openToastFromPoll, toastId]);

  useEffect(() => {
    // Join the stream
    joinStream({
      username: "Overlay",
      profilePicture: "https://via.placeholder.com/150",
    });

    // Socket event handlers
    const handleStart = (data: PollNotificationEvent) => {
      const normalized: NormalizedPoll = {
        id: data.id,
        prompt: data.pollQuestion,
        pollId: data.qrCodeUrl,
        deadlineSeconds: Math.floor(new Date(data.endTime).getTime() / 1000),
        votes: data.votes,
        voters: data.voters,
        results: data.results,
      };
      setPoll(normalized);
      setShowPoll(true);
      openToastFromPoll(normalized, data.position);
    };

    const handleUpdate = (data: UpdatePollNotificationEvent) => {
      setPoll((prev) => {
        if (!prev) return prev;
        const updated: NormalizedPoll = {
          ...prev,
          id: data.id,
          votes: data.votes,
          voters: data.voters,
          results: data.results,
        };
        openToastFromPoll(updated, data.position);
        return updated;
      });
      setShowPoll(true);
    };

    const handleEnd = (data: EndPollNotificationEvent) => {
      setShowPoll(false);
      setPoll((prev) =>
        prev?.id === data.id
          ? {
              ...prev,
              votes: data.votes,
              voters: data.voters,
              results: data.results,
            }
          : prev,
      );
      toast.dismiss(toastId);
    };

    // Set up subscriptions
    subscribe(ServerToClientSocketEvents.START_SENTIMENT_POLL, handleStart);
    subscribe(ServerToClientSocketEvents.UPDATE_SENTIMENT_POLL, handleUpdate);
    subscribe(ServerToClientSocketEvents.END_SENTIMENT_POLL, handleEnd);

    // Cleanup subscriptions
    return () => {
      unsubscribe(ServerToClientSocketEvents.START_SENTIMENT_POLL, handleStart);
      unsubscribe(
        ServerToClientSocketEvents.UPDATE_SENTIMENT_POLL,
        handleUpdate,
      );
      unsubscribe(ServerToClientSocketEvents.END_SENTIMENT_POLL, handleEnd);
    };
  }, [subscribe, unsubscribe, joinStream, openToastFromPoll, toastId]);

  return (
    <div className="flex h-screen w-[100vw]">
      <div className="flex h-full w-full"> </div>
    </div>
  );
}
