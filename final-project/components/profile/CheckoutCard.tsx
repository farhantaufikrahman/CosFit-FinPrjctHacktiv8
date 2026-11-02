"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, CircleCheckBig, Clock3, XCircle } from "lucide-react";
import { GetOrder } from "@/app/types";

type Props = {
  order: GetOrder;
};

export default function CheckoutCard({ order }: Props) {
  const firstProduct = order.product[0];

  const badge =
    order.paymentStatus === "Success"
      ? "bg-green-100 text-green-700"
      : order.paymentStatus === "Pending"
        ? "bg-orange-100 text-orange-700"
        : "bg-red-100 text-red-700";

  const StatusIcon =
    order.paymentStatus === "Success"
      ? CircleCheckBig
      : order.paymentStatus === "Pending"
        ? Clock3
        : XCircle;

  return (
    <Link
      href={`/checkout/${order.orderId}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      {/* Cover */}
      <div className="relative aspect-[4/5] overflow-hidden bg-[#faf6f2]">
        <Image
          src={firstProduct?.imgUrl ?? "/placeholder.png"}
          alt={firstProduct?.title ?? "Product"}
          fill
          className="object-cover object-top transition duration-500 group-hover:scale-105"
        />

        <span
          className={`absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium backdrop-blur-md ${badge}`}
        >
          <StatusIcon size={14} />
          {order.paymentStatus}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        {/* Order */}
        <div>
          <h3 className="line-clamp-1 text-base font-semibold text-[#4D565C]">
            Order #{order.orderId.slice(0, 8)}
          </h3>

          <p className="mt-1 text-sm text-muted">
            {order.vendor?.[0]?.namaToko ?? "CosFit Vendor"}
          </p>
        </div>

        {/* Products */}
        <div className="space-y-2">
          {order.items.slice(0, 2).map((item) => {
            const product = order.product.find(
              (p) => String(p._id) === String(item.productId),
            );

            if (!product) return null;

            return (
              <div
                key={item.productId}
                className="flex items-start justify-between gap-3 text-sm"
              >
                <div className="min-w-0">
                  <p className="line-clamp-1 font-medium text-[#4D565C]">
                    {product.title}
                  </p>

                  <p className="line-clamp-1 text-xs text-muted">
                    {product.theme.join(", ")}
                  </p>
                </div>

                <span className="shrink-0 rounded-full bg-[#f4efe9] px-2 py-1 text-xs text-[#4D565C]">
                  ×{item.quantity}
                </span>
              </div>
            );
          })}

          {order.items.length > 2 && (
            <p className="text-sm text-primary">
              +{order.items.length - 2} more item(s)
            </p>
          )}
        </div>

        {/* Summary */}
        <div className="rounded-2xl bg-[#faf6f2] p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Items</span>

            <span className="font-medium text-[#4D565C]">
              {order.items.length}
            </span>
          </div>

          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-muted">Total Payment</span>

            <span className="text-base font-semibold text-primary">
              Rp {order.total.toLocaleString("id-ID")}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-medium text-white transition hover:bg-[#9A3B39]"
        >
          <ShoppingBag size={15} />
          View Detail
        </button>
      </div>
    </Link>
  );
}
