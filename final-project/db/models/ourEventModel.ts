import type { EventEntry, GetOurEvent, PostOurEvent } from "@/app/types";
import { database } from "../config/mongodb";
import { ObjectId } from "mongodb";
import UserDesignModel from "./userDesignModel";

export default class OurEventModel {
  static collection() {
    return database.collection("ourEvents");
  }

  static slugify(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  static async getAllEvents() {
    const events = await this.collection().find().toArray();
    return Promise.all(events.map((event) => this.enrichWithEntries(event)));
  }

  static async createEvent(eventData: PostOurEvent) {
    const now = new Date().toISOString();
    const payload = {
      ...eventData,
      entries: Array.isArray(eventData.entries) ? eventData.entries : [],
      slug: eventData.slug || this.slugify(eventData.eventName || ""),
      createdAt: now,
      updatedAt: now,
    };
    const result = await this.collection().insertOne(payload);
    return result.insertedId;
  }

  static async getEventById(id: string) {
    const event = await this.collection().findOne({ _id: new ObjectId(id) });
    if (!event) return null;
    return this.enrichWithEntries(event);
  }

  static async getEventBySlug(slug: string) {
    const events = await this.collection().find().toArray();

    const event =
      events.find((item) => {
        const eventName =
          typeof item.eventName === "string" ? item.eventName : "";
        return (
          item.slug === slug ||
          (!item.slug && this.slugify(eventName) === slug) ||
          this.slugify(eventName) === slug
        );
      }) ?? null;

    if (!event) return null;
    return this.enrichWithEntries(event);
  }

  static async getClosestEvents() {
    const agg = [
  {
    '$match': {
      '$expr': {
        '$gt': [
          {
            '$convert': { input: '$startDate', to: 'date', onError: null, onNull: null }
          }, '$$NOW'
        ]
      }
    }
  }, {
    '$sort': {
      'startDate': 1
    }
  }, {
    '$limit': 4
  }
];
    const data = await this.collection().aggregate(agg).toArray();
    return data;
  }

  static async updateEvent(id: string, updateData: Partial<PostOurEvent>) {
    const now = new Date().toISOString();
    const result = await this.collection().updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: now } },
    );
    return result.modifiedCount > 0;
  }

  private static async enrichWithEntries(event: Record<string, unknown>) {
    const eventId = String(event._id);
    const designs = await UserDesignModel.getByEventId(eventId);

    const mappedEntries: EventEntry[] = designs.map(
      (item: Record<string, unknown>) => ({
        _id: String(item._id),
        userId: item.userId ? String(item.userId) : "",
        username:
          typeof item.username === "string" ? item.username : "Unknown user",
        entryTitle:
          typeof item.entryTitle === "string"
            ? item.entryTitle
            : "Untitled entry",
        entryImage:
          typeof item.imgUrl === "string"
            ? item.imgUrl
            : typeof item.entryImage === "string"
              ? item.entryImage
              : "",
        voteCount: Number(item.vote ?? item.voteCount ?? 0),
      }),
    );

    return {
      ...event,
      entries: mappedEntries,
    } as GetOurEvent;
  }

  static async deleteEvent(id: string) {
    const result = await this.collection().deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }
}
