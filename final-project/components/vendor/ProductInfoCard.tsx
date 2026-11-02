"use client";

import errorHandler from "@/app/helpers/errorHandler";
import { GetProduct } from "@/app/types";
import { Coins, Boxes, TypeOutline, Palette, Ruler } from "lucide-react";
import { useRouter } from "next/navigation";
import { SubmitEvent, useEffect, useState } from "react";
import DescriptionEditor from "../DescriptionEditor";
import ThemeCombobox from "../ThemeCombobox";

export default function ProductInfoCard({ product }: { product: GetProduct }) {
  // const [imgUrl, setImgUrl] = useState<File | string>("")
  const [isEdit, setIsEdit] = useState(false);
  const [desc, setDesc] = useState(product.desc);
  const [size, setSize] = useState(product.size);
  const [themes, setThemes] = useState<string[]>(product.theme ?? []);
  const [title, setTitle] = useState(product.title);
  const [originalPrice, setOriginalPrice] = useState(product.originalPrice);
  const [stock, setStock] = useState(product.stock);
  const [discount, setDiscount] = useState(product.discount);
  const [finalPrice, setFinalPrice] = useState(product.finalPrice);

  const [themeOptions, setThemeOptions] = useState([
    "Anime",
    "Game",
    "Maid",
    "Fantasy",
    "School",
  ]);

  const route = useRouter();

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      // setState itu async: finalPrice di bawah masih nilai lama kalau tidak dihitung di sini
      const effectiveFinalPrice = discount ? finalPrice : originalPrice;
      if (!discount) {
        setFinalPrice(originalPrice);
      }
      const res = await fetch(
        // Pakai route vendor (dicek login + kepemilikan product di proxy.ts)
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/vendor/product/${product._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            desc,
            size,
            theme: themes,
            originalPrice,
            stock,
            finalPrice: effectiveFinalPrice,
            discount,
          }),
        },
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update product");
      }

      setIsEdit(false);
      route.push(`/vendor/product/${product.slug}`);
    } catch (error) {
      errorHandler(error);
    }
  };

  useEffect(() => {
    const priceCalc = +originalPrice - (+originalPrice * +discount) / 100;
    setFinalPrice(priceCalc);
  }, [discount]);

  return (
    <section className="card p-7">
      <div className="gap-5 flex">
        <button
          className="secondary-btn transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-sm"
          onClick={() => {
            setIsEdit(true);
          }}
        >
          Edit
        </button>

        <button
          className="secondary-btn transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-sm"
          onClick={() => {
            setIsEdit(false);
          }}
        >
          Cancel
        </button>
      </div>

      {/* Header */}

      <div className="mb-8">
        <h2 className="card-title">Product Information</h2>

        <p className="card-subtitle">
          Rental settings and size specifications.
        </p>
      </div>

      {/* Information */}
      {!isEdit ? (
        <div className="space-y-5">
          <InfoItem
            icon={<TypeOutline size={18} />}
            title="Title"
            value={title}
          />

          <InfoItem
            icon={<Palette size={18} />}
            title="Theme"
            value={themes.join(",")}
          />

          <InfoItem
            icon={<TypeOutline size={18} />}
            title="Description"
            value={desc}
            isHtml
          />

          <InfoItem
            icon={<Boxes size={18} />}
            title="Stock"
            value={stock + ""}
          />

          <InfoItem icon={<Ruler size={18} />} title="Size" value={size} />

          <InfoItem
            icon={<Coins size={18} />}
            title="Original Price"
            value={formatIDR(originalPrice) + ""}
          />

          <InfoItem
            icon={<Coins size={18} />}
            title="Discount"
            value={`${discount ?? 0}%`}
          />

          <InfoItem
            icon={<Coins size={18} />}
            title="Final Price"
            value={formatIDR(originalPrice??0) + ""}
          />
        </div>
      ) : (
        <div>
          <form onSubmit={handleSubmit}>
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
            <Field label="Theme" htmlFor="Theme">
              <ThemeCombobox
                value={themes}
                onChange={setThemes}
                options={themeOptions}
                setOptions={setThemeOptions}
              />
            </Field>
            <Field label="Description" htmlFor="desc">
              <DescriptionEditor value={desc} onChange={setDesc} />
            </Field>
            <Field label="Stock" htmlFor="Stock">
              <input
                id="Stock"
                required
                className="input-soft w-full"
                placeholder="e.g. Yae Miko XL"
                value={stock}
                onChange={(e) => {
                  setStock(+e.target.value);
                }}
              />
            </Field>
            <Field label="Size" htmlFor="Size">
              <input
                id="Size"
                required
                className="input-soft w-full"
                placeholder="e.g. Yae Miko XL"
                value={size}
                onChange={(e) => {
                  setSize(e.target.value);
                }}
              />
            </Field>
            <Field label="Original Price" htmlFor="Original Price">
              <input
                id="Original Price"
                required
                className="input-soft w-full"
                placeholder="e.g. Yae Miko XL"
                value={originalPrice}
                onChange={(e) => {
                  setOriginalPrice(+e.target.value);
                }}
              />
            </Field>
            <Field label="Discount" htmlFor="Discount">
              <input
                id="Discount"
                required
                className="input-soft w-full"
                placeholder="e.g. Yae Miko XL"
                value={discount ?? 0}
                onChange={(e) => {
                  setDiscount(+e.target.value);
                }}
              />
            </Field>
            <Field label="Final Price" htmlFor="Final Price">
              <input
                id="Final Price"
                required
                className="input-soft w-full"
                placeholder={(finalPrice ?? 0) + ""}
                readOnly
              />
            </Field>
            <button
              className="secondary-btn mt-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-sm"
              type="submit"
            >
              Submit
            </button>
          </form>
        </div>
      )}
    </section>
  );
}

/* -------------------------- */

const formatIDR = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

function InfoItem({
  icon,
  title,
  value,
  subtitle,
  badge,
  isHtml,
}: {
  icon: React.ReactNode;
  title: string;
  value?: string;
  subtitle?: string;
  badge?: string;
  isHtml?: boolean;
}) {
  return (
    <div className="flex justify-between items-start rounded-2xl p-3 transition hover:bg-[#FCFBFA]">
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF5F0] text-[var(--primary)]">
          {icon}
        </div>

        <div>
          <p className="text-sm text-[var(--muted)]">{title}</p>
        </div>
      </div>

      {badge ? (
        <span className="badge-success">{badge}</span>
      ) : (
        <div className="w-[200px] flex justify-end">
          {isHtml ? (
            <div
              className="
                w-full
                text-right
                [&>p]:mb-4
                [&>p:last-child]:mb-0
                [&>p]:text-right
                [&>ul]:list-disc
                [&>ul]:list-inside
                [&>ul]:text-right
                [&>ol]:list-decimal
                [&>ol]:list-inside
                [&>ol]:text-right
              "
              dangerouslySetInnerHTML={{ __html: value ?? "" }}
            />
          ) : (
            <div className="text-right">
              <p>{value}</p>

              {subtitle && (
                <p className="text-xs text-[var(--muted)]">{subtitle}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
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
