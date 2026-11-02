"use client";

import React, { useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import Swal from "sweetalert2";

interface ForumLikeButtonProps {
  slug: string;
  initialIsLiked: boolean;
  initialLikesCount: number;
}

export default function ForumLikeButton({
  slug,
  initialIsLiked,
  initialLikesCount,
}: ForumLikeButtonProps) {
  const [isLiked, setIsLiked] = useState<boolean>(initialIsLiked);
  const [likesCount, setLikesCount] = useState<number>(initialLikesCount);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleToggleLike = async () => {
    if (isLoading) return;

    // Simpan state lama untuk rollback jika request API gagal
    const previousIsLiked = isLiked;
    const previousLikesCount = likesCount;

    // Optimistic UI Update: Ubah tampilan seketika sebelum respons server
    const nextIsLiked = !isLiked;
    setIsLiked(nextIsLiked);
    setLikesCount((prev) => (nextIsLiked ? prev + 1 : prev - 1));

    try {
      setIsLoading(true);

      const response = await fetch(`/api/forum/${slug}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal memproses like");
      }

      // Sinkronisasi dengan data pasti dari database jika tersedia
      if (typeof data.isLiked !== "undefined") {
        setIsLiked(data.isLiked);
      }
      if (typeof data.likesCount !== "undefined") {
        setLikesCount(data.likesCount);
      }
    } catch (error: any) {
      // Rollback ke kondisi semula jika terjadi kesalahan
      setIsLiked(previousIsLiked);
      setLikesCount(previousLikesCount);

      Swal.fire({
        icon: "error",
        title: "Gagal Menyukai Postingan",
        text: error.message || "Terjadi kesalahan pada server.",
        confirmButtonColor: "#c2410c",
        timer: 2500,
        showConfirmButton: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleLike}
      disabled={isLoading}
      aria-label={isLiked ? "Unlike postingan" : "Like postingan"}
      className={`group flex items-center gap-2.5 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 cursor-pointer shadow-xs active:scale-95 disabled:cursor-not-allowed ${
        isLiked
          ? "bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 shadow-red-100"
          : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
      }`}
    >
      <div className="relative flex items-center justify-center">
        {isLoading ? (
          <Loader2 size={18} className="animate-spin text-gray-400" />
        ) : (
          <Heart
            size={18}
            className={`transition-transform duration-200 group-hover:scale-110 ${
              isLiked
                ? "fill-red-500 text-red-500 animate-pulse"
                : "fill-transparent text-gray-400 group-hover:text-gray-600"
            }`}
          />
        )}
      </div>
      <span>{likesCount}</span>
    </button>
  );
}