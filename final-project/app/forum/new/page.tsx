"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Image as ImageIcon, Plus, Tags } from "lucide-react";
import DescriptionEditor from "@/components/DescriptionEditor";

export default function NewDiscussionPage() {
  const router = useRouter();

  const [nameForum, setNameForum] = useState("");
  const [desc, setDesc] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [tags, setTags] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const plainDescription = desc
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();

    if (!nameForum.trim()) {
      setError("Please enter a discussion title.");
      return;
    }

    if (!plainDescription) {
      setError("Please enter a description.");
      return;
    }

    if (!tags.trim()) {
      setError("Please enter at least one tag.");
      return;
    }

    if (!imageFile) {
      setError("Please choose an image for your discussion.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const formData = new FormData();

      formData.append("Image", imageFile);
      formData.append("nameForum", nameForum.trim());
      formData.append("desc", desc); // Keep the HTML from Tiptap
      formData.append("tag", tags.trim());

      const res = await fetch(`/api/forum`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Failed to create your discussion.");
      }

      router.push("/forum");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="page-container">
      <section className="mx-auto max-w-3xl">
        <Link
          href="/forum"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[var(--muted)] hover:text-[var(--primary)]"
        >
          <ArrowLeft size={17} /> Back to discussions
        </Link>

        <div className="card p-6 sm:p-10">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
              CosFit Community
            </p>
            <h1 className="mt-2">Create New Discussion</h1>
            <p className="mt-3 text-[var(--muted)]">
              Start a conversation and connect with fellow cosplayers.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <Field label="Discussion title" htmlFor="nameForum">
              <input
                id="nameForum"
                required
                value={nameForum}
                onChange={(event) => setNameForum(event.target.value)}
                className="input-soft w-full"
                placeholder="e.g. Tips for first-time cosplay events"
              />
            </Field>

              <Field label="Description" htmlFor="desc">
                <DescriptionEditor
                  value={desc}
                  onChange={setDesc}
                />
              </Field>

            <Field
              label="Discussion image"
              htmlFor="img"
              icon={<ImageIcon size={17} />}
              hint="Your image will be uploaded securely and saved as a public URL."
            >
              <input
                id="img"
                required
                type="file"
                accept="image/*"
                onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
                className="input-soft w-full file:mr-4 file:rounded-xl file:border-0 file:bg-[#F8EEEA] file:px-3 file:py-2 file:font-semibold file:text-[var(--primary)]"
              />
            </Field>

            <Field
              label="Tags"
              htmlFor="tag"
              icon={<Tags size={17} />}
              hint="Separate multiple tags with commas. ex: Anime, Cosplay, Girl..."
            >
              <input
                id="tag"
                required
                value={tags}
                onChange={(event) => setTags(event.target.value)}
                className="input-soft w-full"
                placeholder="Cosplay Tips, Photography"
              />
            </Field>

            {error ? (
              <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <Link href="/forum" className="secondary-btn inline-flex items-center justify-center">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="primary-btn inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Plus size={18} /> {isSubmitting ? "Creating..." : "Create Discussion"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
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
  icon?: ReactNode;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 flex items-center gap-2 font-semibold text-[var(--text)]">
        {icon}
        {label}
      </label>
      {children}
      {hint ? <p className="mt-2 text-sm text-[var(--muted)]">{hint}</p> : null}
    </div>
  );
}
