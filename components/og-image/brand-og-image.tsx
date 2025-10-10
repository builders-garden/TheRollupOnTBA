/* eslint-disable @next/next/no-img-element */
interface BrandOGImageProps {
  coverImage: ArrayBuffer;
  coverImageType: string;
  width: number;
  height: number;
}

export const BrandOGImage = ({
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
        </div>
      </div>
    </div>
  );
};
