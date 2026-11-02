"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import {
  CheckCircle2,
  ImagePlus,
  Loader2,
  ThumbsUp,
  UploadCloud,
} from "lucide-react";
import Swal from "sweetalert2";
import type { GetUserDesign } from "@/app/types";

type SubmitStatus = "idle" | "uploading" | "saving" | "success" | "error";

export default function DesignChallengeForm({
  eventId,
  entryCount,
  maxEntries,
  contestEntries,
}: {
  eventId: string;
  entryCount: number;
  maxEntries?: number;
  contestEntries?: GetUserDesign[];
}) {
  const [entryTitle, setEntryTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [entries, setEntries] = useState<GetUserDesign[]>(() =>
    (contestEntries ?? []).map((design) => ({
      ...design,
      imgUrl: design.imgUrl ?? "",
      vote: Number(design.vote ?? 0),
      entryTitle: design.entryTitle ?? "Untitled entry",
      username: design.username ?? "Unknown user",
    })),
  );
  const [isVoting, setIsVoting] = useState<string | null>(null);

  async function syncEntries() {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/userDesign?eventId=${eventId}`,
      );
      if (!response.ok) return;
      const data = await response.json();
      const nextEntries = Array.isArray(data?.designs)
        ? data.designs
            .map((design: GetUserDesign) => ({
              ...design,
              imgUrl: design.imgUrl ?? "",
              vote: Number(design.vote ?? 0),
              entryTitle: design.entryTitle ?? "Untitled entry",
              username: design.username ?? "Unknown user",
            }))
            .sort((a: GetUserDesign, b: GetUserDesign) => b.vote - a.vote)
        : [];

      setEntries(nextEntries);
      if (data.hasSubmitted) setAlreadySubmitted(true);
    } catch {
      // The API still enforces the one-entry rule on submit.
    }
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    setPreviewUrl(selected ? URL.createObjectURL(selected) : null);
    setStatus("idle");
    setErrorMessage("");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!file || !entryTitle.trim()) return;

    setErrorMessage("");

    try {
      setStatus("uploading");
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/userDesign/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!uploadRes.ok) {
        const data = await uploadRes.json().catch(() => null);
        throw new Error(data?.message || "Failed to upload your image.");
      }

      const { url } = await uploadRes.json();

      setStatus("saving");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/userDesign`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imgUrl: url,
            vote: 0,
            eventId,
            entryTitle: entryTitle.trim(),
          }),
        },
      );

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Failed to submit your design.");
      }

      setStatus("success");
      setFile(null);
      setPreviewUrl(null);
      setEntryTitle("");
      setAlreadySubmitted(true);
      await syncEntries();
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    }
  }

  async function handleVote(designId: string) {
    setIsVoting(designId);
    setErrorMessage("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/userDesign/${designId}`,
        {
          method: "PATCH",
        },
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || "Failed to vote for this entry.");
      }

      setEntries((current) =>
        current
          .map((entry) =>
            entry._id === designId
              ? { ...entry, vote: Number(entry.vote ?? 0) + 1 }
              : entry,
          )
          .sort((a, b) => b.vote - a.vote),
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";

      setErrorMessage(message);
      Swal.fire({
        icon: "error",
        title: "Voting failed",
        text: message,
        confirmButtonColor: "#c2410c",
        timer: 2500,
        showConfirmButton: false,
      });
    } finally {
      setIsVoting(null);
    }
  }

  const isBusy = status === "uploading" || status === "saving";
  const isFull = Boolean(maxEntries && entryCount >= maxEntries);

  return (
    <section suppressHydrationWarning className="card p-8">
      <div className="flex items-center gap-2">
        <ImagePlus size={20} className="text-[var(--primary)]" />
        <h2 className="card-title">Submit Your Design</h2>
      </div>

      <p className="mt-2 text-sm text-[var(--muted)]">
        Upload one design entry for this internal contest. Each user can submit
        only once.
      </p>

      <p className="mt-2 text-sm text-[var(--muted)]">
        Entries: {entryCount}
        {maxEntries ? ` / ${maxEntries}` : ""}
      </p>

      {isFull ? (
        <p className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-700">
          The maximum number of entries has been reached.
        </p>
      ) : alreadySubmitted ? (
        <p className="mt-5 flex items-center gap-2 text-sm font-medium text-green-600">
          <CheckCircle2 size={16} /> You have already submitted an entry.
        </p>
      ) : null}

      {!isFull && !alreadySubmitted ? (
        <form
          suppressHydrationWarning
          onSubmit={handleSubmit}
          className="mt-5 flex flex-col gap-4"
        >
          <input
            value={entryTitle}
            onChange={(event) => setEntryTitle(event.target.value)}
            placeholder="Entry title"
            className="input-soft w-full rounded-xl border p-3"
            required
          />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-[var(--border)] px-4 py-3 text-sm text-[var(--muted)] transition hover:border-[var(--primary)]/50">
              <UploadCloud
                size={20}
                className="flex-shrink-0 text-[var(--primary)]"
              />
              <span className="truncate">
                {file ? file.name : "Choose an image to upload"}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            <button
              type="submit"
              disabled={!file || !entryTitle.trim() || isBusy}
              className="primary-btn flex flex-shrink-0 items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isBusy ? <Loader2 size={16} className="animate-spin" /> : null}
              {status === "uploading"
                ? "Uploading..."
                : status === "saving"
                  ? "Submitting..."
                  : "Submit Design"}
            </button>
          </div>

          {previewUrl ? (
            <div className="h-40 w-32 overflow-hidden rounded-2xl border border-[var(--border)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Design preview"
                className="h-full w-full object-cover"
              />
            </div>
          ) : null}
        </form>
      ) : null}

      {status === "success" ? (
        <p className="mt-3 flex items-center gap-2 text-sm font-medium text-green-600">
          <CheckCircle2 size={16} />
          Your design has been submitted. Good luck!
        </p>
      ) : null}

      <div className="mt-8 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-[var(--foreground)]">
            Contest Entries
          </h3>
          <span className="rounded-full bg-[var(--primary)]/10 px-3 py-1 text-xs font-semibold text-[var(--primary)]">
            {entries.length} submitted
          </span>
        </div>

        {entries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--background)]/40 p-6 text-sm text-[var(--muted)]">
            No entries have been submitted yet. Be the first to join this
            contest.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {entries.map((design) => (
              <article
                key={design._id}
                className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm"
              >
                <div className="aspect-[4/3] overflow-hidden bg-[var(--background)]">
                  {design.imgUrl ? (
                    <img
                      src={design.imgUrl}
                      alt={design.entryTitle ?? "Contest entry"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-[var(--muted)]">
                      Entry image
                    </div>
                  )}
                </div>

                <div className="space-y-3 p-4">
                  <div>
                    <h4 className="text-base font-semibold text-[var(--foreground)]">
                      {design.entryTitle ?? "Untitled entry"}
                    </h4>
                    <p className="text-sm text-[var(--muted)]">
                      By {design.username ?? "Unknown user"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleVote(design._id)}
                    disabled={isVoting === design._id}
                    className="inline-flex items-center gap-2 rounded-full bg-[var(--primary)]/10 px-3 py-1.5 text-sm font-semibold text-[var(--primary)] transition hover:bg-[var(--primary)] hover:text-white disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isVoting === design._id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <ThumbsUp size={16} />
                    )}
                    Vote • {Number(design.vote ?? 0)}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {status === "error" ? (
        <p className="mt-3 text-sm font-medium text-red-500">{errorMessage}</p>
      ) : null}
    </section>
  );
}
