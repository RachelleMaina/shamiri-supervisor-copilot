import clsx from "clsx";
import { Search } from "lucide-react";

interface TableHeaderProps {
  nameFilter: string;
  setNameFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
}

export default function TableHeader({
  nameFilter,
  setNameFilter,
  statusFilter,
  setStatusFilter,
}: TableHeaderProps) {
  const statusOptions = [
    { label: "New", value: "CREATED" },
    { label: "Processed", value: "ANALYZED" },
    { label: "Reviewed", value: "REVIEWED" },
    { label: "Escalated", value: "ESCALATED" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <h2 className="text-2xl font-semibold text-primary">All Sessions</h2>

        <div className="relative w-full sm:w-72">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search by fellow name..."
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            className="
              w-full pl-9 pr-4 py-2.5
              bg-white border border-slate-300 rounded-full
              text-sm text-slate-700 placeholder-slate-500
              focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-200/40
              transition
            "
          />
        </div>
      </div>

      <div className="inline-flex bg-slate-200 p-1 rounded-full mb-8 shadow-sm">
        {statusOptions.map((option) => {
          const active = statusFilter === option.value;

          return (
            <button
              key={option.value}
              onClick={() => setStatusFilter(option.value)}
              className={clsx(
                "px-4 py-2 text-sm font-medium rounded-full flex-shrink-0 transition-all duration-200",
                active
                  ? "bg-white text-primary shadow-md"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
