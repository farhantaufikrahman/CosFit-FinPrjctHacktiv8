"use client";

import { Sparkles, MessagesSquare, ArrowRight, Flame } from "lucide-react";
import type { GetRoom } from "@/app/types";
import { useEffect, useState } from "react";
import { forumType } from "../forum/TrendingPosts";
import Link from "next/link";

export interface CommunityDiscussionsProps {
  title?: string;
  viewAllLabel?: string;
  rooms?: GetRoom[];
  joinLabel?: string;
}

function RoomCard({
  room,
  joinLabel,
}: {
  room: forumType;
  joinLabel: string;
}) {
  const tagLabel = room.tag;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="aspect-video w-full overflow-hidden bg-cream/30">
        {room.image ? (
          <img
            src={room.image}
            alt={room.nameForum || "Forum room"}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-base text-muted">
            Room image
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        {tagLabel ? (
          <p className="text-sm font-semibold uppercase tracking-wide text-muted">
            {tagLabel}
          </p>
        ) : null}
        <p className="flex items-center gap-2 text-xl font-semibold text-foreground">
          <MessagesSquare className="h-5 w-5 text-accent" />
          {room.nameForum || "Forum Room Name"}
        </p>
        <p className="line-clamp-2 text-base text-muted">
          {room.desc || "Short description of what this room is about."}
        </p>
        <div className="mt-auto pt-4">
          <Link href={`/forum/${room.slug}`}>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary px-4 py-2.5 text-base font-medium text-primary transition hover:bg-cream/40"
            >
              {joinLabel}
              <ArrowRight className="h-5 w-5" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CommunityDiscussions({
  title = "Trending Forum",
  viewAllLabel = "Visit Forum",
  joinLabel = "Go to Room",
}: CommunityDiscussionsProps) {

const [posts, setPosts] = useState<forumType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTrendingPosts = async () => {
      try {
        setIsLoading(true);
        setError("");
        const res = await fetch(`/api/forum?sort=trending&page=1`);
        if (!res.ok) throw new Error("Failed to fetch trending.");

        const dataJson = await res.json();

        if (Array.isArray(dataJson)) {
          setPosts(dataJson.slice(0, 5));
        } else if (dataJson && Array.isArray(dataJson.data)) {
          setPosts(dataJson.data.slice(0, 5));
        } else {
          setPosts([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading trending");
        console.error("Gagal mengambil data trending:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrendingPosts();
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-serif text-3xl font-semibold text-foreground">
          {title}
          <Flame className="h-5 w-5 text-accent" />
        </h2>
        <Link href={`/forum`}>
        <button
          type="button"
          className="text-base font-medium text-primary hover:text-secondary hover:underline"
          >
          {viewAllLabel} &rarr;
        </button>
          </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
  {posts.slice(0, 4).map((room) => (
    <RoomCard
      key={room._id}
      room={room}
      joinLabel={joinLabel}
    />
  ))}
</div>
    </section>
  );
}
