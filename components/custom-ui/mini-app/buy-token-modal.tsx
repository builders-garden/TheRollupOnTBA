import { sdk } from "@farcaster/miniapp-sdk";
import { AnimatePresence } from "motion/react";
import { useState } from "react";
import { useAccount } from "wagmi";
import { useSocketUtils } from "@/hooks/use-socket-utils";
import { BASE_USDC_ADDRESS, NATIVE_TOKEN_ADDRESS } from "@/lib/constants";
import { FeaturedToken } from "@/lib/database/db.schema";
import { PopupPositions } from "@/lib/enums";
import { User } from "@/lib/types/user.type";
import { cn, formatWalletAddress } from "@/lib/utils";
import { formatSingleToken } from "@/lib/utils/farcaster-tokens";
import { Input } from "../../shadcn-ui/input";
import { NBButton } from "../nb-button";
import { NBModal } from "../nb-modal";

interface BuyTokenModalProps {
  trigger: React.ReactNode;
  token: FeaturedToken;
  user?: User;
}

type SelectableAmount = "1" | "3" | "5" | "10" | "custom";

export const BuyTokenModal = ({ trigger, token, user }: BuyTokenModalProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amountSelected, setAmountSelected] = useState<
    SelectableAmount | undefined
  >(undefined);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { tokenTraded } = useSocketUtils();
  const { address } = useAccount();

  // Get the first wallet address with a base name
  const baseName = user?.wallets.find((wallet) => wallet.baseName)?.baseName;

  // token details
  const tokenName = token.symbol || token.name || "";
  const tokenAddress = token.address || NATIVE_TOKEN_ADDRESS;
  const tokenChainId = token.chainId || 8453;
  const tokenImageUrl = token.logoUrl || "";

  // Handles Modal Open
  const handleModalOpen = () => {
    setIsModalOpen(!isModalOpen);
    // This prevents the values to reset before the modal closing animation is complete
    setTimeout(() => {
      setAmountSelected(undefined);
      setCustomAmount("");
      setIsProcessing(false);
    }, 300);
  };

  // Handle token swap
  const handleSwapToken = async () => {
    try {
      setIsProcessing(true);

      // Get the amount to swap
      const amount =
        amountSelected === "custom"
          ? parseFloat(customAmount)
          : parseFloat(amountSelected || "0");

      if (isNaN(amount) || amount <= 0) {
        console.error("Invalid amount for swap");
        return;
      }
      // Placeholder token addresses - replace with actual token addresses
      const sellToken = formatSingleToken(BASE_USDC_ADDRESS); // USDC on Base
      const buyToken = formatSingleToken(tokenAddress, tokenChainId); // Placeholder token address
      const result = await sdk.actions.swapToken({
        sellToken,
        buyToken,
      });

      if (result.success) {
        // Send socket message to the server
        tokenTraded({
          position: PopupPositions.TOP_CENTER,
          username: baseName || formatWalletAddress(address || ""),
          profilePicture: user?.avatarUrl || "",
          tokenInAmount: "0",
          tokenInName: "USDC",
          tokenInDecimals: 6,
          tokenInImageUrl:
            "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png?1547042194",
          tokenOutAmount: "0",
          tokenOutDecimals: 0,
          tokenOutName: tokenName,
          tokenOutImageUrl: tokenImageUrl,
        });
        // Close modal after successful swap
        handleModalOpen();
      }
    } catch (error) {
      console.error(
        `Token swap failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const selectableAmounts: SelectableAmount[] = ["1", "3", "5", "10"];

  return (
    <NBModal
      trigger={trigger}
      isOpen={isModalOpen}
      setIsOpen={handleModalOpen}
      contentClassName="p-2.5 rounded-[12px]">
      <h1 className="text-2xl font-bold text-center">Buy ${tokenName}</h1>
      <div className="flex flex-col justify-center items-center w-full gap-2.5">
        <div className="grid grid-cols-2 gap-2.5 w-full">
          {selectableAmounts.map((amount) => (
            <NBButton
              key={amount}
              className="w-full"
              buttonColor={amountSelected === amount ? "blue" : "black"}
              onClick={() => setAmountSelected(amount)}>
              <p
                className={cn(
                  "text-base font-extrabold",
                  amountSelected === amount && "text-accent",
                )}>
                ${amount}
              </p>
            </NBButton>
          ))}
        </div>
        <NBButton
          className="w-full"
          buttonColor={amountSelected === "custom" ? "blue" : "black"}
          onClick={() => setAmountSelected("custom")}>
          <p
            className={cn(
              "text-base font-extrabold",
              amountSelected === "custom" && "text-accent",
            )}>
            Custom
          </p>
        </NBButton>
        <AnimatePresence mode="wait">
          {amountSelected === "custom" && (
            <Input
              placeholder="e.g. $0.01"
              className="w-full h-[42px] border-accent focus-visible:ring-accent/40 focus-visible:ring-[2px] focus-visible:border-accent rounded-[12px] transition-all duration-300"
              type="number"
              min={0}
              value={customAmount}
              onChange={(e) => {
                const value = e.target.value;
                // Allow empty string or valid numbers >= 0
                if (
                  value === "" ||
                  (!isNaN(Number(value)) && Number(value) >= 0)
                ) {
                  setCustomAmount(value);
                } else {
                  setCustomAmount("");
                }
              }}
            />
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col justify-center items-center w-full gap-5 mt-14">
        <AnimatePresence mode="wait">
          {!!amountSelected && (
            <NBButton
              key="confirm"
              className="w-full bg-accent"
              onClick={handleSwapToken}
              disabled={isProcessing}>
              <p className="text-base text-white font-extrabold">
                {isProcessing ? "Processing..." : "Confirm"}
              </p>
            </NBButton>
          )}
        </AnimatePresence>
        <button
          className="text-base font-bold text-black cursor-pointer"
          onClick={handleModalOpen}>
          Cancel
        </button>
      </div>
    </NBModal>
  );
};
