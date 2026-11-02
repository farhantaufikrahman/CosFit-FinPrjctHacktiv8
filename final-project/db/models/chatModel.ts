import { ObjectId } from "mongodb";
import { database } from "../config/mongodb";
import UserModel from "./userModel";
import VendorModel from "./vendorModel";

// Field sensitif yang tidak boleh ikut terkirim ke client
const HIDDEN_USER_FIELDS = {
  "user.password": false,
  "user.email": false,
  "user.token": false,
  "user.claimedAt": false,
  "user.updatedAt": false,
  // BUG lama: lookup `vendor` tidak diproyeksikan -> hash password vendor bocor
  "vendor.password": false,
  "vendor.email": false,
  "vendor.alamat": false,
  "vendor.norek": false,
};

export default class ChatModel {
  static collection() {
    return database.collection("chats");
  }

  static async getChatRoomId(roomId: string, userId: string | null) {
    const chat = await this.collection()
      .aggregate([
        { $match: { roomId: new ObjectId(roomId) } },
        { $sort: { createdAt: 1 } },
        {
          $lookup: { from: "vendors", localField: "userId", foreignField: "_id", as: "vendor" },
        },
        {
          $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" },
        },
        { $project: HIDDEN_USER_FIELDS },
      ])
      .toArray();

    // BUG lama: `new ObjectId(null)` membuat id acak, dan fungsi bisa return
    // undefined -> Response.json(undefined). Pengunjung tanpa login tetap dapat chat.
    if (!userId) {
      return { message: chat, username: null, image: null, status: 200 };
    }

    const viewerId = new ObjectId(userId);
    const [userDetail, vendorDetail] = await Promise.all([
      UserModel.collection().findOne({ _id: viewerId }),
      VendorModel.collection().findOne({ _id: viewerId }),
    ]);

    if (userDetail) {
      return {
        message: chat,
        username: userDetail.username,
        // user disimpan dengan `UserImg`, vendor dengan `userImg`
        image: userDetail.UserImg ?? userDetail.userImg ?? null,
        status: 200,
      };
    }

    return {
      message: chat,
      username: vendorDetail?.namaToko ?? null,
      image: vendorDetail?.userImg ?? null,
      status: 200,
    };
  }

  static async postChat(roomId: string, userId: string, content: string) {
    const newChat = {
      roomId: new ObjectId(roomId),
      userId: new ObjectId(userId),
      content,
      createdAt: new Date(),
    };
    const insertResult = await this.collection().insertOne(newChat);

    const result = await this.collection()
      .aggregate([
        { $match: { _id: insertResult.insertedId } },
        {
          $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" },
        },
        {
          $lookup: { from: "vendors", localField: "userId", foreignField: "_id", as: "vendor" },
        },
        { $project: HIDDEN_USER_FIELDS },
      ])
      .toArray();

    return result[0];
  }
}
