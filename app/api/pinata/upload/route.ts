import { NextRequest, NextResponse } from "next/server";
import { PinataSDK } from "pinata";
import { env } from "@/lib/zod";

const pinata = new PinataSDK({
  pinataJwt: env.PINATA_JWT_SECRET,
  pinataGateway: env.NEXT_PUBLIC_GATEWAY_URL,
});

export const POST = async (req: NextRequest) => {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  // If there is no file, return an error
  if (!file) {
    console.log("No file provided");
    return NextResponse.json(
      { success: false, error: "File is required" },
      { status: 400 },
    );
  }

  // If the file is not a file, return an error
  if (!(file instanceof File)) {
    console.log("Passed file is not a file");
    return NextResponse.json(
      { success: false, error: "Passed file is not a file" },
      { status: 400 },
    );
  }

  try {
    const upload = await pinata.upload.public.file(file);
    const fileCID = upload.cid;
    const url = await pinata.gateways.public.convert(fileCID);
    return NextResponse.json({ success: true, url }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, error: "Failed to upload file" },
      { status: 500 },
    );
  }
};
