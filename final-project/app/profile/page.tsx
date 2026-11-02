"use client";

import Image from "next/image";
import {
  Home,
  User,
  Heart,
  Calendar,
  Clock3,
  Crown,
  Pencil,
  Sparkles,
} from "lucide-react";
import { CheckCircle2, Circle, LogOut } from "lucide-react";
import SidebarItem from "@/components/profile/sidebarButton";
import ProfileCheckoutHistory from "@/components/profile/ProfileCheckoutHistory";
import ProfileJoinedEvents from "@/components/profile/ProfileJoinedEvents";
import ProfileOverview from "@/components/profile/ProfileOverview";
import ProfileSavedLooks from "@/components/profile/ProfileSavedLooks";
import ProfileWishlist from "@/components/profile/ProfileWishlist";
import {
  GetCheckout,
  GetOrder,
  GetProduct,
  GetSavedLook,
  GetUserProfile,
  GetWishlist,
} from "../types";
import { useEffect, useState } from "react";
import errorHandler from "../helpers/errorHandler";
import Link from "next/link";
import EditProfileModal from "@/components/marketplace/EditProfileModal";

export default function ProfilePage() {
  const [activeSection, setActiveSection] = useState("Overview");

  const [openEditModal, setOpenEditModal] = useState(false);

  const [profileData, setProfileData] = useState<{
    profile?: GetUserProfile;
    wishlist: GetWishlist[];
    checkout: GetOrder[];
    products: GetProduct[];
    savedLooks: GetSavedLook[];
  }>({
    wishlist: [],
    checkout: [],
    products: [],
    savedLooks: [],
  });

  const fetchData = async () => {
    try {
      const [profileRes, wishlistRes, checkoutRes, productsRes, savedLooksRes] =
        await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/user/profile`, {
            cache: "no-store",
          }),
          fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/user/wishlist`, {
            cache: "no-store",
          }),
          fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/pay`, {
            cache: "no-store",
          }),
          fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/user/product`, {
            cache: "no-store",
          }),
          fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/user/history`, {
            cache: "no-store",
          }),
        ]);

      if (
        !profileRes.ok ||
        !wishlistRes.ok ||
        !checkoutRes.ok ||
        !productsRes.ok
      ) {
        throw new Error("Failed to load profile data");
      }
      const [userProfile, wishlist, checkout, products, savedLooks] =
        await Promise.all([
          profileRes.json() as Promise<GetUserProfile>,
          wishlistRes.json() as Promise<GetWishlist[]>,
          checkoutRes.json() as Promise<GetOrder[]>,
          productsRes.json() as Promise<GetProduct[]>,
          savedLooksRes.json() as Promise<GetSavedLook[]>,
        ]);

      setProfileData({
        profile: userProfile,
        wishlist,
        checkout,
        products,
        savedLooks,
      });
    } catch (error) {
      errorHandler(error);
    }
  };

  const handleUpdateImg = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/user/profile`,
        {
          method: "PATCH",
          body: formData,
        },
      );

      if (!res.ok) {
        throw new Error("Failed to update profile image");
      }

      // Refresh data setelah update berhasil
      fetchData();
      setOpenEditModal(false);
    } catch (error) {
      errorHandler(error);
    }
  };

  const handleUpdateOther = async (address: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/user/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ address }),
        },
      );

      if (!res.ok) {
        throw new Error("Failed to update address");
      }

      // Refresh data setelah update berhasil
      fetchData();
      setOpenEditModal(false);
    } catch (error) {
      errorHandler(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const { profile, wishlist, checkout, products, savedLooks } = profileData;
  const profileName = profile?.userId?.[0]?.username ?? "You";
  const profileAddress =
    profile?.address || "Add your address to personalize your profile";
  const previewProducts = products.slice(0, 4);
  const previewWishlist = wishlist.slice(0, 3);
  const previewCheckout = checkout.slice(0, 3);
  const previewSavedLooks = savedLooks.slice(0, 3);

  const renderActiveSection = () => {
    switch (activeSection) {
      case "Generated Looks":
        return <ProfileSavedLooks savedLooks={savedLooks} />;
      case "Wishlist":
        return (
          <ProfileWishlist wishlist={wishlist} refreshProfileData={fetchData} />
        );
      case "Checkout History":
        return <ProfileCheckoutHistory checkout={checkout} />;
      case "Joined Events":
        return <ProfileJoinedEvents />;
      case "Overview":
      default:
        return <ProfileOverview />;
    }
  };

  console.log(previewCheckout);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(255,244,238,0.55),transparent_28%),linear-gradient(180deg,#f8f4ef_0%,#fcfbf8_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)] 2xl:grid-cols-[300px_minmax(0,1fr)]">
          {/* ================= SIDEBAR ================= */}

          <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
            {/* Profile */}

            <div
              className="relative overflow-hidden rounded-[28px] border border-[#efe4db] bg-cover p-6 shadow-[0_16px_50px_rgba(15,23,42,0.04)] bg-center bg-no-repeat"
              style={{
                backgroundImage: "url('/images/profile/background.png')",
                backgroundSize: "105%",
              }}
            >
              <div className="flex flex-col items-center text-center">
                <div className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-[#f7dac4] shadow-[0_10px_30px_rgba(240,141,91,0.18)]">
                  <Image
                    src={profile?.photo || "/images/profile/profile.png"}
                    alt="avatar"
                    fill
                    className="object-cover"
                  />
                </div>

                <h2 className="mt-6 text-2xl font-semibold text-[#1f1a17]">
                  {profileName}
                </h2>

                <p className="mt-1 text-sm text-muted">{profileAddress}</p>
              </div>
            </div>
            {/* Menu */}

            <div className="rounded-3xl border border-[#efe4db] bg-[#fcfaf8] p-3 shadow-[0_10px_30px_rgba(15,23,42,0.03)]">
              <button
                type="button"
                onClick={() => setActiveSection("Overview")}
                className="w-full"
              >
                <SidebarItem
                  active={activeSection === "Overview"}
                  icon={<Home size={18} />}
                  title={"Overview"}
                />
              </button>

              <button
                type="button"
                onClick={() => setActiveSection("Generated Looks")}
                className="w-full"
              >
                <SidebarItem
                  active={activeSection === "Generated Looks"}
                  icon={<Sparkles size={18} />}
                  title={"Generated Looks"}
                />
              </button>

              <button
                type="button"
                onClick={() => setActiveSection("Checkout History")}
                className="w-full"
              >
                <SidebarItem
                  active={activeSection === "Checkout History"}
                  icon={<Clock3 size={18} />}
                  title="Checkout History"
                />
              </button>

              <button
                type="button"
                onClick={() => setActiveSection("Wishlist")}
                className="w-full"
              >
                <SidebarItem
                  active={activeSection === "Wishlist"}
                  icon={<Heart size={18} />}
                  title="Wishlist"
                />
              </button>

              <button
                type="button"
                onClick={() => setActiveSection("Joined Events")}
                className="w-full"
              >
                <SidebarItem
                  active={activeSection === "Joined Events"}
                  icon={<Calendar size={18} />}
                  title="Joined Events"
                />
              </button>

              <SidebarItem icon={<LogOut size={18} />} title="Logout" />
            </div>

            {/* Premium */}
            <Link
              href="/credits"
              className="block overflow-hidden rounded-3xl "
            >
              <Image
                src="/images/profile/topup.png"
                alt="Buy Credits"
                width={800}
                height={400}
                className="h-auto w-full object-fill "
              />
            </Link>
          </aside>

          {/* ================= CONTENT ================= */}

          <section className="space-y-6 lg:space-y-8">
            {/* Content Grid */}

            {activeSection === "Overview" ? (
              <>
                {/* Welcome */}
                <div className="overflow-hidden rounded-4xl border border-[#efe4db] bg-linear-to-br from-[#fff9f4] via-[#fffdfb] to-[#fef4ea] p-6 shadow-[0_16px_60px_rgba(15,23,42,0.05)] sm:p-8 lg:p-10">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-2xl">
                      <div className="inline-flex items-center gap-2 rounded-full border border-[#f1dfcf] bg-white/70 px-3 py-1 text-sm font-medium text-[#8f6d53]">
                        <Sparkles size={16} />
                        Your profile, refined
                      </div>

                      <h1 className="mt-4 flex flex-wrap items-center gap-2 text-3xl font-semibold tracking-tight text-[#1f1a17] sm:text-4xl">
                        Welcome back, {profileName}
                        <Sparkles size={20} className="text-accent" />
                      </h1>

                      <p className="mt-3 max-w-xl text-base leading-7 text-muted sm:text-lg">
                        Ready to find your next perfect cosplay? Your saved
                        looks, wishlist, and events are all gathered here.
                      </p>
                    </div>

                    <button
                      onClick={() => setOpenEditModal(true)}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:opacity-95"
                    >
                      <Pencil size={16} />
                      Edit Profile
                    </button>
                  </div>
                </div>
                <div className="grid gap-5 2xl:grid-cols-[1.15fr_0.95fr]">
                  <div className="space-y-5">
                    {/* saved look */}
                    <div className="rounded-3xl border border-[#efe4db] bg-white/80 p-5 shadow-[0_10px_32px_rgba(15,23,42,0.04)]">
                      <div className="mb-5 flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-semibold text-[#1f1a17]">
                            Generated Looks
                          </h3>

                          <p className="mt-1 text-sm text-muted">
                            Your AI generated cosplay history
                          </p>
                        </div>

                        <button
                          onClick={() => setActiveSection("Generated Looks")}
                          className="text-sm font-medium text-primary transition hover:text-[#bc5f2f]"
                        >
                          View All →
                        </button>
                      </div>

                      <div className="space-y-3">
                        {previewSavedLooks.map((item) => (
                          <div
                            key={item._id}
                            className="flex items-center gap-3 rounded-2xl border border-[#f3e8df] bg-[#fcfaf8] p-3 transition duration-200 hover:-translate-y-0.5 hover:border-[#f3caa9] hover:shadow-sm"
                          >
                            <div className="flex overflow-hidden rounded-xl">
                              <div className="relative h-20 w-14">
                                <Image
                                  src={item.UserImg}
                                  alt="before"
                                  fill
                                  className="object-cover"
                                />
                              </div>

                              <div className="relative h-20 w-14 border-l border-white">
                                <Image
                                  src={item.AiImgUrl}
                                  alt={item.Name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            </div>

                            <div className="min-w-0 flex-1">
                              <h4 className="truncate font-semibold text-[#2f2723]">
                                {item.Name}
                              </h4>

                              <p className="truncate text-xs text-muted">
                                {item.Theme}
                              </p>

                              <p className="mt-2 text-xs text-muted">
                                {new Date(item.createdAt).toLocaleDateString(
                                  "id-ID",
                                )}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-5 rounded-2xl border border-[#f4e7dc] bg-[#fcfbf8] p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted">
                              Total Generated Looks
                            </p>

                            <h3 className="text-2xl font-semibold text-[#1f1a17]">
                              {savedLooks.length}
                            </h3>
                          </div>

                          <button
                            onClick={() => setActiveSection("Generated Looks")}
                            className="rounded-2xl bg-primary px-4 py-2 text-sm font-medium text-white"
                          >
                            View All
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* recomended costume */}
                    <div className="rounded-3xl border border-[#efe4db] bg-white/80 p-5 shadow-[0_10px_32px_rgba(15,23,42,0.04)]">
                      <div className="mb-5 flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-semibold text-[#1f1a17]">
                            Recommended Costumes
                          </h3>

                          <p className="mt-1 text-sm text-muted">
                            Curated picks from our marketplace
                          </p>
                        </div>

                        <button
                          onClick={() => setActiveSection("Joined Events")}
                          className="text-sm font-medium text-primary transition hover:text-[#bc5f2f]"
                        >
                          View All →
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {previewProducts.map((item) => (
                          <div key={item._id} className="group cursor-pointer">
                            <div className="relative aspect-3/4 overflow-hidden rounded-2xl">
                              <Image
                                src={item.imgUrl || "/images/register-girl.png"}
                                alt={item.title}
                                fill
                                className="object-cover transition duration-300 group-hover:scale-105"
                              />
                            </div>

                            <h4 className="mt-2 truncate font-medium text-[#2f2723]">
                              {item.title}
                            </h4>

                            <p className="text-xs text-muted">{item.theme}</p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-5 rounded-2xl border border-[#f4e7dc] bg-[#fcfbf8] p-4">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-sm text-muted">
                              Recommended Picks
                            </p>

                            <h3 className="text-2xl font-semibold text-[#1f1a17]">
                              {previewProducts.length}
                            </h3>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="rounded-3xl border border-[#efe4db] bg-white/80 p-5 shadow-[0_10px_32px_rgba(15,23,42,0.04)]">
                      <div className="mb-5 flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-semibold text-[#1f1a17]">
                            Checkout History
                          </h3>

                          <p className="mt-1 text-sm text-muted">
                            Your recent cosplay rentals
                          </p>
                        </div>

                        <button
                          onClick={() => setActiveSection("Checkout History")}
                          className="text-sm font-medium text-primary transition hover:text-[#bc5f2f]"
                        >
                          View All →
                        </button>
                      </div>

                      <div className="space-y-3">
                        {previewCheckout.map((item) => {
                          return (
                            <div
                              key={item._id}
                              className="flex items-center gap-3 rounded-2xl border border-[#f3e8df] bg-[#fcfaf8] p-3 transition duration-200 hover:-translate-y-0.5 hover:border-[#f3caa9] hover:shadow-sm"
                            >
                              <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl">
                                <Image
                                  src={
                                    item.product[0].imgUrl ||
                                    "/images/register-girl.png"
                                  }
                                  alt={item.product[0].title}
                                  fill
                                  className="object-cover"
                                />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="truncate font-semibold text-[#2f2723]">
                                    {item.vendor?.[0]?.namaToko ??
                                      "CosFit Vendor"}
                                  </h4>

                                  {/* <StatusBadge status={item.status} /> */}
                                </div>

                                <p className="text-xs text-muted">
                                  {/* {product.theme} */}
                                </p>

                                <p className="mt-2 text-xs text-muted">
                                  {item.vendor?.[0]?.alamat || "CosFit Vendor"}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* wishlist */}
                    <div className="rounded-3xl border border-[#efe4db] bg-white/80 p-5 shadow-[0_10px_32px_rgba(15,23,42,0.04)]">
                      <div className="mb-5 flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-semibold text-[#1f1a17]">
                            Wishlist
                          </h3>

                          <p className="mt-1 text-sm text-muted">
                            Your saved costume picks
                          </p>
                        </div>

                        <button
                          onClick={() => setActiveSection("Wishlist")}
                          className="text-sm font-medium text-primary transition hover:text-[#bc5f2f]"
                        >
                          View All →
                        </button>
                      </div>

                      <div className="space-y-3">
                        {previewWishlist.map((item) => {
                          const product = item.product;

                          return (
                            <div
                              key={item._id}
                              className="flex items-center gap-3 rounded-2xl border border-[#f3e8df] bg-[#fcfaf8] p-3 transition duration-200 hover:-translate-y-0.5 hover:border-[#f3caa9] hover:shadow-sm"
                            >
                              <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl">
                                <Image
                                  src={
                                    product.imgUrl ||
                                    "/images/register-girl.png"
                                  }
                                  alt={product.title}
                                  fill
                                  className="object-cover"
                                />
                              </div>

                              <div className="min-w-0 flex-1">
                                <h4 className="truncate font-semibold text-[#2f2723]">
                                  {product.title}
                                </h4>

                                <p className="truncate text-xs text-muted">
                                  {product.theme}
                                </p>

                                <p className="mt-3 text-sm font-semibold text-primary">
                                  Rp{" "}
                                  {Number(product.originalPrice).toLocaleString(
                                    "id-ID",
                                  )}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-5 rounded-2xl border border-[#f4e7dc] bg-[#fcfbf8] p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm text-muted">Total Wishlist</p>

                            <h3 className="text-2xl font-semibold text-[#1f1a17]">
                              {wishlist.length}
                            </h3>
                          </div>

                          <Link
                            href="/checkout"
                            className="rounded-2xl bg-primary px-4 py-2 text-sm font-medium text-white transition hover:opacity-95"
                          >
                            Checkout
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>{" "}
              </>
            ) : (
              <div className="w-full">{renderActiveSection()}</div>
            )}
          </section>
        </div>
        <EditProfileModal
          open={openEditModal}
          onClose={() => setOpenEditModal(false)}
          profile={profile}
          onUpdateImg={handleUpdateImg}
          onUpdateAddress={handleUpdateOther}
        />
      </div>
    </main>
  );
}

function StatusBadge({ status }: { status: string }) {
  const color =
    status === "Completed"
      ? "bg-green-100 text-green-700"
      : status === "Returned"
        ? "bg-blue-100 text-blue-700"
        : "bg-orange-100 text-orange-700";

  return (
    <span className={`rounded-full px-2 py-1 text-[10px] font-medium ${color}`}>
      {status}
    </span>
  );
}

function CheckItem({
  title,
  checked = false,
}: {
  title: string;
  checked?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      {checked ? (
        <CheckCircle2 size={18} className="text-green-600" />
      ) : (
        <Circle size={18} className="text-gray-300" />
      )}

      <span>{title}</span>
    </div>
  );
}
