import errorHandler from "@/app/helpers/errorHandler";
import ProductModel from "@/db/models/productModel";
import { put } from "@vercel/blob";

// PATCH /api/vendor/product/:id/galery -> tambah foto galeri (multipart, field "image")
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const formData = await req.formData();
    const image = formData.get("image");

    if (!(image instanceof File) || image.size === 0) {
      throw { message: "No image file provided", status: 400 };
    }

    const blob = await put(image.name, image, {
      access: "public",
      addRandomSuffix: true,
    });

    const res = await ProductModel.addGaleryPhoto(blob.url, id);
    return Response.json({ message: res, url: blob.url });
  } catch (error) {
    return errorHandler(error);
  }
}

// PUT /api/vendor/product/:id/galery -> hapus satu gambar ({ url })
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { url } = await req.json();

    if (typeof url !== "string" || !url) {
      throw { message: "url is required", status: 400 };
    }

    const result = await ProductModel.deleteImage(id, url);
    return Response.json(result);
  } catch (error) {
    return errorHandler(error);
  }
}
