import { useCallback } from "react";
import { useSocket } from "@/hooks/use-socket";
import { ClientToServerSocketEvents } from "@/lib/enums";
import {
  EndKalshiMarketEvent,
  EndSentimentPollEvent,
  JoinStreamEvent,
  StartKalshiMarketEvent,
  StartSentimentPollEvent,
  TipSentEvent,
  TokenTradedEvent,
  UpdateKalshiMarketEvent,
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

  const adminUpdateSentimentPoll = useCallback(
    (data: UpdateSentimentPollEvent) => {
      emit(ClientToServerSocketEvents.UPDATE_SENTIMENT_POLL, data);
    },
    [emit],
  );

  const adminStartKalshiMarket = useCallback(
    (data: StartKalshiMarketEvent) => {
      emit(ClientToServerSocketEvents.START_KALSHI_MARKET, data);
    },
    [emit],
  );

  const adminUpdateKalshiMarket = useCallback(
    (data: UpdateKalshiMarketEvent) => {
      emit(ClientToServerSocketEvents.UPDATE_KALSHI_MARKET, data);
    },
    [emit],
  );

  const adminEndKalshiMarket = useCallback(
    (data: EndKalshiMarketEvent) => {
      emit(ClientToServerSocketEvents.END_KALSHI_MARKET, data);
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
    adminUpdateSentimentPoll,
    adminStartKalshiMarket,
    adminUpdateKalshiMarket,
    adminEndKalshiMarket,
    disconnect,
  };
}
