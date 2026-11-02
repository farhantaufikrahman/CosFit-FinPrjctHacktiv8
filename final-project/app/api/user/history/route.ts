import errorHandler from "@/app/helpers/errorHandler";
import TryOnModel from "@/db/models/tryonModel";

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      throw { message: "please login first", status: 401 }; // sebelumnya 500 "invalid"
    }
    const response = await TryOnModel.getHistory(userId);
    return Response.json(response);
  } catch (error) {
    return errorHandler(error);
  }
}
