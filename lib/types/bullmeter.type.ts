// Bullmeter contract types

export enum PollState {
  INACTIVE = 0,
  ACTIVE = 1,
  ENDED = 2,
  TERMINATED = 3,
}

export enum PollResult {
  NONE = 0,
  YES = 1,
  NO = 2,
  TIE = 3,
}

export interface PollData {
  pollId: string; // The unique poll identifier (bytes32)
  question: string; // The poll question/description
  creator: string; // Address of the poll creator
  guest: string; // Optional secondary recipient address
  votePrice: string; // Price per vote in USDC wei (uint256)
  startTime: string; // Timestamp when poll becomes active (uint256)
  deadline: string; // Timestamp when poll expires (uint256)
  maxVotePerUser: string; // Maximum votes per user (uint256, 0 = unlimited)
  guestSplitPercent: string; // Secondary recipient's share in basis points (uint256)
  totalYesVotes: string; // Total weight of YES votes (uint256)
  totalNoVotes: string; // Total weight of NO votes (uint256)
  totalUsdcCollected: string; // Total USDC collected from all votes (uint256)
  state: PollState; // Current state of the poll
  result: PollResult; // Current result of the poll
  fundsClaimed: boolean; // Whether collected funds have been claimed
}

// Raw data returned from contract call (what Viem decodes)
export interface ReadPollData {
  pollId: `0x${string}`; // The unique poll identifier (bytes32)
  question: string; // The poll question/description
  creator: `0x${string}`; // Address of the poll creator
  guest: `0x${string}`; // Optional secondary recipient address
  votePrice: bigint; // Price per vote in USDC wei (uint256)
  startTime: bigint; // Timestamp when poll becomes active (uint256)
  deadline: bigint; // Timestamp when poll expires (uint256)
  maxVotePerUser: bigint; // Maximum votes per user (uint256, 0 = unlimited)
  guestSplitPercent: bigint; // Secondary recipient's share in basis points (uint256)
  totalYesVotes: bigint; // Total weight of YES votes (uint256)
  totalNoVotes: bigint; // Total weight of NO votes (uint256)
  totalUsdcCollected: bigint; // Total USDC collected from all votes (uint256)
  state: PollState; // Current state of the poll
  result: PollResult; // Current result of the poll
  fundsClaimed: boolean; // Whether collected funds have been claimed
}

export interface GetAllPollsByCreatorResponse {
  success: boolean;
  result?: ReadPollData[];
  error?: string;
}
