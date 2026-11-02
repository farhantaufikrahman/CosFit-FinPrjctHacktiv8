"use client";

import errorHandler from "@/app/helpers/errorHandler";
import { Coins, Sparkles, Crown } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
  title: string;
  credits: number;
  price: number;
  description: string;
  popular?: boolean;
};

export default function CreditPackageCard({
  title,
  credits,
  price,
  description,
  popular = false,
}: Props) {

  const route = useRouter()

  const handlePurchase = async () => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/topup`, {
      method: "POST",
      body: JSON.stringify({ credits }),
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.message || "Failed to create transaction");
      return;
    }

    window.snap.pay(data.token, {
      onSuccess: async () => {
        // Server memverifikasi orderId ke Midtrans, bukan percaya jumlah credit dari client
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/topup`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: data.orderId }),
        });
        route.refresh();
      },

      onPending: () => {
        alert("Waiting for payment");
      },

      onError: () => {
        alert("Payment failed");
      },
    });
  } catch (error) {
    errorHandler(error);
  }
};

  return (
    <div
      className={`
      relative
      card
      flex
      flex-col
      overflow-hidden
      p-8
      transition-all
      duration-300

      hover:-translate-y-1
      hover:shadow-soft

      ${
        popular
          ? "border-2 border-[var(--primary)] shadow-soft scale-[1.03]"
          : ""
      }
      `}
    >
      {popular && (
        <div className="absolute left-1/2 top-5 -translate-x-1/2">

          <span className="rounded-full bg-[var(--primary)] px-4 py-1 text-xs font-semibold text-white">

            Most Popular

          </span>

        </div>
      )}

      <div className="mt-8 flex justify-center">

        <div
          className="
          flex
          h-20
          w-20
          items-center
          justify-center
          rounded-full
          bg-[#FFF5EE]
          text-[var(--primary)]
          "
        >
          {title === "Starter" ? (
            <Coins size={34} />
          ) : title === "Explorer" ? (
            <Sparkles size={34} />
          ) : (
            <Crown size={34} />
          )}
        </div>

      </div>

      <h3 className="mt-8 text-center text-3xl font-semibold">

        {title}

      </h3>

      <div className="mt-4 text-center">

        <span className="text-5xl font-bold">

          {credits}

        </span>

        <span className="ml-2 text-xl">

          Credits

        </span>

      </div>

      <p className="mt-6 text-center leading-7 text-[var(--muted)]">

        {description}

      </p>

      <div className="mt-8 text-center">

        <p className="text-4xl font-bold">

          IDR {price.toLocaleString("id-ID")}

        </p>

      </div>

      <button className="primary-btn mt-10 w-full" onClick={handlePurchase}>

        Purchase Credits

      </button>
    </div>
  );
}