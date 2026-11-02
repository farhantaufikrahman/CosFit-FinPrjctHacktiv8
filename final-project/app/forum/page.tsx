"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Plus, AlertCircle } from "lucide-react";

import DiscussionFilter from "@/components/forum/DiscussionFilter";
import DiscussionCard from "@/components/forum/DiscussionCard";
import TrendingPosts from "@/components/forum/TrendingPosts";
import PopularTags from "@/components/forum/PopularTags";

interface creatorType {
  _id: string;
  username: string;
}

interface forumType {
  _id: string;
  slug: string;
  nameForum: string;
  desc: string;
  tag: string[] | string;
  creatorId: string;
  image: string;
  chatCount: number;
  likeCount: number;
  likes: string[];
  createdAt: string;
  creator: creatorType;
}

function getTimeAgo(dateString: string) {
  if (!dateString) return "Baru saja";
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now.getTime() - past.getTime();

  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "Baru saja";
  if (diffMins < 60) return `${diffMins} min lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays < 7) return `${diffDays} hari lalu`;

  return past.toLocaleDateString("id-ID", { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function ForumPage() {
  const [data, setData] = useState<forumType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [allForums, setAllForums] = useState<forumType[]>([]);
  const [isTagsLoading, setIsTagsLoading] = useState(true);

  const [activeFilter, setActiveFilter] = useState("newest"); 
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5; 

  const currentUserId = "6a5a03af171de2d91bb21a79"; 

  const handleFilterChange = (newFilter: string) => {
    setActiveFilter(newFilter);
    setCurrentPage(1);
  };

  useEffect(() => {
    const fetchAllDataForTags = async () => {
      try {
        setIsTagsLoading(true);
        const res = await fetch(`/api/forum`);
        if (!res.ok) throw new Error("Gagal mengambil data tags.");
        
        const dataJson = await res.json();
        setAllForums(Array.isArray(dataJson) ? dataJson : (dataJson.data || []));
      } catch (err) {
        console.error("Error mengambil tags:", err);
      } finally {
        setIsTagsLoading(false);
      }
    };

    fetchAllDataForTags();
  }, []);

  useEffect(() => {
    const fetchPaginatedData = async () => {
      try {
        setIsLoading(true);
        setError("");
        
        const res = await fetch(`/api/forum?sort=${activeFilter}&page=${currentPage}&limit=${ITEMS_PER_PAGE}`);
        if (!res.ok) throw new Error("Gagal mengambil data diskusi.");
        
        const dataJson = await res.json();
        const fetchedArray = Array.isArray(dataJson) ? dataJson : (dataJson.data || []);
        setData(fetchedArray);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan yang tidak terduga");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaginatedData();
  }, [activeFilter, currentPage]);

  const popularTags = useMemo(() => {
    const tagCounts: Record<string, number> = {};
    const colors = ["#D64C4C", "#E87C7C", "#F4A261", "#E76F51", "#8B5CF6", "#06B6D4"];

    allForums.forEach(forum => {
      let tagsArray: string[] = [];
      if (Array.isArray(forum.tag)) tagsArray = forum.tag;
      else if (typeof forum.tag === "string") tagsArray = [forum.tag];

      tagsArray.forEach(t => {
        if (t) {
          tagCounts[t] = (tagCounts[t] || 0) + 1;
        }
      });
    });

    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count], index) => ({
        name,
        posts: count,
        color: colors[index % colors.length]
      }));
  }, [allForums]);

  const handleLike = async (e: React.MouseEvent, slug: string, isCurrentlyLiked: boolean) => {
    e.preventDefault(); 

    if (!currentUserId) {
      alert("Silakan login terlebih dahulu untuk menyukai diskusi ini.");
      return;
    }

    setData((prevData) =>
      prevData.map((forum) => {
        if (forum.slug === slug) {
          const currentLikesArray = forum.likes || [];
          let newLikes;
          let newCount = forum.likeCount || 0;

          if (isCurrentlyLiked) {
            newLikes = currentLikesArray.filter((id) => id !== currentUserId);
            newCount = Math.max(0, newCount - 1); 
          } else {
            newLikes = [...currentLikesArray, currentUserId];
            newCount += 1; 
          }

          return { ...forum, likes: newLikes, likeCount: newCount };
        }
        return forum;
      })
    );

    try {
      const res = await fetch(`/api/forum/${slug}`, {
        method: "PATCH",
        headers: {
          "x-user-id": currentUserId,
        },
      });

      if (!res.ok) throw new Error("Gagal melakukan aksi like/unlike");
    } catch (error) {
      console.error(error);
    }
  };

  const isLastPage = data.length < ITEMS_PER_PAGE;

  return (
    <main className="relative min-h-screen bg-[#FDFBF7] text-gray-800 selection:bg-[#be2727]/10 selection:text-[#be2727] overflow-hidden">
      {/* Pola Latar Belakang Geometris */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-40 z-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at 10% 90%, rgba(190, 39, 39, 0.05) 0%, transparent 40%),
            radial-gradient(circle at 90% 10%, rgba(244, 162, 97, 0.05) 0%, transparent 40%),
            linear-gradient(to right, rgba(0, 0, 0, 0.015) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.015) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 100% 100%, 48px 48px, 48px 48px'
        }}
      />

      <div className="relative z-10 container mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-10">
        {/* Header Section */}
        <div className="mb-10 flex flex-col items-start justify-between gap-5 md:flex-row md:items-end border-b border-gray-200/60 pb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Forum
            </h1>
            <p className="mt-2 text-base text-gray-600 font-normal">
              Temukan jawaban, bagikan ilmu, dan terhubung dengan komunitas.
            </p>
          </div>
          <Link 
            href="/forum/new" 
            className="group flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-[#be2727] to-[#d33333] px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_14px_0_rgba(190,39,39,0.39)] transition-all duration-300 hover:shadow-[0_6px_20px_rgba(190,39,39,0.5)] hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus size={18} className="transition-transform duration-300 group-hover:rotate-90" />
            <span>Create New Forum</span>
          </Link>
        </div>

        {/* Layout 2 Kolom: Kiri (Main Discussion Feed), Kanan (Floating Widgets) */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_360px]">
          
          {/* KOLOM KIRI: Filter & Feed Diskusi (Ditarik lebih panjang/lebar ke kiri) */}
          <section className="min-w-0 w-full">
            <DiscussionFilter 
              currentFilter={activeFilter} 
              onFilterChange={handleFilterChange} 
            />

            <div className="mt-6 space-y-5">
              {isLoading ? (
                <div className="flex h-56 flex-col items-center justify-center rounded-2xl border border-white/60 bg-white/60 backdrop-blur-md shadow-sm">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#be2727] border-t-transparent mb-3"></div>
                  <p className="text-sm font-medium text-gray-500 animate-pulse">Memuat diskusi...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-red-200/80 bg-red-50/80 backdrop-blur-md p-10 text-center text-red-600 shadow-sm">
                  <AlertCircle size={36} className="text-red-500" />
                  <p className="font-medium">{error}</p>
                </div>
              ) : data.length === 0 ? (
                <div className="flex h-56 flex-col items-center justify-center rounded-2xl border border-white/60 bg-white/60 backdrop-blur-md p-8 text-center shadow-sm">
                  <p className="text-base font-medium text-gray-600">Belum ada diskusi yang ditemukan.</p>
                  <p className="text-sm text-gray-400 mt-1">Jadilah yang pertama untuk membuat topik baru!</p>
                </div>
              ) : (
                <>
                  {data.map((item) => {
                    const isLiked = Array.isArray(item.likes) 
                      ? item.likes.includes(currentUserId) 
                      : false;

                    return (
                      <Link key={item._id} href={`/forum/${item.slug}`} className="block focus:outline-none">
                        <DiscussionCard
                          avatar={item.image || "/default-avatar.png"} 
                          author={item.creator?.username || "Anonymous"} 
                          verified={false}
                          time={getTimeAgo(item.createdAt)} 
                          title={item.nameForum}
                          description={item.desc}
                          tag={Array.isArray(item.tag) && item.tag.length > 0 ? item.tag : typeof item.tag === 'string' ? [item.tag] : ["General"]}
                          tagColor="#be2727"
                          comments={item.chatCount || 0} 
                          likes={item.likeCount || item.likes?.length || 0} 
                          isLiked={isLiked}
                          onLike={(e) => handleLike(e, item.slug, isLiked)}
                          views={0}   
                          pinned={false} 
                        />
                      </Link>
                    );
                  })}

                  {/* ==================================================== */}
                  {/* PAGINATION PREMIUM                                   */}
                  {/* ==================================================== */}
                  <div className="mt-10 flex items-center justify-between rounded-2xl border border-white/80 bg-white/70 backdrop-blur-md px-6 py-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => p - 1)}
                      className="flex items-center gap-2 rounded-xl border border-gray-200/80 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all duration-200 hover:border-[#be2727] hover:bg-[#be2727]/5 hover:text-[#be2727] active:scale-95 disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none"
                    >
                      <span>← Previous</span>
                    </button>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Page</span>
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#be2727] text-sm font-bold text-white shadow-md shadow-[#be2727]/30">
                        {currentPage}
                      </span>
                    </div>

                    <button
                      disabled={isLastPage}
                      onClick={() => setCurrentPage(p => p + 1)}
                      className="flex items-center gap-2 rounded-xl border border-gray-200/80 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all duration-200 hover:border-[#be2727] hover:bg-[#be2727]/5 hover:text-[#be2727] active:scale-95 disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none"
                    >
                      <span>Next →</span>
                    </button>
                  </div>
                  {/* ==================================================== */}

                </>
              )}
            </div>
          </section>

          {/* KOLOM KANAN: Trending Forum & Popular Tags (Floating/Sticky) */}
          <aside className="hidden lg:block sticky top-8 space-y-6">
            <TrendingPosts />
            <PopularTags tags={popularTags} isLoading={isTagsLoading} />
          </aside>

        </div>
      </div>
    </main>
  );
}