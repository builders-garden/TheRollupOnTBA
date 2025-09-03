import { createBaseAccountSDK } from "@base-org/account";
import { useCallback, useState } from "react";
import { useAuth } from "@/contexts/auth-context";


export const useBaseAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refetchUser } = useAuth();

  const signInWithBase = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Initialize the Base Account SDK
      const provider = createBaseAccountSDK({}).getProvider();
      console.log("Base provider initialized:", provider);

      // Step 1: Request account access
      const addresses = await provider.request({
        method: "eth_requestAccounts",
      });
      console.log("Connected addresses:", addresses);

      if (!addresses) {
        throw new Error("No accounts available");
      }

      if (!Array.isArray(addresses) || addresses.length === 0) {
        throw new Error("No accounts available");
      }

      const address: string = addresses[0];

      // Step 2: Switch to Base chain
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x2105" }], // Base mainnet 
      });
      console.log("Switched to Base chain");

      // Step 3: Get nonce from backend
      const nonceResponse = await fetch(
        `/api/base/nonce?address=${encodeURIComponent(address)}&chainId=8453`, // Base mainnet
      );

      if (!nonceResponse.ok) {
        throw new Error("Failed to get nonce from server");
      }

      const { nonce } = await nonceResponse.json();
      console.log("Generated nonce:", nonce);

      // Step 4: Create SIWE message
      const message = `${window.location.host} wants you to sign in with your Ethereum account:
${address}

Sign in with Base to authenticate your account.

URI: ${window.location.origin}
Version: 1
Chain ID: "8453"
Nonce: ${nonce}
Issued At: ${new Date().toISOString()}`;

      console.log("SIWE message:", message);

      // Step 5: Sign the message
      const signature = await provider.request({
        method: "personal_sign",
        params: [message, address],
      });
      console.log("Signature:", signature);

      // Step 6: Verify signature with backend
      const verifyResponse = await fetch("/api/base/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          message,
          signature,
          nonce,
        }),
      });

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json();
        throw new Error(errorData.error || "Authentication failed");
      }

      const result = await verifyResponse.json();

      if (result.success) {
        // Refresh user data after successful authentication
        await refetchUser();
        console.log("Base authentication successful");
      } else {
        throw new Error(result.error || "Authentication failed");
      }
    } catch (err: any) {
      console.error("Base sign-in error:", err);
      setError(err.message || "Sign in with Base failed");
    } finally {
      setIsLoading(false);
    }
  }, [refetchUser]);

  return {
    signInWithBase,
    isLoading,
    error,
    clearError: () => setError(null),
  };
};
