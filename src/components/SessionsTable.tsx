"use client";

import clsx from "clsx";
import { Calendar, Clock, List, Play, Sparkles, Users } from "lucide-react";
import StatusBadge from "./StatusBadge";

interface Session {
  id: string;
  fellow_name: string;
  session_date: string;
  groupSize: number;
  status: "CREATED" | "ANALYZED" | "REVIEWED" | "ESCALATED";
}

interface SessionsTableProps {
  sessions: Session[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onSelectTranscript: (session: Session) => void;
  onSelectSummary: (session: Session) => void;
  loading?: boolean;
}

export default function SessionsTable({
  sessions,
  page,
  totalPages,
  onPageChange,
  onSelectTranscript,
  onSelectSummary,
  loading = false,
}: SessionsTableProps) {
  const formatDate = (iso: string) => {
    const date = new Date(iso);
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const formatTime = (iso: string) => {
    const date = new Date(iso);
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="space-y-4 relative">
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-50 rounded-2xl">
          <div className="w-10 h-10 border-4 border-lime-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Session Cards */}
      <div className="space-y-6">
        {sessions?.length === 0 ? (
          <EmptyState message="No sessions found." />
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className={clsx(
                "rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all duration-200",
                "border border-slate-300 bg-white"
              )}
            >
              <div className="flex-1 space-y-2">
             
                <div className="flex items-center gap-3">
                  <span className="text-lg font-semibold text-primary truncate">
                    {session.fellow_name}
                  </span>
                  <StatusBadge status={session.status} />
                </div>

                <div className="flex flex-wrap items-center text-sm text-slate-700">
  <div className="flex items-center gap-1 before:content-['•'] before:mx-2 before:text-slate-400 first:before:hidden">
    <Calendar size={14} />
    <span>{formatDate(session.session_date)}</span>
  </div>

  <div className="flex items-center gap-1 before:content-['•'] before:mx-2 before:text-slate-400 first:before:hidden">
    <Clock size={14} />
    <span>{formatTime(session.session_date)}</span>
  </div>

  <div className="flex items-center gap-1 before:content-['•'] before:mx-2 before:text-slate-400 first:before:hidden">
    <Users size={14} />
    <span>{session.group_id}</span>
  </div>
</div>

              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-3 sm:mt-0">
                <button
                  onClick={() => onSelectTranscript(session)}
                  className="
      flex items-center gap-2
      px-4 py-2 rounded-md
      border border-slate-300
      text-primary font-medium
      hover:bg-slate-50 hover:text-primary
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-slate-200
    "
                >
                  <Play size={18} />
                  View transcript
                </button>

                <button
                  onClick={() => onSelectSummary(session)}
                  className="
      flex items-center gap-2
      px-4 py-2 rounded-md
      bg-primary text-white font-medium
      hover:bg-primary
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-slate-300
    "
                >
                  <Sparkles size={18} />
                  {session.status === "CREATED"
                    ? "Process session"
                    : "View insights"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="flex justify-end gap-2 mt-4">
      <button
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className="px-3 py-1 rounded border border-slate-300 disabled:opacity-50"
      >
        Previous
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={clsx(
            "px-3 py-1 rounded border transition",
            page === p
              ? "bg-lime-600 text-white border-lime-600"
              : "border-slate-300 hover:bg-slate-50"
          )}
        >
          {p}
        </button>
      ))}
      <button
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        className="px-3 py-1 rounded border border-slate-300 disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}

function EmptyState({ message }: { message?: string }) {
  return (
    <div className="text-center py-10">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
        <List size={32} className="text-slate-500" />
      </div>
      <p className="text-slate-500">{message || "No data found."}</p>
    </div>
  );
}
