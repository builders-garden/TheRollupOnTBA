import Image from "next/image";
import { NBButton } from "@/components/custom-ui/nb-button";
import { FeaturedToken } from "@/lib/database/db.schema";
import { User } from "@/lib/types/user.type";

interface WebAppFeaturedTokensProps {
  tokens: FeaturedToken[];
  user?: User;
}

export const WebAppFeaturedTokens = ({ tokens }: WebAppFeaturedTokensProps) => {
  // Handle open token page (_blank)
  const handleOpenTokenPage = (token: FeaturedToken) => {
    if (!token.chainId) return;
    const matchaTokenUrl = `https://matcha.xyz/tokens/${token.chainId}/${token.address || "eth"}`;
    window.open(matchaTokenUrl, "_blank");
  };

  return (
    <div className="flex flex-col justify-center items-start w-full gap-2.5">
      <h1 className="text-2xl font-bold">Featured Tokens</h1>
      <div className="grid grid-cols-2 w-full gap-2.5">
        {tokens.map((token, index) => (
          <NBButton
            key={index}
            onClick={() => handleOpenTokenPage(token)}
            className="flex justify-between items-center w-full">
            <div className="flex justify-start items-center w-full gap-2">
              <div className="relative size-[32px]">
                <Image
                  src={token.logoUrl || "/images/coin.svg"}
                  alt={token.name + index.toString()}
                  width={32}
                  height={32}
                />
                <Image
                  src={token.chainLogoUrl || ""}
                  alt={token.chainId?.toString() || ""}
                  className="absolute bottom-0 -right-0.5 rounded-full"
                  width={13}
                  height={13}
                />
              </div>
              <p className="text-base font-extrabold break-words">
                ${token.symbol || token.name || ""}
              </p>
            </div>
          </NBButton>
        ))}
      </div>
    </div>
  );
};
