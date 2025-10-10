/* eslint-disable @next/next/no-img-element */
import { Brand } from "@/lib/database/db.schema";
import { ProfileBar } from "./brand-details";
import { DefaultOGImage } from "./default-og-image";

interface BrandOGImageProps {
  brand: Brand;
  coverImage?: ArrayBuffer;
  coverImageType?: string;
  width: number;
  height: number;
}

export const BrandOGImage = ({
  brand,
  coverImage,
  coverImageType,
  width,
  height,
}: BrandOGImageProps) => {
  if (!coverImage || !coverImageType) {
    return (
      <div
        style={{
          width: `${width}px`,
          height: `${height}px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          backgroundColor: "#FFFFFF",
        }}>
        <ProfileBar brand={brand} />
      </div>
    );
  }

  return (
    <div
      style={{
        width: `${width}px`,
        height: `${height}px`,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        backgroundColor: "#1E1E1E",
      }}>
      {/* Cover Image */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}>
        {/* Image container */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            overflow: "hidden",
            backgroundColor: "black",
          }}>
          <img
            src={`data:image/${coverImageType};base64,${Buffer.from(
              coverImage,
            ).toString("base64")}`}
            alt="Cover Image"
            style={{
              width: `${width}px`,
              height: `${height}px`,
              objectPosition: "top",
              marginBottom: "-33.33%",
              imageRendering: "crisp-edges",
              boxShadow: "none",
              filter: "none",
            }}
          />
        </div>
      </div>
    </div>
  );
};
