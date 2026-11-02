import errorHandler from "@/app/helpers/errorHandler";
import VendorModel from "@/db/models/vendorModel";

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id") as string;
    const profile = await VendorModel.getProfile(userId);
    if (!profile) throw { message: "Vendor not found", status: 404 };
    return Response.json(profile);
  } catch (error) {
    return errorHandler(error); // sebelumnya tanpa `return` -> 500 "No response"
  }
}

export async function PUT(req: Request) {
  try {
    const userId = req.headers.get("x-user-id") as string;
    const body = await req.json();
    const result = await VendorModel.putProfile(body, userId);
    return Response.json({ message: result });
  } catch (error) {
    return errorHandler(error);
  }
}
