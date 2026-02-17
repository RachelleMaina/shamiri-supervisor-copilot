import { format } from "date-fns";
import { Play } from "lucide-react";
import Modal from "./Modal";

interface TranscriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: any;
}

export default function TranscriptModal({
  isOpen,
  onClose,
  session,
}: TranscriptModalProps) {
  if (!session) return null;

  const sessionDate = new Date(session.session_date);
  const formattedDate = format(sessionDate, "MMMM dd, yyyy");
  const formattedTime = format(sessionDate, "hh:mm a");

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${session.fellow_name} - Session Transcript`}
      size="xl"
      height="full"
    >
      <div className="flex flex-col h-full bg-slate-50">
      
        <div className="bg-slate-100 border-b border-slate-200 px-6 py-3 flex items-center justify-between text-sm text-primary">
          <div className="flex items-center gap-6">
            <div>
              <span className="font-medium text-primary">Duration:</span> ~45
              min
            </div>
            <div>
              <span className="font-medium text-primary">Words:</span>{" "}
              {session.transcript.split(/\s+/).length.toLocaleString()}
            </div>
          </div>
          <div className="text-primary text-xs italic">
            {formattedDate} at {formattedTime}
          </div>
        </div>

        {/* Dummy Audio Player */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center gap-4 max-w-3xl mx-auto">
            <button className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary transition">
              <Play size={24} />
            </button>
            <div className="flex-1">
              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="w-3/5 h-full bg-primary rounded-full" />
              </div>
              <div className="flex justify-between text-xs text-primary mt-1.5">
                <span>12:34</span>
                <span>45:12</span>
              </div>
            </div>
            <button className="text-primary hover:text-primary transition">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              </svg>
            </button>
          </div>
        </div>

    
<div className="flex-1 overflow-y-auto p-6">
  <div className="max-w-4xl mx-auto">
    <div className="space-y-3 text-sm leading-relaxed text-primary">
      {session.transcript ? (
        session.transcript.split("\n").map((line, index) => (
          <div
            key={index}
            className="px-4 py-1 rounded transition hover:bg-slate-100/50"
          >
            {line.trim() ? (
              <p className="whitespace-pre-wrap">{line}</p>
            ) : (
              <span className="text-slate-300 italic">...</span>
            )}
          </div>
        ))
      ) : (
        <p className="text-primary text-center py-12 italic">
          No transcript available.
        </p>
      )}
    </div>

    <div className="text-center py-8 text-slate-400 text-sm italic">
      - End of session -
    </div>
  </div>
</div>

      </div>
    </Modal>
  );
}
