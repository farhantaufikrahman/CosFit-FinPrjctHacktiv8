"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GetEvent } from "@/app/types";
import { Edit, Trash2, Users, Calendar, MapPin } from "lucide-react";
import Swal from "sweetalert2";

export default function EventTable({
  events: initialEvents,
}: {
  events: GetEvent[];
}) {
  const router = useRouter();
  const [events, setEvents] = useState(initialEvents);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(intervalId);
  }, []);

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Delete this event?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it",
    });

    if (!result.isConfirmed) return;

    setIsDeleting(id);
    try {
      const res = await fetch(`/api/admin/events/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setEvents((prev) => prev.filter((ev) => ev._id !== id));
        router.refresh();
        await Swal.fire({
          icon: "success",
          title: "Event deleted",
          text: "The event has been removed successfully.",
          confirmButtonColor: "#c2410c",
          timer: 2200,
          showConfirmButton: false,
        });
      } else {
        await Swal.fire({
          icon: "error",
          title: "Failed to delete event",
          text: "Please try again later.",
          confirmButtonColor: "#c2410c",
        });
      }
    } catch (error) {
      console.error(error);
      await Swal.fire({
        icon: "error",
        title: "System error",
        text: "An unexpected error occurred while deleting the event.",
        confirmButtonColor: "#c2410c",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted">
        <Calendar className="mb-4 h-12 w-12 opacity-20" />
        <p>Belum ada event yang ditambahkan.</p>
      </div>
    );
  }

  const getTimeStatus = (ev: GetEvent) => {
    const startDate = ev.startDate ? new Date(ev.startDate) : null;
    const endDate = ev.endDate ? new Date(ev.endDate) : null;

    if (!startDate || Number.isNaN(startDate.getTime())) {
      return {
        label: "Date not set",
        className: "border border-slate-200 bg-slate-100 text-slate-600",
      };
    }

    if (now < startDate) {
      const diff = startDate.getTime() - now.getTime();
      return {
        label: `Starts in ${formatDuration(diff)}`,
        className: "border border-emerald-200 bg-emerald-50 text-emerald-700",
      };
    }

    if (endDate && !Number.isNaN(endDate.getTime()) && now < endDate) {
      const diff = endDate.getTime() - now.getTime();
      return {
        label: `Ongoing, ends in ${formatDuration(diff)}`,
        className: "border border-sky-200 bg-sky-50 text-sky-700",
      };
    }

    return {
      label: "Event ended",
      className: "border border-slate-200 bg-slate-100 text-slate-600",
    };
  };

  const formatDuration = (diffMs: number) => {
    const totalMinutes = Math.max(0, Math.floor(diffMs / 60_000));
    const days = Math.floor(totalMinutes / (24 * 60));
    const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
    const minutes = totalMinutes % 60;

    const parts: string[] = [];

    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0 || parts.length === 0) parts.push(`${minutes}m`);

    return parts.join(" ");
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-muted">
        <thead className="border-b border-border bg-[#FCFBFA] text-xs uppercase text-foreground">
          <tr>
            <th className="px-4 py-4 font-medium">Event Detail</th>
            <th className="px-4 py-4 font-medium">Tipe / Status</th>
            <th className="px-4 py-4 font-medium">Tanggal & Status</th>
            <th className="px-4 py-4 font-medium text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {events.map((ev) => {
            const timeStatus = getTimeStatus(ev);

            return (
              <tr key={ev._id} className="transition-colors hover:bg-[#FCFBFA]">
                {/* Info Produk & Gambar */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-4">
                    {ev.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={ev.coverImage}
                        alt={ev.title}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-background">
                        <Calendar className="h-5 w-5 text-muted" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-foreground line-clamp-1">
                        {ev.title}
                      </p>
                      {ev.locationName && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-muted">
                          <MapPin className="h-3 w-3" />
                          {ev.locationName}
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                {/* Tipe Event & Status */}
                <td className="px-4 py-4">
                  <div className="flex flex-col gap-2 items-start">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                        ev.eventType === "internal_contest"
                          ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                          : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      }`}
                    >
                      {ev.eventType === "internal_contest"
                        ? "Internal Contest"
                        : "External Convention"}
                    </span>

                    {ev.eventType === "internal_contest" && ev.status && (
                      <span className="rounded-full bg-surface px-2.5 py-1 text-[10px] font-semibold uppercase text-foreground">
                        {ev.status}
                      </span>
                    )}
                  </div>
                </td>

                {/* Tanggal */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <p className="text-foreground">
                    {(() => {
                      const startDate = ev.startDate
                        ? new Date(ev.startDate)
                        : null;
                      if (!startDate || Number.isNaN(startDate.getTime())) {
                        return "Date not set";
                      }

                      return startDate.toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      });
                    })()}
                  </p>
                  {ev.endDate && (
                    <p className="text-xs text-muted">
                      to{" "}
                      {new Date(ev.endDate).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  )}
                  <div
                    className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${timeStatus.className}`}
                  >
                    {timeStatus.label}
                  </div>
                </td>

                {/* Aksi (Actions) */}
                <td className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {/* Tombol View Entries (HANYA MUNCUL JIKA KONTES) */}
                    {ev.eventType === "internal_contest" && (
                      <Link
                        href={`/admin/events/${ev._id}/entries`}
                        className="flex items-center gap-1.5 rounded-lg bg-indigo-500/10 px-3 py-2 text-xs font-medium text-indigo-400 transition hover:bg-indigo-500/20"
                        title="View Contest Participants"
                      >
                        <Users className="h-4 w-4" />
                        Entries
                      </Link>
                    )}

                    {/* Tombol Edit */}
                    <Link
                      href={`/admin/events/${ev._id}/edit`}
                      className="rounded-lg p-2 text-muted transition hover:bg-background hover:text-foreground"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>

                    {/* Tombol Delete */}
                    <button
                      onClick={() => handleDelete(ev._id)}
                      disabled={isDeleting === ev._id}
                      className="rounded-lg p-2 text-muted transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
