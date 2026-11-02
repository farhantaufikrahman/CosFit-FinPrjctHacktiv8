import ProfileModel from "@/db/models/profileModel";
import errorHandler from "@/app/helpers/errorHandler";

// Semua catch sebelumnya `errorHandler(error)` TANPA `return`
// -> Next.js: "No response is returned from route handler" (500).

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id") as string;
    const profile = await ProfileModel.getProfile(userId);
    if (!profile) throw { message: "Profile not found", status: 404 };
    return Response.json(profile);
  } catch (error) {
    return errorHandler(error);
  }
}

export async function PUT(req: Request) {
  try {
    const userId = req.headers.get("x-user-id") as string;
    const body = await req.json();
    const result = await ProfileModel.putProfile(body, userId);
    return Response.json({ message: result });
  } catch (error) {
    return errorHandler(error);
  }
}

export async function PATCH(req: Request) {
  try {
    const userId = req.headers.get("x-user-id") as string;
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      throw { message: "No file uploaded", status: 400 };
    }

    const result = await ProfileModel.patchProfile(file, userId);
    return Response.json(result);
  } catch (error) {
    return errorHandler(error);
  }
}
