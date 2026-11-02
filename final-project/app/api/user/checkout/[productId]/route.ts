import errorHandler from "@/app/helpers/errorHandler";
import CheckoutModel from "@/db/models/checkoutModel";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ productId: string }> },
) {
  try {
    const { productId } = await params;
    const userId = req.headers.get("x-user-id") as string;
    const res = await CheckoutModel.deleteCheckoutByProductAndUserId(userId, productId);

    if (res.deletedCount === 0) {
      throw { message: "Checkout item not found", status: 404 };
    }

    // Sebelumnya `return res` (DeleteResult Mongo, bukan Response) -> 500
    return Response.json({ message: "Checkout item deleted" });
  } catch (error) {
    return errorHandler(error);
  }
}
