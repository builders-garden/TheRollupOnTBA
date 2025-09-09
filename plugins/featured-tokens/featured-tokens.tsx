import { BuyTokenModal } from "@/components/custom-ui/mini-app/buy-token-modal";
import { NBButton } from "@/components/custom-ui/nb-button";
import { cn } from "@/lib/utils";

interface FeaturedTokensProps {
  tokens: {
    name: string;
    color: string;
    buttonClassName?: string;
    buttonColor?: "black" | "blue";
  }[];
}

export const FeaturedTokens = ({ tokens }: FeaturedTokensProps) => {
  return (
    <div className="flex flex-col justify-center items-start w-full gap-2.5">
      <h1 className="text-sm font-bold">Featured Tokens</h1>
      <div className="grid grid-cols-2 w-full gap-2.5">
        {tokens.map((token) => (
          <BuyTokenModal
            key={token.name + token.color}
            trigger={
              <NBButton
                className={cn("w-full py-2.5", token.buttonClassName)}
                buttonColor={token.buttonColor}>
                <div className="flex justify-center items-center w-full gap-1.5">
                  <div
                    className={cn(
                      "size-4 rounded-full border border-black",
                      token.color,
                    )}
                  />
                  <p className="text-base font-extrabold text-nowrap">
                    Buy ${token.name}
                  </p>
                </div>
              </NBButton>
            }
            tokenName={token.name}
          />
        ))}
      </div>
    </div>
  );
};
