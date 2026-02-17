"use client";

import clsx from "clsx";

type Status = "CREATED" | "ANALYZED" | "REVIEWED" | "ESCALATED" | string;

interface StatusBadgeProps {
  status?: Status;
  className?: string;
}

// Use darker bg shades and stronger text contrast
const STATUS_STYLES: Record<string, string> = {
  created: "bg-lime-200 text-lime-900",
  analyzed: "bg-blue-200 text-blue-900",
  reviewed: "bg-emerald-200 text-emerald-900",
  escalated: "bg-red-200 text-red-900",
};

function formatLabel(status: string) {
  const normalized = status.toLowerCase();

  if (normalized === "created") return "New";
  if (normalized === "analyzed") return "Processed";
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export default function StatusBadge({
  status = "CREATED",
  className,
}: StatusBadgeProps) {
  const normalized = status.toLowerCase();

  return (
    <span
      className={clsx(
        "inline-flex items-center justify-center",
        "px-3 py-1",
        "text-xs font-medium",
        "rounded-full",
        "tracking-normal",
        STATUS_STYLES[normalized] ?? "bg-slate-300 text-slate-900",
        className
      )}
    >
      {formatLabel(status)}
    </span>
  );
}
