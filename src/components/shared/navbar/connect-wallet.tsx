import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { useEffect } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

interface ConnectWalletButtonProps {
  onConnected?: () => void;
}

export const ConnectWalletButton = ({
  onConnected,
}: ConnectWalletButtonProps) => {
  const { open } = useAppKit();
  const { address: addressAppkit, isConnected: isConnectedAppKit } =
    useAppKitAccount();
  const { address } = useAccount();

  // Use auth context for authentication state
  const { isLoading: isSigningIn, isSignedIn } = useAuth();

  useEffect(() => {
    if (isConnectedAppKit && onConnected) {
      onConnected();
    }
  }, [isConnectedAppKit, onConnected]);

  const getButtonText = () => {
    if (!isConnectedAppKit) return "Connect Wallet";
    if (isSigningIn) return "Signing In...";
    if (isSignedIn) return "Connected";
    return "Connect Wallet";
  };

  const getButtonColor = () => {
    if (isSigningIn) return "bg-gray-300 text-gray-500 cursor-not-allowed";
    if (isConnectedAppKit && isSignedIn)
      return "bg-primary text-white cursor-default";
    return "bg-primary hover:bg-secondary text-white";
  };

  const isDisabled = isSigningIn || (isConnectedAppKit && isSignedIn);

  return (
    <div className="space-y-2">
      {addressAppkit && isConnectedAppKit ? (
        <div
          className="flex flex-col text-sm text-gray-500 bg-gray-50 p-2 rounded border cursor-pointer"
          onClick={() => open()}>
          <p className="font-mono">
            <b>reown</b>:{addressAppkit.substring(0, 6)}...
            {addressAppkit.substring(addressAppkit.length - 4)}
          </p>
          <p className="font-mono">
            <b>wagmi</b>:
            {address
              ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
              : "undef"}
          </p>
        </div>
      ) : (
        <Button
          variant="outline"
          onClick={() => open()}
          disabled={isDisabled}
          className={cn(
            "px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl",
            getButtonColor(),
          )}>
          {getButtonText()}
        </Button>
      )}
    </div>
  );
};
