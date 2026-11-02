"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, Coins, ArrowRight, Images } from "lucide-react";

import { GetUserProfile } from "@/app/types";
import errorHandler from "@/app/helpers/errorHandler";

export default function CreditHero() {
  const [profile, setProfile] = useState<GetUserProfile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/user/profile`, {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("Failed to load profile");
        }

        const data: GetUserProfile = await res.json();

        setProfile(data);
      } catch (error) {
        errorHandler(error);
      }
    };

    fetchProfile();
  }, []);

  const credits = profile?.userId?.[0]?.token ?? 0;

  return (
    <section className="overflow-hidden rounded-[40px] border border-[#F3E8DF] bg-gradient-to-br from-white via-[#FFFDFC] to-[#FFF8F4] p-12 shadow-sm">
      <div className="grid items-center gap-16 lg:grid-cols-[0.9fr_1.1fr]">
        {/* LEFT */}

        <div className="flex h-full flex-col justify-center">
          <h1 className="mt-6 max-w-md text-6xl font-bold leading-[1.05] tracking-[-0.03em] text-foreground">
            AI Virtual
            <br />
            Fitting Credits
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-8 text-muted">
            Generate realistic AI cosplay previews before renting costumes.
            Every generation uses one credit, while your saved looks stay
            available anytime.
          </p>

          {/* Balance */}

          <div className="mt-10 rounded-[28px] border border-[#F3E6DC] bg-gradient-to-br from-white to-[#FFF8F5] p-7 shadow-sm">
            <p className="text-sm font-medium uppercase tracking-wider text-[#8B857F]">
              Current Balance
            </p>

            <div className="mt-6 flex items-center gap-5">
              <div className="flex h-18 w-18 items-center justify-center rounded-3xl bg-[#FFF4EA] shadow-inner">
                <Coins size={34} className="text-[#F6A623]" />
              </div>

              <div>
                <div className="flex items-end gap-2">
                  <h2 className="text-6xl font-bold leading-none text-foreground">
                    {credits}
                  </h2>

                  <span className="pb-2 text-xl font-semibold text-muted">
                    Credits
                  </span>
                </div>

                <p className="mt-2 text-sm text-muted">
                  Available for AI generation
                </p>
              </div>
            </div>

            <div className="my-7 h-px bg-[#F2E8E1]" />

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-2.5 w-2.5 rounded-full bg-[#7ACB87]" />

                <p className="text-[15px] text-muted">
                  1 credit per AI Try-On generation
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-2.5 w-2.5 rounded-full bg-[#7ACB87]" />

                <p className="text-[15px] text-muted">
                  View previously generated looks for free
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-2.5 w-2.5 rounded-full bg-[#7ACB87]" />

                <p className="text-[15px] text-muted">
                  Claim free weekly credits every 7 days
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}

          <div className="mt-8 flex items-center gap-5">
            <Link
              href="/profile"
              className="group flex items-center gap-2 text-[15px] font-semibold text-primary transition hover:gap-3"
            >
              <Images size={18} />
              My Generated Looks
              <ArrowRight
                size={17}
                className="transition group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>

        {/* RIGHT */}

        <div className="relative flex items-center justify-center">
          <div className="absolute h-[560px] w-[560px] rounded-full bg-[#FFE8D9] blur-[120px] opacity-70" />

          <div className="absolute -left-8 top-14 h-28 w-28 rounded-full bg-[#FFF6EF] blur-2xl" />

          <div className="absolute -right-6 bottom-12 h-36 w-36 rounded-full bg-[#FFEFE5] blur-3xl" />

          <div className="relative overflow-hidden rounded-[36px] border border-[#F3E7DD] bg-white p-5 shadow-[0_30px_80px_rgba(0,0,0,.08)]">
            <Image
              src="/images/credits/credits.png"
              alt="AI Preview"
              width={900}
              height={900}
              priority
              className="rounded-[28px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
