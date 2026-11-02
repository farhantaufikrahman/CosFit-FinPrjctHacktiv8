import WishlistModel from "@/db/models/wishlistModel";
import errorHandler from "@/app/helpers/errorHandler";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = req.headers.get("x-user-id") as string;
    const { id } = await params;
    // Hanya wishlist milik user sendiri (sebelumnya bisa baca milik siapa pun)
    const wishlist = await WishlistModel.getWishlistById(id, userId);
    if (!wishlist) throw { message: "Wishlist not found", status: 404 };
    return Response.json(wishlist);
  } catch (error) {
    return errorHandler(error);
  }
}

// :id boleh _id wishlist ATAU productId (dipakai tombol toggle di card product)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = req.headers.get("x-user-id") as string;
    const { id } = await params;
    const result = await WishlistModel.deleteWishlist(id, userId);
    return Response.json({ message: result }, { status: 200 });
  } catch (error) {
    return errorHandler(error);
  }
}
