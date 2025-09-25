import { Brand } from "@/lib/database/db.schema";
import { ProfileBar } from "./brand-details";

/* eslint-disable @next/next/no-img-element */
interface BrandOGImageProps {
  brand: Brand;
  coverImage: ArrayBuffer;
  coverImageType: string;
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
          {/* Dark gradient overlay - darkens the bottom area */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0) 40%, rgba(0,0,0,0.5) 80%, rgba(0,0,0,0.9) 100%)",
              display: "flex",
            }}
          />
          {/* Brand section - positioned at bottom-left */}
          <div
            style={{
              position: "absolute",
              left: 50,
              bottom: 50,
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "flex-start",
              flexDirection: "column",
              gap: "15px",
              width: "100%",
              minWidth: "350px",
            }}>
            <ProfileBar brand={brand} />
          </div>
        </div>
      </div>
    </div>
  );
};
