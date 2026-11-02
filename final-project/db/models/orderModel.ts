import { ObjectId } from "mongodb";
import { database } from "../config/mongodb";

type OrderItem = {
  productId: ObjectId;
  price: number;
  quantity: number;
  name: string;
};

export default class OrderModel {
  static collection() {
    return database.collection("orders");
  }

  static async create(order: {
    orderId: string;
    items: OrderItem[];
    total: number;
    paymentStatus: string;
    userId: ObjectId;
  }) {
    return this.collection().insertOne({ ...order, createdAt: new Date() });
  }

  static async updatePaymentLink(orderId: string, payment: string) {
    return this.collection().updateOne({ orderId }, { $set: { payment } });
  }

  static async updateStatus(orderId: string, paymentStatus: string) {
    return this.collection().updateOne({ orderId }, { $set: { paymentStatus } });
  }

  /** Atomic: hanya berhasil satu kali untuk order yang belum Success. */
  static async markPaid(orderId: string) {
    const res = await this.collection().updateOne(
      { orderId, paymentStatus: { $ne: "Success" } },
      { $set: { paymentStatus: "Success", paidAt: new Date() } },
    );
    return res.modifiedCount === 1;
  }

  static async delete(orderId: string) {
    return this.collection().deleteOne({ orderId });
  }

  static async getByOrderId(orderId: string) {
    return this.collection().findOne({ orderId });
  }

  static async getByUserId(userId: string) {
    const agg = [
      { $match: { userId: new ObjectId(userId) } },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $lookup: {
          from: "vendors",
          localField: "product.vendorId",
          foreignField: "_id",
          as: "vendor",
        },
      },
      { $project: { "vendor.password": false, "vendor.role": false } },
    ];

    return this.collection().aggregate(agg).toArray();
  }
}
