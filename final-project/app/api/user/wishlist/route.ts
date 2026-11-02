import WishlistModel from "@/db/models/wishlistModel";
import errorHandler from "@/app/helpers/errorHandler";

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id") as string;
    const wishlist = await WishlistModel.getWishlistByUserId(userId);
    return Response.json(wishlist);
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

    const data = await WishlistModel.addWishlist(body, userId);
    return Response.json({ message: data }, { status: 201 });
  } catch (error) {
    return errorHandler(error);
  }
}
