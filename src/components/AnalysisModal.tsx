import clsx from "clsx";
import { CheckCircle, Sparkles } from "lucide-react";
import { useState } from "react";
import ConfirmDialog from "./ConfirmDialog";
import Modal from "./Modal";

interface ScoreBlock {
  score: number;
  reasoning: string;
}

interface AiAnalysis {
  risk_flag: "SAFE" | "RISK";
  overall_quality: number;

  content_coverage: ScoreBlock;
  facilitation_quality: ScoreBlock;
  protocol_safety: ScoreBlock;

  summary: string;
  risk_quote: string | null;
}

interface SupervisorReview {
  id: string;
  supervisor_id: string;
  action: "VALIDATE" | "REJECT";
  notes?: string | null;
  created_at: string;
}

interface Session {
  id: string;
  fellow_name: string;

  ai_analysis?: AiAnalysis;
  supervisor_review?: SupervisorReview;
}

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: Session | null;
  isAnalyzing: boolean;
  onAnalyze: (sessionId: string) => void;
  supervisorId: number;
  onSubmitReview: (payload: {
    supervisor_id: string;
    decision: "VALIDATE" | "REJECT";
    comments: string | null;
  }) => void;
  rejectNote: string;
  setRejectNote: (note: string) => void;
}

export default function AnalysisModal({
  isOpen,
  onClose,
  session,
  isAnalyzing,
  onAnalyze,
  supervisorId,
  onSubmitReview,
  rejectNote,
  setRejectNote,
}: AnalysisModalProps) {
  const [showValidateConfirm, setShowValidateConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);

  const handleValidate = () => {
    setShowValidateConfirm(true);
  };

  const confirmValidate = () => {
    onSubmitReview({
      supervisor_id: supervisorId,
      decision: "VALIDATE",
      comments: null,
    });
    setShowValidateConfirm(false);
  };

  const handleReject = () => {
    onSubmitReview({
      supervisor_id: supervisorId,
      decision: "REJECT",
      comments: rejectNote,
    });
    setShowRejectConfirm(false);
    setRejectNote("");
  };

  if (!session) return null;
  const hasAnalysis = !!session.ai_analysis;
  const hasReview = !!session.supervisor_review;
  const currentRiskFlag = session.ai_analysis?.risk_flag || "SAFE";
  const isCurrentSafe = currentRiskFlag === "SAFE";
  const overrideTo = isCurrentSafe ? "Risk" : "Safe";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Session Insight Card - ${session.fellow_name}`}
      size="lg"
      height="auto"
    >
      <div className="p-8 space-y-10 bg-slate-50">
        {/* Already Reviewed State */}
        {hasReview && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="flex items-start justify-between flex-wrap gap-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                  <CheckCircle size={16} className="text-primary" />
                </div>
                <h4 className="font-semibold text-primary">
                  Supervisor Review Completed
                </h4>
              </div>

              <span
  className={clsx(
    "px-3 py-1 rounded-full text-xs font-medium border",
    session.supervisor_review?.action === "VALIDATE"
      ? "bg-lime-200 text-lime-900 border-lime-300"
      : "bg-red-200 text-red-900 border-red-300"
  )}
>
  {session.supervisor_review?.action === "VALIDATE"
    ? "Validated AI Risk Assessment"
    : "Rejected AI Risk Assessment"}
</span>

            </div>

            <div className="space-y-3 text-sm text-primary">
              {session.supervisor_review?.notes && (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">
                    Supervisor Note
                  </p>
                  <p className="text-sm text-primary leading-relaxed">
                    {session.supervisor_review.notes}
                  </p>
                </div>
              )}

              <p className="text-xs text-slate-500">
                Reviewed on{" "}
                {session.supervisor_review?.created_at &&
                  new Date(
                    session.supervisor_review?.created_at
                  ).toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* Header + Summary */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          {/* Title Row */}
          <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <Sparkles size={18} className="text-primary" />
              </div>

              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-primary">
                  AI Session Insight
                </h3>

                {hasAnalysis && (
           <span
           className={clsx(
             "px-3 py-1 rounded-full text-xs font-medium border",
             currentRiskFlag === "RISK"
               ? "bg-red-200 text-red-900 border-red-300"
               : "bg-lime-200 text-lime-900 border-lime-300"
           )}
         >
           {currentRiskFlag === "RISK" ? "Risk" : "Safe"}
         </span>
         
                )}
              </div>
            </div>

            {/* Performance Score */}
            {/* {hasAnalysis && (
              <div className="px-4 py-2 rounded-full bg-primary text-white text-sm font-medium">
              Overall Score:  {session.ai_analysis?.overall_quality}/3
              </div>
            )} */}
          </div>

          {/* AI Summary */}
          {hasAnalysis ? (
          <div className="bg-lime-200 border border-lime-300 rounded-xl p-4 shadow-sm">
          <p className="text-sm text-primary leading-relaxed whitespace-pre-line">
            {session.ai_analysis?.summary}
          </p>
        </div>
        
          ) : isAnalyzing ? (
            <div className="py-8 text-center">
              <div className="inline-flex flex-col items-center gap-3 text-slate-600">
                <Sparkles size={20} className="animate-pulse text-primary" />
                <span className="font-medium">Processing session...</span>

                <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden mt-2 relative">
                  <div className="absolute h-2 w-1/2 bg-primary rounded-full animate-slide"></div>
                </div>

                <style jsx>{`
                  @keyframes slide {
                    0% {
                      transform: translateX(-100%);
                    }
                    100% {
                      transform: translateX(100%);
                    }
                  }
                  .animate-slide {
                    animation: slide 1.5s linear infinite;
                  }
                `}</style>
              </div>

              <p className="text-sm text-slate-600 mt-4">
                This usually takes 30-60 seconds. Please don&apos;t close.
              </p>
            </div>
          ) : (
            <div className="py-8 text-center space-y-4">
              <div className="mx-auto w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
                <Sparkles size={22} className="text-primary" />
              </div>
              <h4 className="text-lg font-medium text-primary">
                Session not yet processed
              </h4>
              <p className="text-sm text-slate-600 max-w-sm mx-auto">
                This session has not been processed. Click below to generate AI
                insights.
              </p>
              <button
                onClick={() => onAnalyze(session.id)}
                disabled={isAnalyzing}
                className="mt-4 px-8 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary transition flex items-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles size={18} />
                Process Session
              </button>
            </div>
          )}

          {/* Risk Quote */}
          {hasAnalysis &&
            session.ai_analysis?.risk_flag === "RISK" &&
            session.ai_analysis.risk_quote && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 space-y-4 mt-8">
                <h4 className="text-sm font-semibold text-red-800">
                  Flagged Risk Quote
                </h4>
                <p className="text-sm italic text-red-700 border-l-4 border-red-300 pl-4">
                  {session.ai_analysis.risk_quote}
                </p>
              </div>
            )}
        </div>

        {/* Metric Cards */}
        {hasAnalysis && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Content Coverage
                </p>
                <p className="text-3xl font-semibold text-primary">
                  {session.ai_analysis?.content_coverage.score}/3
                </p>
                <p className="text-sm text-slate-600">
                  {session.ai_analysis?.content_coverage.rating}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Facilitation Quality
                </p>
                <p className="text-3xl font-semibold text-primary">
                  {session.ai_analysis?.facilitation_quality.score}/3
                </p>
                <p className="text-sm text-slate-600">
                  {session.ai_analysis?.facilitation_quality.rating}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Protocol Safety
                </p>
                <p className="text-3xl font-semibold text-primary">
                  {session.ai_analysis?.protocol_safety.score}/3
                </p>
                <p className="text-sm text-slate-600">
                  {session.ai_analysis?.protocol_safety.rating}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Supervisor Action - only if not reviewed */}
        {hasAnalysis && !hasReview && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
            <h4 className="text-sm font-semibold text-primary">
              Supervisor Decision
            </h4>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleValidate}
                className="flex-1 px-6 py-3 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary transition"
              >
                Validate Assessment
              </button>

              <button
                onClick={() => setShowRejectConfirm(true)}
                className="flex-1 px-6 py-3 rounded-xl border border-red-300 text-red-700 text-sm font-medium hover:bg-red-50 transition"
              >
                Reject Assessment
              </button>
            </div>
          </div>
        )}

        {/* Validate Confirm */}
        {showValidateConfirm && (
          <ConfirmDialog
            title="Validate AI Assessment"
            message="Are you sure you want to validate and accept this AI assessment?"
            confirmLabel="Validate"
            cancelLabel="Cancel"
            onConfirm={confirmValidate}
            onCancel={() => setShowValidateConfirm(false)}
            destructive={false}
          />
        )}

        {/* Reject Confirm */}
        {showRejectConfirm && (
          <ConfirmDialog
            title="Reject AI Assessment"
            message={
              <>
                <p className="mb-4">
                  Are you sure you want to reject this AI assessment?
                </p>
                <p className="font-medium mb-4">
                  This will mark the session as{" "}
                  <span className="text-red-600">{overrideTo}</span>.
                </p>
                <textarea
                  value={rejectNote}
                  onChange={(e) => setRejectNote(e.target.value)}
                  placeholder="Please explain why..."
                  className="w-full mt-4 px-4 py-3 border border-neutral-300 rounded-xl text-sm resize-y min-h-[120px]"
                />
              </>
            }
            confirmLabel="Submit Rejection"
            cancelLabel="Cancel"
            onConfirm={handleReject}
            onCancel={() => {
              setShowRejectConfirm(false);
              setRejectNote("");
            }}
            destructive={true}
          />
        )}
      </div>
    </Modal>
  );
}
