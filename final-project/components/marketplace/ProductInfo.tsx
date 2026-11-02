"use client";

import Link from "next/link";
import { Heart, Sparkles, ChevronRight, Minus, Plus } from "lucide-react";
import type { GetProduct, GetWishlist } from "@/app/types";
import { formatProductPrice } from "./ProductCard";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export interface ProductInfoProps {
  product: GetProduct;
  isFavorited?: boolean;
  currency?: string;
  tryOnLabel?: string;
  checkoutLabel?: string;
  onToggleFavorite?: (productId: string) => void;
}

export default function ProductInfo({
  product,
  currency = "IDR",
  tryOnLabel = "Try On With AI",
  checkoutLabel = "Buy Now",
  onToggleFavorite,
}: ProductInfoProps) {
  const router = useRouter();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const maxStock = Number(product.stock) || 0;

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

  const handleIncrease = () => {
    if (quantity < maxStock) {
      setQuantity((prev) => prev + 1);
    }
  };
  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleBuyNow = async () => {
    if (isAddingToCart) return;
    setIsAddingToCart(true);

    try {
      const response = await fetch(`/api/user/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product._id, quantity: 1 }),
      });

      if (response.ok) {
        router.push("/checkout");
      } else {
        console.error("Gagal menambahkan ke keranjang");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsAddingToCart(false);
    }
  };
  const handleTryOn = () => {
    router.push(`/try-on?productId=${product._id}`);
  };

  return (
    <div className="flex flex-col gap-7">
      {/* Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-1.5 text-sm text-muted">
        <Link href="/marketplace" className="hover:text-primary">
          Marketplace
        </Link>
        {product.theme && (
          <>
            <ChevronRight className="h-4 w-4" />
            <span>{product.theme}</span>
          </>
        )}
        <ChevronRight className="h-4 w-4" />
        <span className="line-clamp-1 text-foreground">
          {product.title || "Product Title"}
        </span>
      </nav>

      <div>
        <p className="text-base font-medium text-muted">
          {product.theme || "Series"}
        </p>
        <h1 className="mt-2 font-serif text-4xl font-bold leading-tight text-foreground sm:text-5xl">
          {product.title || "Product Title"}
        </h1>
      </div>

      <div className="flex flex-col gap-1">
        {product.discount && product.discount > 0 ? (
          <>
            <div className="flex items-center gap-3">
              <p className="text-lg font-medium text-muted line-through opacity-70">
                {formatProductPrice(Number(product.originalPrice), currency)}
              </p>
              <span className="rounded-md bg-red-100 px-2.5 py-1 text-sm font-bold text-red-600">
                Hemat {product.discount}%
              </span>
            </div>
            <p className="text-4xl font-bold text-primary">
              {formatProductPrice(Number(product.finalPrice), currency)}
            </p>
          </>
        ) : (
          <p className="text-4xl font-bold text-primary">
            {formatProductPrice(Number(product.originalPrice), currency)}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {product.size && (
          <span className="rounded-full bg-cream/40 px-4 py-2 text-sm font-medium text-primary">
            Size: {product.size}
          </span>
        )}
        <span
          className={`rounded-full px-4 py-2 text-sm font-medium ${
            maxStock > 0
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {maxStock > 0 ? `Stok: ${maxStock}` : "Stok Habis"}
        </span>
      </div>

      {/* Counter Jumlah Pembelian */}
      {maxStock > 0 && (
        <div className="flex items-center gap-4">
          <p className="text-base font-semibold text-foreground">Jumlah</p>
          <div className="flex items-center rounded-xl border border-border">
            <button
              type="button"
              onClick={handleDecrease}
              disabled={quantity <= 1}
              className="flex h-11 w-11 items-center justify-center text-foreground transition hover:bg-cream/40 disabled:opacity-40 disabled:hover:bg-transparent"
              aria-label="Kurangi jumlah"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-12 text-center text-base font-semibold text-foreground">
              {quantity}
            </span>
            <button
              type="button"
              onClick={handleIncrease}
              disabled={quantity >= maxStock}
              className="flex h-11 w-11 items-center justify-center text-foreground transition hover:bg-cream/40 disabled:opacity-40 disabled:hover:bg-transparent"
              aria-label="Tambah jumlah"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Deskripsi */}
      <div>
        <p className="text-base font-semibold text-foreground">
          Description
        </p>

        {product.desc ? (
          <div
            className="prose prose-neutral dark:prose-invert mt-3 max-w-none text-muted"
            dangerouslySetInnerHTML={{ __html: product.desc }}
          />
        ) : (
          <p className="mt-3 text-base leading-relaxed text-muted">
            No description available for this product yet.
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={isAddingToCart || maxStock === 0}
          className="flex-1 rounded-xl bg-primary px-6 py-4 text-base font-medium text-white transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {maxStock === 0
            ? "Out of Stock"
            : isAddingToCart
              ? "Processing..."
              : checkoutLabel}
        </button>
        <Link href={`/try-on?productId=${product.slug}`}>
        <button
          type="button"
          onClick={handleTryOn}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-primary px-6 py-4 text-base font-medium text-primary transition hover:bg-cream/40"
          >
          <Sparkles className="h-5 w-5" />
          {tryOnLabel}
        </button>
          </Link>

        <button
          type="button"
          aria-label="Toggle favorite"
          onClick={handleToggleFavorite}
          disabled={isLoading}
          className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl border border-border transition hover:bg-cream/40 ${
            isLoading ? "cursor-not-allowed opacity-70" : ""
          }`}
        >
          <Heart
            className={`h-6 w-6 transition-colors ${
              isFavorited ? "fill-primary text-primary" : "text-muted"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
