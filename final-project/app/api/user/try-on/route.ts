import TryOnModel from "@/db/models/tryonModel";
import errorHandler from "@/app/helpers/errorHandler";

// POST multipart: User (File), Product (url gambar kostum), CharName, Theme
export async function POST(req: Request) {
  try {
    const userId = req.headers.get("x-user-id") as string; // dijamin proxy.ts
    const formData = await req.formData();

    const yourImg = formData.get("User");
    const cosImg = String(formData.get("Product") ?? "");
    const name = String(formData.get("CharName") ?? "");
    const theme = String(formData.get("Theme") ?? "");

    if (!(yourImg instanceof File) || yourImg.size === 0) {
      throw { message: "Please upload your photo", status: 400 };
    }
    if (!yourImg.type.startsWith("image/")) {
      throw { message: "File must be an image", status: 400 };
    }
    if (!/^https:\/\//.test(cosImg)) {
      throw { message: "Product image url is required", status: 400 };
    }

    const response = await TryOnModel.UserTryOn(yourImg, cosImg, userId, name, theme);
    return Response.json(response);
  } catch (error) {
    return errorHandler(error);
  }
}
