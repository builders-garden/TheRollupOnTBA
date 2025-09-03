import { useSocket } from "@/hooks/use-socket";
import { ClientToServerSocketEvents } from "@/lib/enums";
import {
  JoinStreamEvent,
  TipSentEvent,
  TokenTradedEvent,
  VoteCastedEvent,
} from "@/lib/types/socket/client-to-server.type";

export function useSocketUtils() {
  const { emit, disconnect } = useSocket();

  const joinStream = ({ username, profilePicture }: JoinStreamEvent) => {
    emit(ClientToServerSocketEvents.JOIN_STREAM, {
      username,
      profilePicture,
    });
  };

  const tipSent = ({ username, profilePicture, tipAmount }: TipSentEvent) => {
    emit(ClientToServerSocketEvents.TIP_SENT, {
      username,
      profilePicture,
      tipAmount,
    });
  };

  const tokenTraded = ({ username, profilePicture, tokenInAmount, tokenInName, tokenInDecimals, tokenInImageUrl, tokenOutAmount, tokenOutDecimals, tokenOutName, tokenOutImageUrl }: TokenTradedEvent) => {
    emit(ClientToServerSocketEvents.TOKEN_TRADED, {
      username,
      profilePicture,
      tokenInAmount,
      tokenInName,
      tokenInDecimals,
      tokenInImageUrl,
      tokenOutAmount,
      tokenOutDecimals,
      tokenOutName,
      tokenOutImageUrl,
    });
  };

  const voteCasted = ({ username, profilePicture, voteAmount, isBull, promptId }: VoteCastedEvent) => {
    emit(ClientToServerSocketEvents.VOTE_CASTED, {
      username,
      profilePicture,
      voteAmount,
      isBull,
      promptId,
    });
  };

  return {
    joinStream,
    tipSent,
    tokenTraded,
    voteCasted,
    disconnect,
  };
}
