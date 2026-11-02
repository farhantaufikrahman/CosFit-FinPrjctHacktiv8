import CheckoutModel from "@/db/models/checkoutModel";
import errorHandler from "@/app/helpers/errorHandler";

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id") as string;
    const checkouts = await CheckoutModel.getAllCheckouts(userId);
    return Response.json(checkouts);
  } catch (error) {
    return errorHandler(error);
  }
}

export async function POST(req: Request) {
  try {
    const userId = req.headers.get("x-user-id") as string;
    const body = await req.json();

    if (!body.productId) {
      throw { message: "productId is required", status: 400 };
    }

    const result = await CheckoutModel.createCheckout(body, userId);
    return Response.json({ message: result }, { status: 201 });
  } catch (error) {
    return errorHandler(error);
  }
}
