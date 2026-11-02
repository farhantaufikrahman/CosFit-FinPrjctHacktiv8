"use client";

import Image from "next/image";
import { UploadCloud, X } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import errorHandler from "@/app/helpers/errorHandler";

export default function ProductGallery({
  imgUrl,
  imgGalery,
  id
}: {
  id:string
  imgUrl: string;
  imgGalery: string[];
}) {
  const allImg = [imgUrl, ...imgGalery?? []];
  
  // Initially select the main image
  const [selected, setSelected] = useState(imgUrl);
  const [uploading, setUploading] = useState(false);

  const router = useRouter()
  
  const handleDeleteImage = async (url: string) => {
    console.log("Deleting:", url);

    try {
      const res = await fetch(
        `/api/vendor/product/${id}/galery`,
        {
          method: "PUT",
          body: JSON.stringify({ url }),
        }
      );

      console.log("Status:", res.status);

      const data = await res.json();
      console.log(data);

      if (!res.ok) throw data;

      router.refresh();
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();

      formData.append("image", file);
      const res = await fetch(`/api/vendor/product/${id}/galery`, {
        method: "PATCH",
        body: formData,
      });
      router.refresh()
    } catch (error) {
      console.error("PATCH ERROR:", error);
        return Response.json(
          {
            message: "Internal Server Error",
            error: error instanceof Error ? error.message : error,
          },
          { status: 500 }
        );
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="card p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="card-title">Product Gallery</h3>
          <p className="card-subtitle">
            Showcase your costume from multiple angles.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-[2.3fr_1fr] gap-5">
        {/* Main Image */}
        <div className="group relative overflow-hidden rounded-[26px]">
          <Image
            src={selected}
            alt="Costume"
            width={900}
            height={1100}
            unoptimized
            className="h-full w-full cursor-pointer object-cover transition duration-500 group-hover:scale-105"
          />

          <div className="absolute left-5 top-5 rounded-full bg-black/70 px-4 py-2 text-sm text-white backdrop-blur">
            Main Photo
          </div>
        </div>

        {/* Thumbnails */}
        <div className="grid grid-cols-2 gap-4 auto-rows-max">
          {allImg.map((img) => (
            <div key={img} className="relative group w-[120px] h-[180px]">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  // handleDelete(img)
                  handleDeleteImage(img)
                }}
                className="absolute top-2 right-2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition-all duration-200 hover:scale-110 hover:bg-red-600 opacity-0 group-hover:opacity-100"
              >
                <X size={14} />
              </button>

              <button
                type="button"
                onClick={() => setSelected(img)}
                className={`h-full w-full overflow-hidden rounded-3xl border transition ${
                  selected === img
                    ? "border-[var(--primary)] ring-2 ring-[#FCEAE3]"
                    : "border-[var(--border)]"
                }`}
              >
                <Image
                  src={img}
                  alt=""
                  width={300}
                  height={450}
                  unoptimized
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
                />
              </button>
            </div>
          ))}

          {/* Upload */}
         <button
            type="button"
            className="w-[120px] h-[180px] rounded-3xl border-2 border-dashed border-[var(--border)] bg-[#FCFBFA] transition hover:border-[var(--primary)] hover:bg-[#FFF8F5]"
          >
            <label
              htmlFor="img"
              className="flex h-full w-full cursor-pointer flex-col items-center justify-center"
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-card">
                <UploadCloud size={30} className="text-[var(--primary)]" />
              </div>

              <h4 className="font-semibold">Upload Image</h4>

              <p className="mt-2 text-center text-sm text-[var(--muted)]">
                JPG / PNG
                <br />
                up to 10 MB
              </p>
            </label>

            <input
              id="img"
              type="file"
              accept="image/*"
              hidden
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) {
                  return
                }
                await handleUpload(file)
              }}
            />
          </button>
        </div>
      </div>
    </section>
  );
}