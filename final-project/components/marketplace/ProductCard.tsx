"use client";

import Link from "next/link";
import { Heart, ArrowRight } from "lucide-react";
import type { GetProduct, GetWishlist } from "@/app/types";
import { useEffect, useState } from "react";

export interface ProductCardProps {
  product: GetProduct;
  isFavorited?: boolean;
  currency?: string;
  detailsLabel?: string;
  onToggleFavorite?: (productId: string) => void;
}

export function formatProductPrice(amount: number, currency: string) {
  if (!amount) return "$0";
  try {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `$${amount}`;
  }
}

export default function ProductCard({
  product,
  currency = "IDR",
  detailsLabel = "View Details",
  onToggleFavorite,
}: ProductCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const hasDiscount = Boolean(product.discount && product.discount > 0);

  useEffect(() => {
    const fetchWishlistStatus = async () => {
      try {
        const response = await fetch(`/api/user/wishlist`);
        if (response.ok) {
          const wishlist = await response.json();

          if (Array.isArray(wishlist)) {
            const isExist = wishlist.some((item: GetWishlist) => {
              const targetId =
                typeof item.productId === "object" && item.productId !== null
                  ? item.product._id
                  : item.productId;

              return String(targetId) === String(product._id);
            });

            setIsFavorited(isExist);
          }
        }
      } catch (error) {
        console.error("Gagal mengecek status wishlist:", error);
      }
    };

    if (product?._id) {
      fetchWishlistStatus();
    }
  }, [product?._id]);

  const handleToggleFavorite = async () => {
    if (isLoading) return;

    const previousState = isFavorited;

    // Optimistic Update UI
    setIsFavorited(!isFavorited);
    setIsLoading(true);

    try {
      if (!previousState) {
        const response = await fetch(`/api/user/wishlist`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product._id }),
        });

        if (!response.ok) throw new Error("Gagal menambah wishlist");
      } else {
        const response = await fetch(`/api/user/wishlist/${product._id}`, {
          method: "DELETE",
        });

        if (!response.ok) throw new Error("Gagal menghapus wishlist");
      }

      onToggleFavorite?.(product._id);
    } catch (error) {
      console.error(error);
      setIsFavorited(previousState);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface transition hover:shadow-md">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-cream/30">
        <Link
          href={`/marketplace/products/${product.slug}`}
          className="block h-full w-full"
        >
          {product.imgUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imgUrl}
              alt={product.title || "Product"}
              className="h-full w-full object-cover transition group-hover:scale-105 object-top"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-muted">
              Product image
            </div>
          )}
        </Link>
        <button
          type="button"
          aria-label="Toggle favorite"
          onClick={handleToggleFavorite}
          disabled={isLoading}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-surface shadow-sm transition hover:bg-cream/40"
        >
          <Heart
            className={`h-5 w-5 ${isFavorited ? "fill-primary text-primary" : "text-muted"}`}
          />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6">
        <div>
          <p className="line-clamp-1 text-lg font-semibold text-foreground">
            {product.title || "Product Title"}
          </p>
          <p className="mt-0.5 line-clamp-1 text-sm text-muted">
            {product.theme || "Series"}
          </p>
        </div>
        <div className="flex flex-col">
          {hasDiscount ? (
            <>
            <div className="flex items-center">
              <span className="rounded-md bg-red-100 px-2.5 py-1 text-sm font-bold text-red-600">
                Hemat {product.discount}%
              </span>
              <span className="text-xs font-medium text-muted line-through opacity-75">
                {formatProductPrice(Number(product.originalPrice), currency)}
              </span>
            </div>
              <p className="text-2xl font-bold text-primary">
                {formatProductPrice(
                  Number(product.finalPrice || product.originalPrice),
                  currency,
                )}
              </p>
            </>
          ) : (
            <p className="text-2xl font-bold text-primary">
              {formatProductPrice(Number(product.originalPrice), currency)}
            </p>
          )}
        </div>

        <Link
          href={`/marketplace/products/${product.slug}`}
          className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl border border-primary px-5 py-3 text-sm font-medium text-primary transition hover:bg-cream/40"
        >
          {detailsLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
