import errorHandler from "@/app/helpers/errorHandler";
import ProductModel from "@/db/models/productModel";
import { put } from "@vercel/blob";
import { sanitizeRichText } from "@/helpers/sanitize";

// GET /api/vendor/product?page=1&limit=4 -> product milik vendor yang login
export async function GET(req: Request) {
  try {
    const vendorId = req.headers.get("x-user-id") as string;
    const { searchParams } = new URL(req.url);

    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 4));

    const result = await ProductModel.getProductByVendorId(vendorId, page, limit);
    return Response.json(result);
  } catch (error) {
    return errorHandler(error);
  }
}

// POST /api/vendor/product (multipart)
export async function POST(req: Request) {
  try {
    const vendorId = req.headers.get("x-user-id") as string;
    const formData = await req.formData();

    const image = formData.get("image");
    const title = String(formData.get("title") ?? "").trim();
    const desc = sanitizeRichText(formData.get("desc"));
    const size = String(formData.get("size") ?? "");
    const theme = formData.getAll("theme").map(String).filter(Boolean);
    const originalPrice = String(formData.get("originalPrice") ?? "");
    const finalPrice = String(formData.get("finalPrice") || originalPrice);
    const stock = Number(formData.get("stock"));
    const galery = formData
      .getAll("imgGalery")
      .filter((f): f is File => f instanceof File && f.size > 0);

    if (!(image instanceof File) || image.size === 0) {
      throw { message: "Main image is required", status: 400 };
    }
    if (!title || !originalPrice || Number.isNaN(Number(originalPrice))) {
      throw { message: "Title and a valid price are required", status: 400 };
    }
    if (!Number.isInteger(stock) || stock < 0) {
      throw { message: "Stock must be a non-negative integer", status: 400 };
    }

    const [main, ...gallery] = await Promise.all(
      [image, ...galery].map((file) =>
        put(file.name, file, { access: "public", addRandomSuffix: true }),
      ),
    );

    const result = await ProductModel.postProduct(
      {
        imgUrl: main.url,
        imgGalery: gallery.map((b) => b.url),
        title,
        desc,
        size,
        theme,
        originalPrice,
        finalPrice,
        stock,
      },
      vendorId,
    );

    return Response.json({ message: result }, { status: 201 });
  } catch (error) {
    return errorHandler(error);
  }
}
