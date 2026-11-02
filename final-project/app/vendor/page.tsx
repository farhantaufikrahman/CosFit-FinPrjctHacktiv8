"use client";
import VendorProductRow from "@/components/vendor/VendorProductRow";
import VendorStatCard from "@/components/vendor/VendorStatCard";
import { CircleCheck, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { GetProduct, GetVendor } from "../types";
import Link from "next/link";

export default function VendorDashboard() {
  const [vendor, setVendor] = useState<GetVendor>();
  const [vendorProd, setVendorProd] = useState<GetProduct[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchingVendorProfile = async () => {
      const response = await fetch(`/api/vendor/profile`);
      const dataVendor: GetVendor = await response.json();
      setVendor(dataVendor);
    };
    fetchingVendorProfile();
  }, []);

  useEffect(() => {
    const fetchingVendorProduct = async () => {
      const response = await fetch(
        `/api/vendor/product?page=${page}&limit=5`,
      );
      const data = await response.json();

      setVendorProd(data.data);
      setTotalPages(data.totalPages);
    };
    fetchingVendorProduct();
  }, [page]);

  return (
    <main className="flex min-h-screen bg-(--background)">
      <section className="p-8 flex-1">
        {/* Top */}

        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <Link href={"/vendor/create-prod"}>
              <button className="primary-btn flex items-center gap-2">
                <Plus size={18} />
                Add Costume
              </button>
            </Link>
          </div>
        </div>

        {/* Hero */}

        <div className="card mb-8 flex items-center justify-between p-8">
          <div>
            <h1 className="text-5xl font-bold">
              Welcome Back,
              <span className="text-(--primary)">{vendor?.namaToko}</span>
              👋
            </h1>

            <p className="mt-3 text-lg text-(--muted)">
              Manage your cosplay rental business with CosFit.
            </p>
          </div>
        </div>

        {/* Statistics */}

        {/* <VendorStatCard
          title="Completed Rentals"
          value={56}
          growth="+15% from last month"
          icon="check"
          color="#16A34A"
        /> */}

        <div className="mt-8">
          {/* LEFT */}
          <div className="card p-7 flex-1">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="card-title">My Costumes</h3>
            </div>

            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-(--muted)">
                  <th className="pb-4">Costume</th>

                  <th>Rental Price</th>

                  <th>Views</th>

                  <th>Wishlist</th>

                  <th>Stock</th>

                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {vendorProd.map((el, idx) => {
                  return (
                    <VendorProductRow
                      key={idx}
                      image={el.imgUrl}
                      character={el.title}
                      series={el.theme.join(", ")}
                      originalPrice={+el.originalPrice}
                      finalPrice={el.finalPrice}
                      discount={el.discount}
                      availability="Available"
                      rental="Available"
                      views={el.views ?? 0}
                      wishlist={el.wishlists.length}
                      id={el.slug}
                      stock={el.stock}
                    />
                  );
                })}
              </tbody>
            </table>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="secondary-btn disabled:opacity-50"
              >
                Previous
              </button>

              <span>
                Page {page} of {totalPages}
              </span>

              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="primary-btn disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
