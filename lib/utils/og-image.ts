import ky from "ky";
import { env } from "@/lib/zod";

/**
 * Get the local fonts for the mini app
 * @returns Fonts for the mini app
 */
export async function getFonts(): Promise<
  {
    name: string;
    data: ArrayBuffer;
    weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
    style: "normal" | "italic";
  }[]
> {
  const [font, fontBold] = await Promise.all([
    ky
      .get(`${env.NEXT_PUBLIC_URL}/fonts/inter-latin-ext-400-normal.woff`)
      .arrayBuffer(),
    ky
      .get(`${env.NEXT_PUBLIC_URL}/fonts/inter-latin-ext-700-normal.woff`)
      .arrayBuffer(),
  ]);
  return [
    {
      name: "Inter",
      data: font,
      weight: 400 as const,
      style: "normal" as const,
    },
    {
      name: "Inter",
      data: fontBold,
      weight: 900 as const,
      style: "normal" as const,
    },
  ];
}

/**
 * Load an image from a URL to array buffer
 * @param url - The URL of the image to load
 * @returns The image as an ArrayBuffer
 */
export async function loadImage(url: string): Promise<ArrayBuffer> {
  return await ky.get(url, { timeout: false }).arrayBuffer();
}

/**
 * Get the type of the cover image
 * @param url - The URL of the image to get the type of
 * @returns The type of the image
 */
export function getImageType(url: string): string {
  if (url.endsWith(".png")) {
    return "png";
  } else if (url.endsWith(".webp")) {
    return "webp";
  } else if (url.endsWith(".gif")) {
    return "gif";
  } else if (url.endsWith(".jpg") || url.endsWith(".jpeg")) {
    return "jpeg";
  }
  return "jpeg";
}
