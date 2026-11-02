"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import EventCategoryCombobox from "@/components/admin/EventCategoryCombobox";
import { EventType, GetEvent } from "@/app/types";
import { Save, ArrowLeft, Calendar as CalendarIcon } from "lucide-react";
import Link from "next/link";
import DatePicker from "react-datepicker";
import Swal from "sweetalert2";
import "react-datepicker/dist/react-datepicker.css";

interface AdminEventFormData {
  title: string;
  description: string;
  category: string;
  coverImage: string;
  eventType: EventType;
  startDate: string;
  endDate: string;
  locationName: string;
  address: string;
  externalLink: string;
  maxEntries: string;
  status: "upcoming" | "active" | "ended";
}

interface EventFormProps {
  initialData?: GetEvent | null;
}

const DEFAULT_EVENT_CATEGORIES = [
  "Contest",
  "Convention",
  "Workshop",
  "Fashion",
  "Photography",
  "Gathering",
];

export default function EventForm({ initialData }: EventFormProps) {
  const router = useRouter();
  const isEditMode = !!initialData;

  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<string[]>(() => {
    const options = [...DEFAULT_EVENT_CATEGORIES];
    const initialCategories = initialData?.category
      ? initialData.category
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : [];

    initialCategories.forEach((category) => {
      if (!options.includes(category)) {
        options.push(category);
      }
    });

    return options;
  });
  const [categoryTags, setCategoryTags] = useState<string[]>(() => {
    return initialData?.category
      ? initialData.category
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : [];
  });

  const [startDate, setStartDate] = useState<Date | null>(
    initialData?.startDate ? new Date(initialData.startDate) : null,
  );
  const [endDate, setEndDate] = useState<Date | null>(
    initialData?.endDate ? new Date(initialData.endDate) : null,
  );
  const [formData, setFormData] = useState<AdminEventFormData>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    category: initialData?.category || "",
    coverImage: initialData?.coverImage || "",
    eventType: initialData?.eventType || "internal_contest",
    startDate: initialData?.startDate
      ? new Date(initialData.startDate).toISOString().slice(0, 16)
      : "",
    endDate: initialData?.endDate
      ? new Date(initialData.endDate).toISOString().slice(0, 16)
      : "",
    // Khusus External Convention
    locationName: initialData?.locationName || "",
    address: initialData?.address || "",
    externalLink: initialData?.externalLink || "",
    maxEntries:
      initialData?.maxEntries !== undefined
        ? String(initialData.maxEntries)
        : "",
    // Khusus Internal Contest
    status: initialData?.status || "upcoming",
  });

  const currentCoverImage =
    formData.coverImage || initialData?.coverImage || "";

  const handleCategoryChange = (nextValue: string[]) => {
    setCategoryTags(nextValue);
    setFormData((prev) => ({
      ...prev,
      category: nextValue.join(", "),
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData(
      (prev) =>
        ({
          ...prev,
          [name]: value,
        }) as AdminEventFormData,
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let coverImageUrl = formData.coverImage;

      if (selectedCoverFile) {
        setUploadingImage(true);
        const uploadForm = new FormData();
        console.log(selectedCoverFile);
        uploadForm.append("image", selectedCoverFile);

        const uploadRes = await fetch(`/api/admin/events/upload`, {
          method: "POST",
          body: uploadForm,
        });

        if (!uploadRes.ok) {
          const err = await uploadRes.json();
          throw new Error(err.message || "Gagal upload cover image");
        }

        const uploadData = await uploadRes.json();
        coverImageUrl = uploadData.url;
        setFormData((prev) => ({
          ...prev,
          coverImage: uploadData.url,
        }));
      }

      const url = isEditMode
        ? `/api/admin/events/${initialData?._id}`
        : `/api/admin/events`;
      const method = isEditMode ? "PUT" : "POST";

      const payload = {
        ...formData,
        coverImage: coverImageUrl,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Gagal menyimpan event");
      }

      await Swal.fire({
        icon: "success",
        title: isEditMode ? "Event updated" : "Event created",
        text: isEditMode
          ? "The event has been updated successfully."
          : "The event has been created successfully.",
        confirmButtonColor: "#c2410c",
      });
      router.push("/admin/events");
      router.refresh();
    } catch (error: unknown) {
      console.error(error);
      await Swal.fire({
        icon: "error",
        title: "Failed to save event",
        text: error instanceof Error ? error.message : "Gagal menyimpan event",
        confirmButtonColor: "#c2410c",
      });
    } finally {
      setUploadingImage(false);
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 rounded-3xl border border-border bg-surface p-6 md:p-8 shadow-card"
    >
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/events"
            className="rounded-full bg-background p-2 text-muted transition hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h2 className="text-2xl font-semibold text-foreground">
            {isEditMode ? "Edit Event" : "Create New Event"}
          </h2>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Kolom Kiri: Info Utama */}
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-muted">
              Tipe Event
            </label>
            <select
              name="eventType"
              value={formData.eventType}
              onChange={handleChange}
              className="w-full rounded-xl border border-border bg-white p-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="internal_contest">
                Internal Contest (Vote Karya)
              </option>
              <option value="external_convention">
                External Convention (Event Luar)
              </option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-muted">
              Judul Event
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full rounded-xl border border-border bg-white p-3 text-sm text-foreground focus:border-primary focus:outline-none"
              placeholder="Contoh: Cosplay Summer Fest 2024"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-muted">
              Kategori Event
            </label>
            <EventCategoryCombobox
              value={categoryTags}
              onChange={handleCategoryChange}
              options={categoryOptions}
              setOptions={setCategoryOptions}
              placeholder="Ex: Contest, Convention, Workshop"
            />
          </div>

          {/* forumId is created automatically when creating an event; no admin input needed */}

          <div>
            <label className="mb-2 block text-sm font-medium text-muted">
              Deskripsi
            </label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="w-full rounded-xl border border-border bg-white p-3 text-sm text-foreground focus:border-primary focus:outline-none"
              placeholder="Ceritakan detail event ini..."
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-muted">
              Cover Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setSelectedCoverFile(file);
              }}
              className="w-full rounded-xl border border-border bg-white p-3 text-sm text-foreground focus:border-primary focus:outline-none"
            />
            <p className="mt-2 text-xs text-muted">
              {currentCoverImage
                ? "Gambar baru akan diupload ke Blob saat submit."
                : "Pilih file gambar untuk cover event."}
            </p>
          </div>
        </div>

        {/* Kolom Kanan: Jadwal & Conditional Fields */}
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            {/* Kalender Start Date */}
            <div className="relative">
              <label className="mb-2 block text-sm font-medium text-muted">
                Tanggal Mulai
              </label>
              <div className="relative">
                <DatePicker
                  selected={startDate}
                  onChange={(date: Date | null) => {
                    setStartDate(date);
                    setFormData((prev) => ({
                      ...prev,
                      startDate: date ? date.toISOString().slice(0, 16) : "",
                    }));
                  }}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={30}
                  dateFormat="d MMMM yyyy, HH:mm"
                  placeholderText="Pilih tanggal & jam"
                  className="w-full rounded-xl border border-border bg-white p-3 pl-10 text-sm text-foreground focus:border-primary focus:outline-none"
                />
                <CalendarIcon
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted"
                  pointerEvents="none"
                />
              </div>
            </div>

            {/* Kalender End Date */}
            <div className="relative">
              <label className="mb-2 block text-sm font-medium text-muted">
                Tanggal Selesai
              </label>
              <div className="relative">
                <DatePicker
                  selected={endDate}
                  onChange={(date: Date | null) => {
                    setEndDate(date);
                    setFormData((prev) => ({
                      ...prev,
                      endDate: date ? date.toISOString().slice(0, 16) : "",
                    }));
                  }}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={30}
                  dateFormat="d MMMM yyyy, HH:mm"
                  placeholderText="Select date (Optional)"
                  className="w-full rounded-xl border border-border bg-white p-3 pl-10 text-sm text-foreground focus:border-primary focus:outline-none"
                />
                <CalendarIcon
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted"
                  pointerEvents="none"
                />
              </div>
            </div>
          </div>

          {/* === FIELD KHUSUS INTERNAL CONTEST === */}
          {formData.eventType === "internal_contest" && (
            <div className="rounded-2xl border border-[#D9BCE1] bg-[#FCF8FF] p-4">
              <h3 className="mb-4 text-sm font-semibold text-primary">
                Internal Contest Settings
              </h3>
              <div>
                <label className="mb-2 block text-sm font-medium text-muted">
                  Contest Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-border bg-white p-3 text-sm text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="upcoming">Upcoming (Akan Datang)</option>
                  <option value="active">Active (Sedang Berjalan)</option>
                  <option value="ended">Ended (Berakhir)</option>
                </select>
              </div>
              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium text-muted">
                  Maximum Participant Entries
                </label>
                <input
                  type="number"
                  name="maxEntries"
                  min="1"
                  value={formData.maxEntries}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-border bg-white p-3 text-sm text-foreground focus:border-primary focus:outline-none"
                  placeholder="Leave blank for no limit"
                />
                <p className="mt-2 text-xs text-muted">
                  Each user can still submit only one entry.
                </p>
              </div>
              <p className="mt-3 text-xs text-muted">
                * Entries/work submissions will be filled automatically when
                users submit from the public app page.
              </p>
            </div>
          )}

          {/* === FIELD KHUSUS EXTERNAL CONVENTION === */}
          {formData.eventType === "external_convention" && (
            <div className="space-y-4 rounded-2xl border border-[#D9E8FF] bg-[#F7FAFF] p-4">
              <h3 className="text-sm font-semibold text-primary">
                Informasi Lokasi Event Luar
              </h3>
              <div>
                <label className="mb-2 block text-sm font-medium text-muted">
                  Nama Lokasi / Venue
                </label>
                <input
                  type="text"
                  name="locationName"
                  value={formData.locationName}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-border bg-white p-3 text-sm text-foreground focus:border-primary focus:outline-none"
                  placeholder="Ex: Jakarta Convention Center"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-muted">
                  Alamat Lengkap
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-border bg-white p-3 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-muted">
                  Link Tiket / Info (External URL)
                </label>
                <input
                  type="url"
                  name="externalLink"
                  value={formData.externalLink}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-border bg-white p-3 text-sm text-foreground focus:border-primary focus:outline-none"
                  placeholder="https://..."
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-4 border-t border-border pt-6">
        <Link
          href="/admin/events"
          className="rounded-xl px-5 py-2.5 text-sm font-medium text-muted transition hover:text-foreground"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-white transition hover:bg-secondary disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {isLoading || uploadingImage ? "Menyimpan..." : "Simpan Event"}
        </button>
      </div>
    </form>
  );
}
