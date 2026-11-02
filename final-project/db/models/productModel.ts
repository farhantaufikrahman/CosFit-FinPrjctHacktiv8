import { PostProduct } from "@/app/types";
import { database } from "../config/mongodb";
import { ObjectId } from "mongodb";
import { put } from "@vercel/blob";
import { generateSlug } from "@/helpers/generateSlug";
import { sanitizeRichText } from "@/helpers/sanitize";

export default class ProductModel {
  static collection() {
    return database.collection("products");
  }

  static async getAllnSearch(search: string = "") {
    const agg = [
      {
        $match: {
          $or: [
            {
              theme: {
                $regex: search,
                $options: "i",
              },
            },
            {
              title: {
                $regex: search,
                $options: "i",
              },
            },
            {
              desc: {
                $regex: search,
                $options: "i",
              },
            },
          ],
        },
      },
    ];
    const data = await this.collection().aggregate(agg).toArray();
    return data;
  }

  static async getById(id: string) {
    if (!id || !ObjectId.isValid(id)) {
      throw { message: "Product not found", status: 404 };
    }

    const product = await this.collection().findOne({
      _id: new ObjectId(id),
    });

    if (!product) {
      throw { message: "Product not found", status: 404 };
    }

    return product;
  }

  static async getProductByVendorId(
    vendorId: string,
    page: number,
    limit: number,
  ) {
    const skip = (page - 1) * limit;

    const filter = {
      vendorId: new ObjectId(vendorId),
    };

    const agg = {
      $lookup: {
        from: "wishlists",
        localField: "_id",
        foreignField: "productId",
        as: "wishlists",
      },
    };

    const match = {
      $match: filter,
    };

    // $match dulu baru $lookup: sebelumnya $lookup dijalankan ke SEMUA product
    const products = await this.collection()
      .aggregate([match, { $skip: skip }, { $limit: limit }, agg])
      .toArray();

    const total = await this.collection().countDocuments(filter);

    return {
      data: products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async postProduct(productData: PostProduct, vendorId: string) {
    const slug = generateSlug(productData.title, ...productData.theme);

    const result = await this.collection().insertOne({
      ...productData,
      discount: 0,
      slug,
      vendorId: new ObjectId(vendorId),
    });

    return "Product created with ID: " + result.insertedId;
  }

  // Whitelist field: body tidak boleh mengubah vendorId, _id, slug, dll.
  static async putProduct(productData: Partial<PostProduct>, id: string) {
    const EDITABLE = [
      "title",
      "desc",
      "size",
      "theme",
      "originalPrice",
      "finalPrice",
      "discount",
      "stock",
    ] as const;

    const update: Record<string, unknown> = {};
    for (const key of EDITABLE) {
      if (productData[key] !== undefined) update[key] = productData[key];
    }
    if (update.stock !== undefined) update.stock = Number(update.stock);
    if (update.desc !== undefined) update.desc = sanitizeRichText(update.desc);

    const result = await this.collection().updateOne(
      { _id: new ObjectId(id) },
      { $set: update },
    );
    if (result.matchedCount === 0) {
      throw { message: "Product not found", status: 404 };
    }
    return `Product ${id} updated successfully`;
  }

  static async patchProduct(photo: File, id: string) {
    const blob = await put(photo.name, photo, {
      addRandomSuffix: true,
      access: "public",
    });
    const product = await this.collection().updateOne(
      { _id: new ObjectId(id) },
      { $set: { imgUrl: blob.url } },
    );
    return `Product image of ${id} updated successfully (${product.modifiedCount})`;
  }

  static async addGaleryPhoto(imgUrl: string, id: string) {
    const product = await this.collection().updateOne(
      { _id: new ObjectId(id) },
      { $push: { imgGalery: imgUrl } } as any,
    );
    return `Product galery of ${id} updated successfully (${product.modifiedCount})`;
  }

  static async addViews(id: string) {
    await this.collection().updateOne(
      { _id: new ObjectId(id) },
      {
        $inc: {
          views: 1,
        },
      },
    );
  }

  static async getPopularChar() {
    const agg = [
      {
        $sort: {
          views: -1,
        },
      },
      {
        $limit: 4,
      },
    ];
    const data = await this.collection().aggregate(agg).toArray();
    return data;
  }

  static async getFeaturedChar() {
    const agg = [
      {
        $sort: {
          discount: -1,
        },
      },
      {
        $limit: 4,
      },
    ];

    const data = await this.collection().aggregate(agg).toArray();
    return data;
  }

  static async getRelatedChar() {
    const agg = [
      {
        $match: {
          theme: "Wuthering Waves",
          _id: {
            $ne: new ObjectId("6a5a40d95855caae5e513959"),
          },
        },
      },
      {
        $limit: 4,
      },
    ];
    const data = await this.collection().aggregate(agg).toArray();
    return data;
  }

  static async getBySlug(slug: string) {
    const product = await this.collection().findOne({
      slug,
    });

    if (!product) {
      throw { message: "Product not found", status: 404 };
    }

    return product;
  }

  static async decreaseQuantity(id: string, quantity: number | string){
    const res = await this.collection().updateOne({_id: new ObjectId(id)}, {$inc: {stock: -Number(quantity)}})
    return res
  }

  static async deleteImage(id: string, url: string) {
    const product = await this.collection().findOne({
      _id: new ObjectId(id),
    });

    if (!product) {
      throw { message: "Product not found", status: 404 };
    }

    // Normalize gallery to always be an array
    const gallery = Array.isArray(product.imgGalery)
      ? product.imgGalery
      : product.imgGalery
        ? [product.imgGalery]
        : [];

    // Deleting the main image
    if (product.imgUrl === url) {
      if (gallery.length === 0) {
        throw { message: "Product must have at least one image.", status: 400 };
      }

      const [newMain, ...newGallery] = gallery;

      await this.collection().updateOne(
        { _id: product._id },
        {
          $set: {
            imgUrl: newMain,
            imgGalery: newGallery,
          },
        }
      );

      return {
        message: "Main image deleted successfully.",
      };
    }

    // Deleting a gallery image
    const newGallery = gallery.filter((img) => img !== url);

    await this.collection().updateOne(
      { _id: product._id },
      {
        $set: {
          imgGalery: newGallery,
        },
      }
    );

    return {
      message: "Gallery image deleted successfully.",
    };
  }
}
