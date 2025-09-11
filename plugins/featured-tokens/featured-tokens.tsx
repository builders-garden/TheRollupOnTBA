import Image from "next/image";
import { BuyTokenModal } from "@/components/custom-ui/mini-app/buy-token-modal";
import { NBButton } from "@/components/custom-ui/nb-button";
import { FeaturedToken } from "@/lib/database/db.schema";
import { User } from "@/lib/types/user.type";

interface FeaturedTokensProps {
  tokens: FeaturedToken[];
  user?: User;
}

export const FeaturedTokens = ({ tokens, user }: FeaturedTokensProps) => {
  return (
    <div className="flex flex-col justify-center items-start w-full gap-2.5">
      <h1 className="text-sm font-bold">Featured Tokens</h1>
      <div className="grid grid-cols-2 w-full gap-2.5">
        {tokens.map((token, index) => (
          <BuyTokenModal
            key={index}
            trigger={
              <NBButton className="w-full py-2.5">
                <div className="flex justify-center items-center w-full gap-1.5">
                  {token.logoUrl ? (
                    <Image
                      src={token.logoUrl}
                      alt={token.name + index.toString()}
                      width={22}
                      height={22}
                    />
                  ) : (
                    <div className="size-4 rounded-full border border-black" />
                  )}
                  <p className="text-base font-extrabold text-nowrap">
                    Buy ${token.symbol || token.name || ""}
                  </p>
                </div>
              </NBButton>
            }
            token={token}
            user={user}
          />
        ))}
      </div>
    </div>
  );
};
