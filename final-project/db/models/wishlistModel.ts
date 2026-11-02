import { PostWishlist } from "@/app/types";
import { database } from "@/db/config/mongodb";
import { ObjectId } from "mongodb";

export default class WishlistModel {
  static collection() {
    return database.collection("wishlists");
  }

  static async getWishlistByUserId(userId: string) {
    return await this.collection()
      .aggregate([
        {
          $match: {
            userId: new ObjectId(userId),
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "productId",
            foreignField: "_id",
            as: "product",
          },
        },
        {
          $unwind: "$product",
        },
        {
          $lookup: {
            from: "vendors",
            let: {
              vendorId: {
                $toObjectId: "$product.vendorId",
              },
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$_id", "$$vendorId"],
                  },
                },
              },
            ],
            as: "vendor",
          },
        },
        {
          $unwind: "$vendor",
        },
      ])
      .toArray();
  }

  static getWishlistById(id: string, userId: string) {
    return this.collection().findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId),
    });
  }

  static async addWishlist(wishlistData: PostWishlist, userId: string) {
    const productId = new ObjectId(wishlistData.productId);
    const userObjectId = new ObjectId(userId);

    // Upsert: klik dua kali tidak membuat wishlist ganda
    const result = await this.collection().updateOne(
      { productId, userId: userObjectId },
      { $setOnInsert: { productId, userId: userObjectId, createdAt: new Date() } },
      { upsert: true },
    );

    return result.upsertedId
      ? "Wishlist created with ID: " + result.upsertedId
      : "Product already in wishlist";
  }

  static async deleteWishlist(id: string, userId: string) {
    const objectId = new ObjectId(id);
    const userObjectId = new ObjectId(userId);

    // :id bisa berupa _id wishlist atau productId
    const result = await this.collection().deleteOne({
      userId: userObjectId,
      $or: [{ _id: objectId }, { productId: objectId }],
    });

    if (result.deletedCount === 0) {
      throw { message: "Wishlist not found", status: 404 };
    }

    return "Wishlist deleted with ID: " + id;
  }
}
