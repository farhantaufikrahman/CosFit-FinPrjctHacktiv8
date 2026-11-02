"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MessageCircle, Flame, AlertCircle } from "lucide-react";

interface creatorType {
  _id: string;
  username: string;
}

export interface forumType {
  _id: string;
  slug: string;
  nameForum: string;
  desc: string;
  tag: string[];
  creatorId: string;
  image: string;
  createdAt: Date;
  chat?: string[];
  chatCount?: number;
  creator?: creatorType;
}

export default function TrendingPosts() {
  const [posts, setPosts] = useState<forumType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTrendingPosts = async () => {
      try {
        setIsLoading(true);
        setError("");
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/forum?sort=trending&page=1`);
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
    <section className="rounded-2xl border border-white/80 bg-white/70 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
      <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-[#be2727]">
            <Flame size={18} className="fill-[#be2727]/20" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 tracking-tight">Trending Forum</h3>
        </div>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="h-6 w-6 animate-spin rounded-full border-3 border-[#be2727] border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center rounded-xl bg-red-50/80 p-4 text-center text-red-600 border border-red-100">
            <AlertCircle size={24} className="mb-1" />
            <p className="text-xs font-medium">{error}</p>
          </div>
        ) : posts.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">No trending posts yet.</p>
        ) : (
          posts.map((post, index) => {
            const commentsCount = post.chatCount ?? post.chat?.length ?? 0;

            return (
              <Link
                href={`/forum/${post.slug}`}
                key={post._id}
                className="group flex w-full items-center gap-3.5 rounded-xl p-2.5 text-left transition-all duration-200 hover:bg-white hover:shadow-md hover:-translate-y-0.5 border border-transparent hover:border-gray-100"
              >
                {/* Ranking Number */}
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#be2727]/10 text-xs font-extrabold text-[#be2727] group-hover:bg-[#be2727] group-hover:text-white transition-colors">
                  {index + 1}
                </div>

                {/* Author Avatar */}
                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-gray-100 shadow-sm">
                  <Image
                    src={post.image || "/default-avatar.png"}
                    alt={`${post.creator?.username || "Anonymous"}'s avatar`}
                    fill
                    sizes="44px"
                    className="object-cover"
                  />
                </div>

                {/* Post Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-gray-800 line-clamp-1 group-hover:text-[#be2727] transition-colors">
                    {post.nameForum}
                  </h4>
                  <p className="mt-0.5 text-xs text-gray-400 font-medium truncate">
                    by {post.creator?.username || "Anonymous"}
                  </p>
                </div>

                {/* Chat Count */}
                <div className="flex shrink-0 items-center gap-1 text-xs font-semibold text-gray-400 bg-gray-50 px-2 py-1 rounded-md group-hover:bg-[#be2727]/5 group-hover:text-[#be2727] transition-colors">
                  <MessageCircle size={13} />
                  <span>{commentsCount}</span>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </section>
  );
}