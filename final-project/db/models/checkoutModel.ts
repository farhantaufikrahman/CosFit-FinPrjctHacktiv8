import { PostCheckout } from "@/app/types";
import { database } from "../config/mongodb";
import { ObjectId } from "mongodb";

export default class CheckoutModel {
  static collection() {
    return database.collection("checkouts");
  }

  static async getAllCheckouts(userId: string) {
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
              vendorId: { $toObjectId: "$product.vendorId" },
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

  static async createCheckout(
    checkoutData: PostCheckout & { quantity?: number },
    userId: string,
  ) {
    const productId = new ObjectId(checkoutData.productId);
    const userObjectId = new ObjectId(userId);
    const quantity = Math.max(1, Number(checkoutData.quantity) || 1);

    // Product yang sama di-add lagi -> tambah quantity, bukan baris dobel
    const result = await this.collection().updateOne(
      { productId, userId: userObjectId },
      {
        $inc: { quantity },
        $setOnInsert: { productId, userId: userObjectId, createdAt: new Date() },
      },
      { upsert: true },
    );

    return result.upsertedId
      ? "Checkout created with ID: " + result.upsertedId
      : "Checkout quantity updated";
  }

  static async deleteCheckoutByProductAndUserId(userId: string, productId: string){
    const res = await this.collection().deleteOne({userId: new ObjectId(userId), productId: new ObjectId(productId)})
    return res
  }
}
