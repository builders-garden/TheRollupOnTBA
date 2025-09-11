import { useCallback } from "react";
import { useSocket } from "@/hooks/use-socket";
import { ClientToServerSocketEvents } from "@/lib/enums";
import {
  EndSentimentPollEvent,
  JoinStreamEvent,
  StartSentimentPollEvent,
  TipSentEvent,
  TokenTradedEvent,
  UpdateSentimentPollEvent,
  VoteCastedEvent,
} from "@/lib/types/socket/client-to-server.type";

export function useSocketUtils() {
  const { emit, disconnect } = useSocket();

  const adminStartBullmeter = useCallback(
    (data: StartSentimentPollEvent) => {
      emit(ClientToServerSocketEvents.START_SENTIMENT_POLL, data);
    },
    [emit],
  );

  const adminEndBullmeter = useCallback(
    (data: EndSentimentPollEvent) => {
      emit(ClientToServerSocketEvents.END_SENTIMENT_POLL, data);
    },
    [emit],
  );

  const adminUpdateBullmeter = useCallback(
    (data: UpdateSentimentPollEvent) => {
      emit(ClientToServerSocketEvents.UPDATE_SENTIMENT_POLL, data);
    },
    [emit],
  );

  const joinStream = useCallback(
    (data: JoinStreamEvent) => {
      emit(ClientToServerSocketEvents.JOIN_STREAM, data);
    },
    [emit],
  );

  const tipSent = (data: TipSentEvent) => {
    emit(ClientToServerSocketEvents.TIP_SENT, data);
  };

  const tokenTraded = (data: TokenTradedEvent) => {
    emit(ClientToServerSocketEvents.TOKEN_TRADED, data);
  };

  const voteCasted = (data: VoteCastedEvent) => {
    emit(ClientToServerSocketEvents.VOTE_CASTED, data);
  };

  return {
    joinStream,
    tipSent,
    tokenTraded,
    voteCasted,
    adminStartBullmeter,
    adminEndBullmeter,
    adminUpdateBullmeter,
    disconnect,
  };
}
