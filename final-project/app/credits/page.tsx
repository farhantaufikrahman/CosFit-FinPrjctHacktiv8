"use client";

import { useEffect, useState } from "react";

import CreditHero from "@/components/credits/CreditHero";
import HowItWorks from "@/components/credits/HowItWorks";
import CreditPackageCard from "@/components/credits/CreditPackageCard";
import UsageHistory from "@/components/credits/UsageHistory";
import FAQ from "@/components/credits/FAQ";
import CreditsCTA from "@/components/credits/CreditsCTA";

import { GetSavedLook } from "../types";
import errorHandler from "../helpers/errorHandler";

export default function CreditsPage() {
  const [savedLooks, setSavedLooks] = useState<GetSavedLook[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`/api/user/history`, {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("Failed to load history");
        }

        const data: GetSavedLook[] = await res.json();

        setSavedLooks(data);
      } catch (error) {
        errorHandler(error);
      }
    };

    fetchHistory();
  }, []);

  return (
    <main className="page-container space-y-16">
      <CreditHero />

      <HowItWorks />

      <section>
        <div className="mb-10 text-center">
          <h2 className="card-title text-4xl">Credit Packages</h2>

          <p className="card-subtitle mt-3">
            Choose the perfect package for your cosplay journey.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <CreditPackageCard
            title="Starter"
            credits={20}
            price={29000}
            description="Perfect for trying a few costumes."
          />

          <CreditPackageCard
            title="Explorer"
            credits={60}
            price={79000}
            description="Best value for most cosplayers."
            popular
          />

          <CreditPackageCard
            title="Creator"
            credits={150}
            price={179000}
            description="Ideal for creators and frequent users."
          />
        </div>

        <p className="mt-8 text-center text-sm text-[var(--muted)]">
          🔒 Secure payment • Credits never expire
        </p>
      </section>

      <UsageHistory history={savedLooks} />

    </main>
  );
}
