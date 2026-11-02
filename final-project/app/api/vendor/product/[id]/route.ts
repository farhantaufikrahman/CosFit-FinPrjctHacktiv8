import errorHandler from "@/app/helpers/errorHandler";
import ProductModel from "@/db/models/productModel";

// Login vendor + kepemilikan product sudah dicek di proxy.ts

// PUT /api/vendor/product/:id -> ubah data product (field di-whitelist di model)
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const result = await ProductModel.putProduct(body, id);
    return Response.json({ message: result });
  } catch (error) {
    return errorHandler(error);
  }
}

// PATCH /api/vendor/product/:id -> ganti gambar utama (multipart, field "image")
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    // Sebelumnya: req.json() lalu dikirim sebagai File ke put() -> selalu error
    const formData = await req.formData();
    const image = formData.get("image");

    if (!(image instanceof File) || image.size === 0) {
      throw { message: "No image file provided", status: 400 };
    }

    const result = await ProductModel.patchProduct(image, id);
    return Response.json({ message: result });
  } catch (error) {
    return errorHandler(error);
  }
}
