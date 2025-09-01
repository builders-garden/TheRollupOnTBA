import { User } from "@/lib/types/user.type";
import { ProfileBar } from "./profile-bar";

/* eslint-disable @next/next/no-img-element */
interface ProfileOGImageProps {
  user: User;
  coverImage: ArrayBuffer;
  coverImageType: string;
  width: number;
  height: number;
}

export const ProfileOGImage = ({
  user,
  coverImage,
  coverImageType,
  width,
  height,
}: ProfileOGImageProps) => {
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
              width: "100%",
              height: "100%",
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
          {/* User section - positioned at bottom-left */}
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
            <ProfileBar user={user} />
          </div>
        </div>
      </div>
    </div>
  );
};
