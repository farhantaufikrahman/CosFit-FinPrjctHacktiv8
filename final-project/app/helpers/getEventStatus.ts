export function getEventStatus(startDate?: string, endDate?: string) {
  const now = new Date();
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  if (!start || Number.isNaN(start.getTime())) {
    return {
      label: "Tanggal belum ditentukan",
      colorClass: "bg-slate-500/90 text-white",
    };
  }

  const validEnd = end && !Number.isNaN(end.getTime()) ? end : null;
  const hasValidEnd = validEnd !== null;

  if (validEnd && now > validEnd) {
    return {
      label: "Selesai",
      colorClass: "bg-slate-500/90 text-white",
    };
  }

  if (validEnd && now >= start && now <= validEnd) {
    return {
      label: "Sedang Berlangsung",
      colorClass: "bg-emerald-600/90 text-white",
    };
  }

  if (!hasValidEnd && now >= start) {
    return {
      label: "Sedang Berlangsung",
      colorClass: "bg-emerald-600/90 text-white",
    };
  }

  const diffMs = start.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return {
      label: "Mulai Hari Ini",
      colorClass: "bg-amber-500/90 text-white",
    };
  }

  if (diffDays < 7) {
    return {
      label: `Mulai dalam ${diffDays} hari`,
      colorClass: "bg-sky-600/90 text-white",
    };
  }

  return {
    label: start.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    colorClass: "bg-slate-800/90 text-white",
  };
}
