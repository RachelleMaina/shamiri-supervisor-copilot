import { Calendar } from "lucide-react";

interface PageHeaderProps {
  title: string;
}

export default function PageHeader({ title }: PageHeaderProps) {
  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="mb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">

 
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold text-primary tracking-tight">
            {title}
          </h1>
          <div className="mt-2 h-1 w-16 bg-lime-400 rounded-full opacity-80" />
        </div>

        <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-full border border-slate-200">
          <Calendar size={18} className="text-primary" />
          <span className="text-sm font-medium text-primary">
            {today}
          </span>
        </div>

      </div>
    </div>
  );
}
