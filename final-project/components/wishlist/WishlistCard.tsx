"use client";

import Image from "next/image";
import {
  ShoppingBag,
  Sparkles,
  Trash2,
  CircleCheck,
  CircleHelp,
} from "lucide-react";
import WishlistButton from "./WishlistButton";
import { useRouter } from "next/navigation";
import Link from "next/link";

type WishlistCardProps = {
  image: string;
  character: string;
  series: string | string[];
  vendor: string;
  vendorAvatar: string;
  price: number;
  duration?: string;
  // sizeMatch: "good" | "possible" | "unknown";
  isWishlisted: boolean;
  onWishlist?: () => void;
  onTryOn?: () => void;
  onCheckout?: () => void;
  wishlistId: string;
  productId: string;
  productSlug: string;
  onRemoved?: () => Promise<void>;
};

export default function WishlistCard({
  image,
  character,
  series,
  vendor,
  price,
  duration,
  // sizeMatch,
  isWishlisted,
  onWishlist,
  onTryOn,
  wishlistId,
  productId,
  productSlug,
  onRemoved,
}: WishlistCardProps) {
  const router = useRouter();
  const seriesLabel = Array.isArray(series) ? series.join(", ") : series;

  async function handleRemove() {
    const res = await fetch(`/api/user/wishlist/${wishlistId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      console.error(await res.text());
      return;
    }

    await onRemoved?.();

    router.refresh()
  }

  async function handleCheckout() {
    await fetch(`/api/user/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId,
        status: "pending",
      }),
    });

    router.push("/checkout");
  }

  return (
    <div
      onClick={() => router.push(`/marketplace/products/${productSlug}`)}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
    >
      {/* IMAGE */}

      <div className="relative aspect-4/5 w-full overflow-hidden bg-[#faf6f2]">
        <Image
          src={image}
          alt={character}
          fill
          className="object-cover transition duration-500 group-hover:scale-105 object-top"
        />

        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-3 top-3"
        >
          <WishlistButton isWishlisted={isWishlisted} onClick={onWishlist} />
        </div>

        {/* <div className="absolute bottom-3 left-3">
          {sizeMatch === "good" && (
            <div className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
              <CircleCheck size={14} />
              Good Size Match
            </div>
          )}

          {sizeMatch === "possible" && (
            <div className="rounded-full bg-yellow-100 px-3 py-1 text-xs text-yellow-700">
              Possible Match
            </div>
          )}

          {sizeMatch === "unknown" && (
            <div className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs">
              <CircleHelp size={14} />
              Unknown
            </div>
          )}
        </div> */}
      </div>

      {/* CONTENT */}

      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="line-clamp-1 text-base font-semibold text-[#4D565C]">
              {character}
            </h3>

            <p className="mt-0.5 line-clamp-1 text-sm text-gray-500">
              {seriesLabel || "Series"}
            </p>
          </div>
        </div>

        {/* Vendor */}
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="line-clamp-1 text-sm ">{vendor}</p>
          </div>

          <div className="flex shrink-0 items-center gap-1 text-right">
            <p className="text-base font-semibold text-primary">
              Rp {price.toLocaleString("id-ID")}
            </p>

            <p className="text-xs text-muted">/ {duration}</p>
          </div>
        </div>

        {/* Buttons */}

        <div className="mt-auto grid grid-cols-2 gap-2.5">
          <Link
            href={`/try-on?productId=${productSlug}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-2 rounded-xl border border-[#B14744] py-2 text-sm font-medium text-[#B14744] transition hover:bg-[#FFF3EF]"
          >
            <Sparkles size={15} />
            Try On
          </Link>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCheckout();
            }}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#B14744] py-2 text-sm font-medium text-white transition hover:bg-[#9A3B39]"
          >
            {/* <ShoppingBag size={15} /> */}
            Checkout
          </button>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleRemove();
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 py-2 text-sm text-red-500 transition hover:bg-red-50"
        >
          <Trash2 size={14} />
          Remove
        </button>
      </div>
    </div>
  );
}
