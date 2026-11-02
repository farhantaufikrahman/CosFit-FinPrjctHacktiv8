import ProductModel from "@/db/models/productModel";
import errorHandler from "@/app/helpers/errorHandler";
import { cookies } from "next/headers";

// GET /api/user/product/:slug  (param bernama `id` tapi isinya slug)
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const result = await ProductModel.getBySlug(id);
    return Response.json(result);
  } catch (error) {
    return errorHandler(error);
  }
}

// PUT dihapus dari sini: endpoint publik tanpa auth yang bisa mengubah product
// siapa pun. Edit product sekarang lewat PUT /api/vendor/product/:id.

// PATCH = tambah view counter (maks 3x per product per 12 jam per browser)
export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const viewedCookie = cookieStore.get("viewed_products");

    let viewedProducts: Record<string, number> = {};
    if (viewedCookie) {
      try {
        viewedProducts = JSON.parse(viewedCookie.value);
      } catch {
        viewedProducts = {}; // cookie rusak -> reset, jangan 500
      }
    }

    const currentCount = viewedProducts[id] || 0;
    const MAX_VIEWS = 3;

    if (currentCount >= MAX_VIEWS) {
      return Response.json({ message: "View limit reached for this product." });
    }

    await ProductModel.addViews(id);

    viewedProducts[id] = currentCount + 1;
    cookieStore.set("viewed_products", JSON.stringify(viewedProducts), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 12, // 12 jam
    });

    // Sebelumnya tidak ada return -> Next.js melempar "No response is returned"
    return Response.json({ message: "View added" });
  } catch (error) {
    return errorHandler(error);
  }
}
