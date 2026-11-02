"use client";

import Image from "next/image";
import { Check, Sparkles, Minus, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { GetProduct, GetVendor } from "../../app/types";
import Swal from "sweetalert2";
import errorHandler from "@/app/helpers/errorHandler";
import Script from "next/script";
import { useRouter } from "next/navigation";

type GroupedProduct = {
  product: GetProduct;
  quantity: number;
};

type CheckoutExperienceProps = {
  groupedProducts: GroupedProduct[];
  vendor: GetVendor;
};

export default function CheckoutExperience({
  groupedProducts,
  vendor,
}: CheckoutExperienceProps) {
  const route = useRouter()
  const [quantities, setQuantities] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      groupedProducts.map((item) => [item.product._id, item.quantity]),
    ),
  );
  const selectedItems = useMemo(
    () =>
      groupedProducts
        .map((item) => ({
          ...item,
          quantity: quantities[item.product._id] ?? item.quantity,
        }))
        .filter((item) => (item.quantity ?? 0) > 0),
    [groupedProducts, quantities],
  );

  const subtotal = selectedItems.reduce(
    (total, item) =>
      total + Number(item.product.finalPrice) * (item.quantity || 0),
    0,
  );

 
  const total = subtotal

  const updateQuantity = (id: string, nextValue: number) => {
    setQuantities((current) => ({
      ...current,
      [id]: Math.max(0, nextValue),
    }));

  };

  const onQuantityZero = async (productId: string) => {
    await fetch(`/api/user/checkout/${productId}`, {method: "DELETE"})
    route.refresh()
  }

  const handlePay = async () => {
  try {
    
    const res = await fetch(`/api/pay`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: selectedItems,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.message || "Failed to create payment");
      return;
    }

    window.snap.pay(data.token, {
      onSuccess: async (result) => {
        console.log(result);
        await fetch(`/api/pay`, {method: "PATCH", body: JSON.stringify({orderId: data.orderId, status: "Success"})})
        route.refresh()
      },
      onPending: async (result) => {
        console.log(result);
        await fetch(`/api/pay`, {method: "PATCH", body: JSON.stringify({orderId: data.orderId, status: "Pending"})})
      },
      onError: async (result) => {
        console.log(result);
        await fetch(`/api/pay`, {method: "DELETE", body: JSON.stringify({orderId: data.orderId})})
      },
      onClose: () => {
        console.log("Payment popup closed");
      },
    });

    route.refresh()
  } catch (error) {
    return errorHandler(error);
  }
};


  return (
    <main className="min-h-screen bg-[#f8f6f2] px-3 py-4 sm:px-5 lg:px-6 xl:px-8">
      
      <div className="mx-auto flex w-full max-w-360 flex-col gap-2 px-1 pb-4 pt-3 sm:px-2 lg:px-0">
        <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">
          Checkout
          <Sparkles className="text-accent" size={20} />
        </h2>

        <p className="max-w-2xl text-sm leading-6 text-muted lg:text-base">
          Almost there! Complete your rental. 
        </p>
      </div>

  

      <div className="mx-auto max-w-360 px-2 py-6 sm:px-4 lg:px-6 xl:px-8 xl:py-8">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
          <section className="space-y-5">
            <div className="rounded-[28px] border border-border/70 bg-white p-5 shadow-[0_16px_44px_-28px_rgba(15,23,42,0.24)] sm:p-6">
              <div className="mb-5 flex items-center justify-between border-b border-border/70 pb-4">
                <div className="flex items-center gap-3">
                  <CircleNumber number={1} />
                  <h3 className="text-base font-semibold tracking-[-0.01em]">
                    Selected Costumes
                  </h3>
                </div>

                <span className="rounded-full bg-[#f4efe9] px-3 py-1 text-sm font-medium text-foreground/80">
                  {selectedItems.length} Item
                  {selectedItems.length > 1 && "s"}
                </span>
              </div>

              <div className="space-y-4">
                {selectedItems?.map(({ product, quantity }) => {
                  const unitPrice = Number(product.finalPrice);
                  return (
                    <div
                      key={product._id}
                      className="flex flex-col gap-4 rounded-3xl border border-border/70 bg-[#fcfbfa] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[0_12px_30px_-20px_rgba(15,23,42,0.22)] lg:flex-row lg:items-start lg:justify-between"
                    >
                      <div className="flex gap-4">
                        <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-2xl border border-border/70 bg-[#f5efe8]">
                          <Image
                            src={product.imgUrl}
                            alt={product.title}
                            fill
                            className="object-cover object-top"
                          />
                        </div>

                        <div className="flex flex-col justify-between">
                          <div>
                            <h4 className="text-[17px] font-semibold tracking-[-0.01em] text-foreground">
                              {product.title}
                            </h4>

                            <p className="mt-1 text-sm text-muted">
                              {product.theme}
                            </p>

                            <p className="mt-3 text-sm text-muted">
                              Vendor{" "}
                              <span className="font-medium text-foreground">
                                {vendor.namaToko}
                              </span>
                            </p>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            <span className="rounded-full bg-[#f4efe9] px-2.5 py-1 text-[11px] font-medium text-foreground/75">
                              Size {product.size}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-4 lg:items-end">
                        <div className="text-left lg:text-right">
                          <p className="text-sm text-muted">Price per item</p>

                          <h3 className="mt-1 text-lg font-semibold text-foreground">
                            Rp {unitPrice.toLocaleString("id-ID")}
                          </h3>
                        </div>

                        <div className="flex flex-col gap-2">
                          <div className="inline-flex items-center rounded-full border border-border/80 bg-white shadow-sm">
                            <button
                              type="button"
                              onClick={() => {
                                if (quantity <= 1) {
                                  // quantity would become 0
                                  onQuantityZero(product._id); // your function
                                } else {
                                  updateQuantity(product._id, quantity - 1);
                                }
                              }}
                              className="flex h-9 w-9 items-center justify-center rounded-l-full border-r border-border/70 text-foreground transition-all duration-200 hover:bg-primary hover:text-white"
                            >
                              <Minus size={16} />
                            </button>

                            <div className="flex h-9 min-w-12 items-center justify-center px-4 text-sm font-semibold text-foreground">
                              {quantity}
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(product._id, quantity + 1)
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-r-full border-l border-border/70 text-foreground transition-all duration-200 hover:bg-primary hover:text-white"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[28px] border border-border/70 bg-white p-5 shadow-[0_16px_44px_-28px_rgba(15,23,42,0.2)] lg:p-6">
              <div className="mb-5 flex items-center gap-3 border-b border-border/70 pb-4">
                <CircleNumber number={2} />

                <h3 className="text-base font-semibold tracking-[-0.01em]">
                  Vendor Information
                </h3>
              </div>

              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">

                  <div>
                    <h4 className="text-lg font-semibold">{vendor?.namaToko}</h4>
                    <p className="text-sm text-muted">Alamat: {vendor?.alamat}</p>
                  </div>
                </div>

                {/* <div className="flex flex-wrap gap-3">
                  <button className="rounded-2xl border border-border/70 bg-white px-5 py-2 text-sm font-medium text-foreground transition-all duration-200 hover:border-primary/40 hover:bg-[#fff8f3]">
                    View Shop
                  </button>

                  <button className="rounded-2xl bg-primary px-5 py-2 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90">
                    Chat Vendor
                  </button>
                </div> */}
              </div>
            </div>

            {/* <div className="rounded-[28px] border border-border/70 bg-white p-5 shadow-[0_16px_44px_-28px_rgba(15,23,42,0.2)] lg:p-6">
              <div className="mb-5 flex items-center gap-3 border-b border-border/70 pb-4">
                <CircleNumber number={4} />

                <h3 className="text-base font-semibold tracking-[-0.01em]">
                  Pickup or Delivery
                </h3>
              </div>

              <div className="grid gap-4 md:grid-cols-2">

                <button
                  type="button"
                  onClick={() => setDeliveryMethod("pickup")}
                  className={`rounded-3xl border p-5 text-left transition-all duration-200
      ${
        deliveryMethod === "pickup"
          ? "border-primary/40 bg-[#fff8f3] shadow-[0_10px_28px_-18px_rgba(15,23,42,0.25)]"
          : "border-border/70 bg-[#fcfbfa] hover:border-primary/35 hover:shadow-sm"
      }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl
          ${
            deliveryMethod === "pickup"
              ? "bg-primary text-white"
              : "bg-[#f5efe8] text-foreground/80"
          }`}
                      >
                        🏪
                      </div>

                      <div>
                        <h4 className="font-semibold text-lg">Pickup</h4>

                        <p className="mt-1 text-sm text-muted">
                          Collect directly from vendor
                        </p>
                      </div>
                    </div>

                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full border
        ${
          deliveryMethod === "pickup"
            ? "border-primary bg-primary text-white"
            : "border-border"
        }`}
                    >
                      {deliveryMethod === "pickup" && <Check size={14} />}
                    </div>
                  </div>

                  <div className="mt-5 border-t border-border pt-4 text-sm leading-7">
                    <p className="font-medium">{vendor?.namaToko}</p>

                    <p className="text-muted">{vendor?.alamat}</p>

                    <p className="mt-3 flex items-center gap-2 text-muted">
                      🕒 24 May 2025 • 10:00 AM
                    </p>
                  </div>
                </button>


                <button
                  type="button"
                  onClick={() => setDeliveryMethod("delivery")}
                  className={`flex h-full flex-col rounded-3xl border p-5 text-left transition-all duration-200
    ${
      deliveryMethod === "delivery"
        ? "border-primary/40 bg-[#fff8f3] shadow-[0_10px_28px_-18px_rgba(15,23,42,0.25)]"
        : "border-border/70 bg-[#fcfbfa] hover:border-primary/35 hover:shadow-sm"
    }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-colors
          ${
            deliveryMethod === "delivery"
              ? "bg-primary text-white"
              : "bg-[#f5efe8] text-foreground/80"
          }`}
                      >
                        🚚
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold">Delivery</h4>

                        <p className="mt-1 text-sm text-muted">
                          Ship directly to your address
                        </p>
                      </div>
                    </div>

                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors
        ${
          deliveryMethod === "delivery"
            ? "border-primary bg-primary text-white"
            : "border-border"
        }`}
                    >
                      {deliveryMethod === "delivery" && <Check size={14} />}
                    </div>
                  </div>

                  <div className="mt-5 flex-1 border-t border-border pt-4">
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-2">
                        <p className="text-muted">
                          <span className="font-medium">
                            Shipping fee will be calculated automatically after
                            your delivery address is entered.
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div> */}

            {/* <div className="rounded-[28px] border border-border/70 bg-white p-5 shadow-[0_16px_44px_-28px_rgba(15,23,42,0.2)] lg:p-6">
              <div className="mb-5 flex items-center gap-3 border-b border-border/70 pb-4">
                <CircleNumber number={5} />

                <h3 className="text-base font-semibold tracking-[-0.01em]">
                  Additional Information
                </h3>
              </div>

              <div className="rounded-3xl border border-border/70 bg-[#fcfbfa] p-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground/80">
                    Notes to Vendor
                  </label>

                  <textarea
                    rows={5}
                    placeholder="Any special request, body adjustment, event date..."
                    className="w-full resize-none rounded-2xl border border-border/70 bg-white p-4 text-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
                  />

                  <p className="mt-2 text-right text-xs text-muted">0 / 300</p>
                </div>
              </div>
            </div> */}
          </section>

          <aside className="sticky top-24 h-fit space-y-4">
            <div className="rounded-[28px] border border-border/70 bg-white p-5 shadow-[0_16px_44px_-28px_rgba(15,23,42,0.2)] lg:p-6">
              <h3 className="mb-4 text-base font-semibold tracking-[-0.01em]">
                Order Summary
              </h3>

              <div className="space-y-3">
                {selectedItems?.map(({ product, quantity }) => (
                  <div
                    key={product._id}
                    className="flex items-start gap-3 rounded-2xl border border-border/70 bg-[#fcfbfa] p-3"
                  >
                    <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl">
                      <Image
                        src={product.imgUrl}
                        alt={product.title}
                        fill
                        className="object-cover object-top"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="text-[15px] font-semibold tracking-[-0.01em]">
                          {product.title}
                        </h4>

                        <span className="rounded-full border border-border/70 bg-white px-2.5 py-1 text-[11px] font-medium text-muted">
                          ×{quantity}
                        </span>
                      </div>

                      <h3 className="mt-2 text-sm text-primary font-semibold text-foreground">
                        Rp{" "}
                        {(
                          Number(product.finalPrice) * quantity
                        ).toLocaleString("id-ID")}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>

              <div className="my-5 border-t border-border/70" />

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Costume Rental</span>
                  <span className="text-foreground">
                    Rp {subtotal.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <div className="my-5 border-t border-border/70" />

              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground/80">Total</span>

                <span className="text-2xl font-semibold text-primary">
                  Rp {total.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            <div className="rounded-[24px] border border-border/70 bg-white p-4 shadow-sm">
              <button onClick={handlePay} className="h-12 w-full rounded-2xl bg-primary text-sm font-semibold text-white shadow-[0_10px_32px_-16px_rgba(230,73,80,0.7)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_34px_-14px_rgba(230,73,80,0.68)]">
                Place Order
              </button>

              <button className="mt-3 h-12 w-full rounded-2xl border border-border/70 bg-white text-sm font-medium text-foreground transition-all duration-200 hover:border-primary/40 hover:bg-[#fff8f3]">
                Save for Later
              </button>

              <p className="mt-5 text-center text-xs leading-5 text-muted">
                By placing this order you agree to our Terms of Service &
                Privacy Policy.
              </p>
            </div>
          </aside>
        </div>

        <div className="mt-12 space-y-8 xl:mt-16"></div>
      </div>
    </main>
  );
}

function CircleNumber({ number }: { number: number }) {
  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
      {number}
    </div>
  );
}

function InfoBox({
  title,
  value,
  sub,
}: {
  title: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-xl bg-[#FCFBFA] p-4">
      <p className="text-sm text-muted">{title}</p>

      <h4 className="mt-1 text-lg font-semibold">{value}</h4>

      <p className="text-sm text-muted">{sub}</p>
    </div>
  );
}

type PaymentCardProps = {
  title: string;
  icon: string;
  active?: boolean;
};

function PaymentCard({ title, icon, active }: PaymentCardProps) {
  return (
    <button
      className={`flex w-full items-center justify-between rounded-2xl border p-4 transition-all duration-200 ${
        active
          ? "border-primary/40 bg-[#fff8f3] shadow-sm"
          : "border-border/70 bg-white hover:border-primary/35 hover:shadow-sm"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-lg font-semibold tracking-tight">{icon}</span>
        <span className="font-medium text-foreground">{title}</span>
      </div>

      <div
        className={`h-5 w-5 rounded-full border-2 ${
          active ? "border-primary bg-primary" : "border-border/80"
        }`}
      />
    </button>
  );
}

type BenefitCardProps = {
  icon: string;
  title: string;
  description: string;
};

function BenefitCard({ icon, title, description }: BenefitCardProps) {
  return (
    <div className="rounded-3xl border border-border/70 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f7efe8] text-2xl">
        {icon}
      </div>

      <h3 className="text-base font-semibold tracking-[-0.01em]">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
    </div>
  );
}
