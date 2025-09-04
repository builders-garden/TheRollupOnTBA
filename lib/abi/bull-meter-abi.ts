export const bullMeterAbi = [
    {
      "type": "constructor",
      "inputs": [
        {
          "name": "_usdc",
          "type": "address",
          "internalType": "address"
        }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "BASIS_POINTS",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "MAX_DURATION",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "MAX_VOTE_PRICE",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "MIN_DURATION",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "calculatePollId",
      "inputs": [
        {
          "name": "creator",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "nonce",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "stateMutability": "pure"
    },
    {
      "type": "function",
      "name": "claimFunds",
      "inputs": [
        {
          "name": "_pollId",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "_terminateIfActive",
          "type": "bool",
          "internalType": "bool"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "createPoll",
      "inputs": [
        {
          "name": "_question",
          "type": "string",
          "internalType": "string"
        },
        {
          "name": "_votePrice",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "_startTime",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "_duration",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "_maxVotePerUser",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "_guest",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "_guestSplitPercent",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [
        {
          "name": "pollId",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "extendDeadline",
      "inputs": [
        {
          "name": "_pollId",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "_newDuration",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "getPollState",
      "inputs": [
        {
          "name": "_pollId",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "outputs": [
        {
          "name": "question",
          "type": "string",
          "internalType": "string"
        },
        {
          "name": "creator",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "guest",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "votePrice",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "startTime",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "deadline",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "maxVotePerUser",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "guestSplitPercent",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "totalYesVotes",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "totalNoVotes",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "totalUsdcCollected",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "state",
          "type": "uint8",
          "internalType": "enum BullMeter.PollState"
        },
        {
          "name": "result",
          "type": "uint8",
          "internalType": "enum BullMeter.PollResult"
        },
        {
          "name": "fundsClaimed",
          "type": "bool",
          "internalType": "bool"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getPollSummary",
      "inputs": [
        {
          "name": "_pollId",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "outputs": [
        {
          "name": "question",
          "type": "string",
          "internalType": "string"
        },
        {
          "name": "host",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "guest",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "totalYes",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "totalNo",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "projectedHostAmount",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "projectedGuestAmount",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "secondsRemaining",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getUserVotes",
      "inputs": [
        {
          "name": "_pollId",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "_user",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [
        {
          "name": "yesVotes",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "noVotes",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "totalVotes",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "polls",
      "inputs": [
        {
          "name": "",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "outputs": [
        {
          "name": "question",
          "type": "string",
          "internalType": "string"
        },
        {
          "name": "creator",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "guest",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "votePrice",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "startTime",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "deadline",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "maxVotePerUser",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "guestSplitPercent",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "totalYesVotes",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "totalNoVotes",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "totalUsdcCollected",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "state",
          "type": "uint8",
          "internalType": "enum BullMeter.PollState"
        },
        {
          "name": "fundsClaimed",
          "type": "bool",
          "internalType": "bool"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "terminatePoll",
      "inputs": [
        {
          "name": "_pollId",
          "type": "bytes32",
          "internalType": "bytes32"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "usdc",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "address",
          "internalType": "contract IERC20"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "userNonces",
      "inputs": [
        {
          "name": "",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "userVotes",
      "inputs": [
        {
          "name": "",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [
        {
          "name": "yesVotes",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "noVotes",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "vote",
      "inputs": [
        {
          "name": "_pollId",
          "type": "bytes32",
          "internalType": "bytes32"
        },
        {
          "name": "_isYes",
          "type": "bool",
          "internalType": "bool"
        },
        {
          "name": "_voteCount",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "event",
      "name": "DeadlineExtended",
      "inputs": [
        {
          "name": "pollId",
          "type": "bytes32",
          "indexed": true,
          "internalType": "bytes32"
        },
        {
          "name": "creator",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "newDeadline",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "FundsClaimed",
      "inputs": [
        {
          "name": "pollId",
          "type": "bytes32",
          "indexed": true,
          "internalType": "bytes32"
        },
        {
          "name": "creator",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "creatorAmount",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        },
        {
          "name": "guestAmount",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        },
        {
          "name": "wasTerminated",
          "type": "bool",
          "indexed": false,
          "internalType": "bool"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "PollActivated",
      "inputs": [
        {
          "name": "pollId",
          "type": "bytes32",
          "indexed": true,
          "internalType": "bytes32"
        },
        {
          "name": "startTime",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "PollCreated",
      "inputs": [
        {
          "name": "pollId",
          "type": "bytes32",
          "indexed": true,
          "internalType": "bytes32"
        },
        {
          "name": "creator",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "nonce",
          "type": "uint256",
          "indexed": true,
          "internalType": "uint256"
        },
        {
          "name": "question",
          "type": "string",
          "indexed": false,
          "internalType": "string"
        },
        {
          "name": "votePrice",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        },
        {
          "name": "startTime",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        },
        {
          "name": "deadline",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        },
        {
          "name": "maxVotePerUser",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        },
        {
          "name": "guest",
          "type": "address",
          "indexed": false,
          "internalType": "address"
        },
        {
          "name": "guestSplitPercent",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "PollTerminated",
      "inputs": [
        {
          "name": "pollId",
          "type": "bytes32",
          "indexed": true,
          "internalType": "bytes32"
        },
        {
          "name": "creator",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "VoteCast",
      "inputs": [
        {
          "name": "pollId",
          "type": "bytes32",
          "indexed": true,
          "internalType": "bytes32"
        },
        {
          "name": "voter",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "isYes",
          "type": "bool",
          "indexed": false,
          "internalType": "bool"
        },
        {
          "name": "voteWeight",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        },
        {
          "name": "usdcSpent",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "error",
      "name": "InvalidFeePercentage",
      "inputs": []
    },
    {
      "type": "error",
      "name": "PollDoesNotExist",
      "inputs": []
    },
    {
      "type": "error",
      "name": "ReentrancyGuardReentrantCall",
      "inputs": []
    }
] as const;