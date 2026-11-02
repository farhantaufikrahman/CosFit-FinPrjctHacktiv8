import HeroSection from "@/components/home/HeroSection";
import PopularCharacters from "@/components/home/PopularCharacters";
import FeaturedCostumes from "@/components/home/FeaturedCostumes";
import UpcomingEvents from "@/components/home/UpcomingEvents";
import CommunityDiscussions from "@/components/home/CommunityDiscussions";
import CTASection from "@/components/home/CTASection";
import ProductModel from "@/db/models/productModel";
import OurEventModel from "@/db/models/ourEventModel";
import type { GetOurEvent, GetProduct } from "@/app/types";

// Data diambil saat request (bukan saat build), supaya produk/event baru langsung tampil
// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
export const dynamic = "force-dynamic";

// ObjectId/Date dari Mongo tidak bisa dikirim ke Client Component -> jadikan JSON biasa
const toPlain = <T,>(data: unknown): T => JSON.parse(JSON.stringify(data)) as T;

// Satu section gagal (mis. DB timeout) tidak boleh membuat seluruh halaman error
async function safe<T>(fn: () => Promise<unknown>): Promise<T[]> {
  try {
    return toPlain<T[]>(await fn());
  } catch (err) {
    console.error("[home] gagal memuat data:", err);
    return [];
  }
}

export default async function HomePage() {
  // Server Component boleh langsung memanggil model -> tidak perlu fetch ke API
  // sendiri lewat NEXT_PUBLIC_BASE_URL (yang sebelumnya dijalankan di level module
  // dengan top-level await di file "use client" dan membuat halaman crash).
  const [popular, featured, events] = await Promise.all([
    safe<GetProduct>(() => ProductModel.getPopularChar()),
    safe<GetProduct>(() => ProductModel.getFeaturedChar()),
    safe<GetOurEvent>(() => OurEventModel.getClosestEvents()),
  ]);

  return (
    <main className="flex flex-col bg-white">
      <HeroSection />
      <PopularCharacters characters={popular} />
      <FeaturedCostumes costumes={featured} />
      <UpcomingEvents events={events} />
      <CommunityDiscussions />
      <CTASection />
    </main>
  );
}
