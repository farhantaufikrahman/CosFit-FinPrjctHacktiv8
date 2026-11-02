import { put } from "@vercel/blob";
import errorHandler from "@/app/helpers/errorHandler";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    // const file = formData.get("file");

    const image = formData.get("image") as File;

    if (!image || !(image instanceof File)) {
      throw { message: "No image file provided", status: 400 };
    }
    const blob = await put(image.name, image, {
      access: "public",
      addRandomSuffix: true,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return Response.json({ url: blob.url }, { status: 201 });
  } catch (error) {
    return errorHandler(error);
  }
}
