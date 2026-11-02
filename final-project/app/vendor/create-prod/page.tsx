"use client";
import ThemeCombobox from "@/components/ThemeCombobox";
import { ArrowLeft, ImageIcon, Plus, Tags } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SubmitEvent, useState } from "react";

export default function CreateProd() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error>();
  const [imgUrl, setImgUrl] = useState<File | string>("");
  const [imgGalery, setImgGalery] = useState<File[]>([]);
  const [desc, setDesc] = useState("");
  const [size, setSize] = useState("");
  const [themes, setThemes] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [stock, setStock] = useState("");

  const [themeOptions, setThemeOptions] = useState([
    "Fantasy",
    "Anime",
    "School",
    "Maid",
    "Genshin",
  ]);

  const router = useRouter();

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData();

      if (imgUrl) {
        formData.append("image", imgUrl); // "image" is the field name
      }

      formData.append("title", title);
      formData.append("desc", desc);
      formData.append("size", size);
      themes.forEach((theme) => {
        formData.append("theme", theme);
      });
      formData.append("originalPrice", originalPrice);
      formData.append("stock", stock);
      formData.append("finalPrice", originalPrice);
      imgGalery.forEach((file) => {
        formData.append("imgGalery", file);
      });

      const res = await fetch(`/api/vendor/product`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to create product");
      }

      router.push("/vendor");
    } catch (error) {
      setError(error as Error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-3xl">
      <Link
        href="/vendor"
        className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[var(--muted)] hover:text-[var(--primary)]"
      >
        <ArrowLeft size={17} /> Back
      </Link>

      <div className="card p-6 sm:p-10">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
            CosFit Community
          </p>
          <h1 className="mt-2">Create New Product</h1>
          <p className="mt-3 text-[var(--muted)]">
            Create product for you customers.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <Field label="Product Name" htmlFor="nameForum">
            <input
              id="nameForum"
              required
              className="input-soft w-full"
              placeholder="e.g. Yae Miko XL"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
              }}
            />
          </Field>

          <Field label="Description" htmlFor="desc">
            <textarea
              id="desc"
              required
              rows={6}
              className="input-soft w-full resize-y"
              placeholder="Detail of your product, size, or materials of your product."
              value={desc}
              onChange={(e) => {
                setDesc(e.target.value);
              }}
            />
          </Field>

          <Field
            label="Thumbnail image"
            htmlFor="img"
            icon={<ImageIcon size={17} />}
            hint="Your image will be uploaded securely and saved as a public URL."
          >
            <input
              id="img"
              required
              type="file"
              accept="image/*"
              className="input-soft w-full file:mr-4 file:rounded-xl file:border-0 file:bg-[#F8EEEA] file:px-3 file:py-2 file:font-semibold file:text-[var(--primary)]"
              onChange={(e) => {
                setImgUrl(e.target.files?.[0] ?? "");
              }}
            />
          </Field>

          <Field
            label="Preview images"
            htmlFor="img"
            icon={<ImageIcon size={17} />}
            hint="Your images will be uploaded securely and saved as public URLs."
          >
            <input
              id="img"
              required
              type="file"
              accept="image/*"
              multiple
              className="input-soft w-full file:mr-4 file:rounded-xl file:border-0 file:bg-[#F8EEEA] file:px-3 file:py-2 file:font-semibold file:text-[var(--primary)]"
              onChange={(e) => {
                const files = e.target.files;
                if (files && files.length > 0) {
                  setImgGalery((prev) => [...prev, ...Array.from(files)]);
                }
              }}
            />
            <div className="flex grid-cols-6 grid">
              {imgGalery.map((file, index) => (
                <img
                  key={index}
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-24 h-24 object-cover rounded"
                />
              ))}
            </div>
          </Field>

          <div className="grid md:grid-cols-2 gap-6">
            <Field label="Size" htmlFor="size" icon={<Tags size={17} />}>
              <input
                id="size"
                required
                className="input-soft w-full"
                placeholder="XL"
                value={size}
                onChange={(e) => {
                  setSize(e.target.value);
                }}
              />
            </Field>
            <Field
              label="Theme"
              htmlFor="theme"
              icon={<Tags size={17} />}
              hint="Your product theme."
            >
              <ThemeCombobox
                value={themes}
                onChange={setThemes}
                options={themeOptions}
                setOptions={setThemeOptions}
              />
            </Field>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Field label="Stock" htmlFor="stock" icon={<Tags size={17} />}>
              <input
                id="stock"
                required
                className="input-soft w-full"
                placeholder="0"
                value={stock}
                onChange={(e) => {
                  setStock(e.target.value);
                }}
              />
            </Field>
            <Field
              label="Price"
              htmlFor="price"
              icon={<Tags size={17} />}
              hint="Your product theme."
            >
              <input
                id="price"
                required
                className="input-soft w-full"
                placeholder="Rp 0"
                value={originalPrice}
                onChange={(e) => {
                  setOriginalPrice(e.target.value);
                }}
              />
            </Field>
          </div>

          {error ? (
            <p
              role="alert"
              className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error.message}
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <Link
              href="/forum"
              className="secondary-btn inline-flex items-center justify-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="primary-btn inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus size={18} />{" "}
              {isSubmitting ? "Creating..." : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

function Field({
  label,
  htmlFor,
  icon,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  icon?: React.ReactNode;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-2 flex items-center gap-2 font-semibold text-[var(--text)]"
      >
        {icon}
        {label}
      </label>
      {children}
      {hint ? <p className="mt-2 text-sm text-[var(--muted)]">{hint}</p> : null}
    </div>
  );
}
