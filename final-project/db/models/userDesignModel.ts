import { PostUserDesign } from "@/app/types";
import { database } from "../config/mongodb";
import { ObjectId } from "mongodb";

export default class UserDesignModel {
  static collection() {
    return database.collection("userDesigns");
  }

  static async getAllUserDesigns() {
    const userDesigns = await this.collection().find().toArray();
    return userDesigns;
  }

  static async getByEventId(eventId: string) {
    return this.collection()
      .aggregate([
        { $match: { eventId: new ObjectId(eventId) } },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $addFields: { user: { $arrayElemAt: ["$user", 0] } } },
        {
          $project: {
            _id: 1,
            eventId: 1,
            entryTitle: 1,
            imgUrl: 1,
            vote: 1,
            userId: 1,
            username: { $ifNull: ["$user.username", "Unknown user"] },
          },
        },
      ])
      .toArray();
  }

  static async createUserDesign(
    userDesignData: PostUserDesign,
    userId: string,
  ) {
    const eventObjectId = new ObjectId(userDesignData.eventId);
    // Hanya field yang diizinkan — sebelumnya `...userDesignData` membuat client
    // bisa mengirim { vote: 9999 } saat submit entry.
    const result = await this.collection().insertOne({
      entryTitle: String(userDesignData.entryTitle),
      imgUrl: String(userDesignData.imgUrl),
      userId: new ObjectId(userId),
      eventId: eventObjectId,
      vote: 0,
      votedBy: [],
      createdAt: new Date(),
    });

    const entryPayload = {
      _id: result.insertedId,
      userId: new ObjectId(userId),
      entryTitle: userDesignData.entryTitle,
      entryImage: userDesignData.imgUrl,
      voteCount: 0,
    };

    const currentEvent = await database
      .collection("ourEvents")
      .findOne({ _id: eventObjectId });
    const existingEntries = Array.isArray(currentEvent?.entries)
      ? currentEvent.entries
      : [];

    await database
      .collection("ourEvents")
      .updateOne(
        { _id: eventObjectId },
        { $set: { entries: [...existingEntries, entryPayload] } },
      );

    return "User Design created with ID: " + result.insertedId;
  }

  static async hasUserEntry(eventId: string, userId: string) {
    return this.collection().findOne({
      eventId: new ObjectId(eventId),
      userId: new ObjectId(userId),
    });
  }

  static async voteUserDesign(id: string, userId: string, vote: number) {
    const entry = await this.collection().findOne({
      _id: new ObjectId(id),
    });

    if (!entry) {
      throw { message: "User Design not found", status: 404 };
    }

    if (entry.userId?.toString() === userId) {
      throw { message: "You cannot vote for your own entry", status: 403 };
    }

    const voterObjectId = new ObjectId(userId);
    const hasVoted = Array.isArray(entry.votedBy)
      ? entry.votedBy.some(
          (voter) => voter?.toString() === voterObjectId.toString(),
        )
      : false;

    if (hasVoted) {
      throw { message: "You can only vote once for this entry.", status: 409 };
    }

    // Filter `votedBy: { $ne }` membuat operasi atomic: 2 request paralel tidak
    // bisa sama-sama lolos cek hasVoted di atas.
    const result = await this.collection().updateOne(
      { _id: new ObjectId(id), votedBy: { $ne: voterObjectId } },
      {
        $inc: { vote: vote },
        $push: { votedBy: voterObjectId },
      },
    );

    if (result.matchedCount === 0) {
      throw { message: "You can only vote once for this entry.", status: 409 };
    }

    return (
      "User Design with ID: " + id + " has been voted. New vote count: " + vote
    );
  }
}
