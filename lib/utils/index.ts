import { clsx, type ClassValue } from "clsx";
import ky from "ky";
import { twMerge } from "tailwind-merge";
import { ADMIN_FIDS } from "@/lib/constants";
import { env } from "@/lib/zod";

/**
 * Merge class names
 * @param inputs - Class names to merge
 * @returns Merged class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Check if an image is valid client-side
 * @param imageSrc - The source of the image
 * @returns True if the image is valid, false otherwise
 */
export const checkImage = async (imageSrc: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const image = new window.Image();
    image.src = imageSrc ?? "";
    image.alt = "Participant Image";
    image.onload = () => resolve(true);
    image.onerror = () => resolve(false);
  });
};

/**
 * Validate an image URL server-side
 * @param url - The URL of the image
 * @returns The URL if the image is valid, null otherwise
 */
export const validateImageUrl = async (url: string): Promise<string | null> => {
  try {
    await ky.head(url);
    return url;
  } catch {
    return null;
  }
};

/**
 * Formats a number with 'k' for thousands and 'M' for millions
 * @param value - The number to format
 * @param decimals - Number of decimal places to show (default: 2)
 * @returns Formatted string with appropriate suffix
 *
 * Examples:
 * formatNumberWithSuffix(1234) => "1.23k"
 * formatNumberWithSuffix(1234567) => "1.23M"
 */
export const formatNumberWithSuffix = (value: number, decimals = 2): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return "0";
  }

  // For values less than 1000, just return the number with fixed decimals
  if (Math.abs(value) < 1000) {
    return value.toFixed(decimals);
  }

  // For thousands (k)
  if (Math.abs(value) < 1000000) {
    return (value / 1000).toFixed(decimals) + "k";
  }

  // For millions (M)
  return (value / 1000000).toFixed(decimals) + "M";
};

/**
 * Format the avatar src for imagedelivery.net images to reasonable avatar sizes
 *
 * @docs https://developers.cloudflare.com/images/transform-images/transform-via-url/#options
 *
 * @param avatarSrc - The src of the avatar
 * @returns The formatted avatar src
 */
export const formatAvatarSrc = (avatarSrc: string) => {
  if (avatarSrc.startsWith("https://imagedelivery.net")) {
    const defaultAvatar = "/anim=false,fit=contain,f=auto,w=512";
    if (avatarSrc.endsWith("/rectcrop3")) {
      avatarSrc = avatarSrc.replace("/rectcrop3", defaultAvatar);
    } else if (avatarSrc.endsWith("/original")) {
      avatarSrc = avatarSrc.replace("/original", defaultAvatar);
    } else if (avatarSrc.endsWith("/public")) {
      avatarSrc = avatarSrc.replace("/public", defaultAvatar);
    }
  }
  return avatarSrc;
};

/**
 * Copy text to clipboard
 * @param text - The text to copy
 * @param setIsCopied - The function to set the show copied state
 */
export const copyToClipboard = async (
  text: string | undefined,
  setIsCopied: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  if (!text) return;

  try {
    await navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 750);
  } catch (err) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);

    textArea.select();
    try {
      document.execCommand("copy");
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 750);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }

    document.body.removeChild(textArea);
  }
};

/**
 * Create a twitter intent url to open a prefilled tweet
 * @param text - The text of the tweet
 * @param miniappUrl - The url of the miniapp
 * @returns The twitter intent url
 */
export const createTwitterIntentUrl = (text: string, miniappUrl: string) => {
  const finalURL = `https://x.com/intent/tweet?text=${encodeURIComponent(
    text,
  )}&url=${encodeURIComponent(miniappUrl)}&via=builders_garden`;
  return finalURL;
};

/**
 * Check if a user is not an admin and is not in production
 * @param fid - The Farcaster fid of the user
 * @returns True if the user is not an admin and is not in production, false otherwise
 */
export const userIsNotAdminAndIsNotProduction = (fid: number): boolean => {
  return (
    env.NEXT_PUBLIC_URL !== "https://production.example.com" &&
    !ADMIN_FIDS.includes(Number(fid))
  );
};

/**
 * Format a wallet address to a more readable format
 * @param address - The wallet address
 * @returns The formatted wallet address
 */
export const formatWalletAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(address.length - 4)}`;
};
