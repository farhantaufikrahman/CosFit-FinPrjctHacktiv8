import { PostRoom } from "@/app/types";
import { database } from "../config/mongodb";
import { ObjectId, Document } from "mongodb"; 
import { put } from '@vercel/blob';
import { generateSlug } from "@/helpers/generateSlug";

export default class ForumModel {
  static collection() {
    return database.collection("forums");
  }

  static async getAllForums(sortQuery: string | null, pageQuery: string | null) {
    const limit = 5;
    const page = parseInt(pageQuery || "1", 10) || 1;
    const skip = (page - 1) * limit;

    let sortStage: Record<string, 1 | -1> = { createdAt: -1 };
    let matchStage: Record<string, any> | null = null;

    switch (sortQuery) {
      case "trending":
        sortStage = { chatCount: -1, createdAt: -1 };
        break;
      case "most_like":
        sortStage = { likeCount: -1, createdAt: -1 };
        break;
      case "unanswered":
        matchStage = { chatCount: 0 };
        sortStage = { createdAt: -1 };
        break;
      case "newest":
      default:
        sortStage = { createdAt: -1 };
        break;
    }

    const agg: Document[] = [
      {
        $lookup: {
          from: "users",
          localField: "creatorId",
          foreignField: "_id",
          as: "userTemp",
        },
      },
      {
        $lookup: {
          from: "chats",
          localField: "_id",
          foreignField: "roomId",
          as: "chat",
        },
      },
      {
        $lookup: {
          from: "profiles",
          localField: "creatorId",
          foreignField: "_id",
          as: "profileTemp",
        },
      },
      {
        $addFields: {
          creator: {
            $cond: {
              if: { $gt: [{ $size: "$userTemp" }, 0] },
              then: { $arrayElemAt: ["$userTemp", 0] },
              else: { $arrayElemAt: ["$profileTemp", 0] },
            },
          },
          // Field yang disimpan bernama `likes` (array), bukan `like`
          likeCount: {
            $size: { $ifNull: ["$likes", []] },
          },
          chatCount: {
            $size: {
              $ifNull: ["$chat", []],
            },
          },
        },
      },
      {
        $project: {
          userTemp: 0,
          profileTemp: 0,
          chat: 0,
          "creator.token": 0,
          "creator.password": 0,
          "creator.email": 0,
        },
      }
    ];

    if (matchStage) {
      agg.push({ $match: matchStage });
    }
    agg.push({ $sort: sortStage });
    agg.push({ $skip: skip });
    agg.push({ $limit: limit });

    const forums = await this.collection().aggregate(agg).toArray();
    return forums;
  }

  static async generateUniqueSlug(name: string) {
    const base = generateSlug(name) || "forum";
    const exists = await this.collection().findOne({ slug: base }, { projection: { _id: 1 } });
    return exists ? `${base}-${Date.now().toString(36)}` : base;
  }

  static async createForum(forumData: PostRoom & { slug: string }, UserId: string, img: File) {
    const blob = await put(img.name, img, {
      access: 'public',
      addRandomSuffix: true
    });

    const image = blob.url;

    const result = await this.collection().insertOne({
      ...forumData,
      creatorId: new ObjectId(UserId),
      image,
      createdAt: new Date(),
      likes: []
    });

    return "Forum created with ID: " + result.insertedId;
  }

  static async getForumById(id: string) {
    const forum = await this.collection().findOne({ _id: new ObjectId(id) });
    return forum;
  }

  static async getForumId(slug: string) {
    const agg: Document[] = [
      {
        $match: {
          slug: slug
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "creatorId",
          foreignField: "_id",
          as: "creator"
        }
      },
      {
        $project: {
          _id: 1,
          slug: 1,
          nameForum: 1,
          desc: 1,
          tag: 1,
          image: 1,
          createdAt: 1,
          creatorId: 1,
          likes: 1,
          likeCount: { $size: { $ifNull: ["$likes", []] } },
          creator: {
            $arrayElemAt: ["$creator", 0]
          }
        }
      },
      {
        $project: {
          "creator.password": 0,
          "creator.email": 0,
          "creator.token": 0
        }
      }
    ];

    const cursor = this.collection().aggregate(agg);
    const forums = await cursor.toArray();

    return forums[0];
  }

  static async patchForum(userId: string, slug: string) {
    const forum = await this.collection().findOne({ slug });

    if (!forum) {
      throw { message: "Forum not found", status: 404 };
    }

    const userObjectId = new ObjectId(userId);

    // BUG lama: mengecek `forum.like` padahal yang disimpan `likes`,
    // jadi isLiked selalu false -> tidak pernah bisa unlike.
    const likes: unknown[] = Array.isArray(forum.likes) ? forum.likes : [];
    const isLiked = likes.some((id) => String(id) === userId);

    const updated = await this.collection().findOneAndUpdate(
      { _id: forum._id },
      isLiked
        ? ({ $pull: { likes: userObjectId } } as Document)
        : { $addToSet: { likes: userObjectId } },
      { returnDocument: "after" },
    );

    const likesCount = Array.isArray(updated?.likes) ? updated.likes.length : 0;

    // ForumLikeButton membaca `isLiked` & `likesCount`
    return {
      message: isLiked ? "Unlike success" : "Like success",
      isLiked: !isLiked,
      likesCount,
    };
  }
}
