"use client";

import { useEffect } from "react";
import { useSocket } from "@/hooks/use-socket";
import { useSocketUtils } from "@/hooks/use-socket-utils";
import { ServerToClientSocketEvents } from "@/lib/enums";
import {
  EndPollNotificationEvent,
  PollNotificationEvent,
  UpdatePollNotificationEvent,
} from "@/lib/types/socket/server-to-client.type";

type JoinInfo = {
  brandId: string;
  username: string;
  profilePicture: string;
};

type UseSentimentPollSocketOptions = {
  joinInfo: JoinInfo;
  onStart: (data: PollNotificationEvent) => void;
  onUpdate: (data: UpdatePollNotificationEvent) => void;
  onEnd: (data: EndPollNotificationEvent) => void;
};

export function useSentimentPollSocket(options: UseSentimentPollSocketOptions) {
  const { subscribe, unsubscribe } = useSocket();
  const { joinStream } = useSocketUtils();

  useEffect(() => {
    if (!options) return;

    const { joinInfo, onStart, onUpdate, onEnd } = options;

    // Join stream once on mount (or when joinInfo changes) if enabled
    joinStream({
      brandId: joinInfo.brandId,
      username: joinInfo.username,
      profilePicture: joinInfo.profilePicture,
    });

    // Wire up socket event subscriptions
    subscribe(ServerToClientSocketEvents.START_SENTIMENT_POLL, onStart);
    subscribe(ServerToClientSocketEvents.UPDATE_SENTIMENT_POLL, onUpdate);
    subscribe(ServerToClientSocketEvents.END_SENTIMENT_POLL, onEnd);

    return () => {
      unsubscribe(ServerToClientSocketEvents.START_SENTIMENT_POLL, onStart);
      unsubscribe(ServerToClientSocketEvents.UPDATE_SENTIMENT_POLL, onUpdate);
      unsubscribe(ServerToClientSocketEvents.END_SENTIMENT_POLL, onEnd);
    };
    // We intentionally depend on the concrete callback references to re-subscribe when they change
  }, [options, subscribe, unsubscribe, joinStream]);
}
