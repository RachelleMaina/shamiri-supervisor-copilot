"use client";

import ProtectedLayout from "@/src/components/ProtectedLayout";
import { useState } from "react";
import toast from "react-hot-toast";
import AnalysisModal from "../../components/AnalysisModal";
import Navbar from "../../components/Navbar";
import PageHeader from "../../components/PageHeader";
import ReusableTable from "../../components/SessionsTable";
import StatusBadge from "../../components/StatusBadge";
import TableHeader from "../../components/TableHeader";
import TranscriptModal from "../../components/TranscriptModal";
import {
  useAnalyzeSession,
  useSession,
  useSessions,
  useSubmitReview,
} from "../../hooks/useSessions";

export default function SessionsPage() {
  const [nameFilter, setNameFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("CREATED");
  const [selectedTranscriptId, setSelectedTranscriptId] = useState<
    string | null
  >(null);
  const [selectedSummaryId, setSelectedSummaryId] = useState<string | null>(
    null
  );

  const [rejectNote, setRejectNote] = useState("");

  const stringifiedUser =
    typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const user = stringifiedUser ? JSON.parse(stringifiedUser) : null;

  const { data: sessions = [], isLoading: sessionsLoading } = useSessions(
    nameFilter,
    statusFilter
  );
  const { data: selectedTranscript } = useSession(selectedTranscriptId);
  const { data: selectedSummary } = useSession(selectedSummaryId);

  const submitReviewMutation = useSubmitReview();
  const analyzeMutation = useAnalyzeSession();

  const supervisorId = user?.id;
  const openTranscript = (id: string) => {
    setSelectedTranscriptId(id);
  };

  const openSummary = (id: string) => {
    setSelectedSummaryId(id);
  };

  const closeTranscript = () => {
    setSelectedTranscriptId(null);
  };

  const closeSummary = () => {
    setSelectedSummaryId(null);
  };

  const onSubmitReview = (payload: any) => {
    if (!selectedSummary) {
      toast.error("No session selected for review.");
      return;
    }
    submitReviewMutation.mutate(
      { sessionId: selectedSummary?.id, payload },
      {
        onSuccess: () => {
          toast.success("Review submitted!");
          closeSummary();
          setRejectNote("");
        },
        onError: () => toast.error("Failed to submit review."),
      }
    );
  };

  const handleAnalyze = (sessionId: string) => {
    analyzeMutation.mutate(sessionId);
  };

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-slate-50">
        <Navbar user={user} />

        <div className="max-w-7xl mx-auto px-6 py-8">
          <PageHeader title="Supervisor Dashboard" />

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-8 pt-8 pb-6 border-b border-slate-100 bg-slate-50/40">
              <TableHeader
                nameFilter={nameFilter}
                setNameFilter={setNameFilter}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
              />

              {sessionsLoading ? (
                <div className="py-12 text-center text-neutral-500">
                  Loading sessions...
                </div>
              ) : (
                <ReusableTable
                  sessions={sessions}
                  columns={[
                    { key: "fellowName", label: "Fellow", align: "left" },
                    { key: "status", label: "Status", align: "center" },
                  ]}
                  scopedColumns={{
                    status: (session) => (
                      <StatusBadge status={session.status} />
                    ),
                  }}
                  onSelectTranscript={(session) => openTranscript(session.id)}
                  onSelectSummary={(session) => openSummary(session.id)}
                  page={1}
                  totalPages={1}
                  onPageChange={() => {}}
                />
              )}
            </div>
          </div>

          {/* Modals */}
          {selectedTranscriptId && (
            <TranscriptModal
              isOpen={!!selectedTranscriptId}
              onClose={closeTranscript}
              session={selectedTranscript || null}
            />
          )}

          {selectedSummaryId && (
            <AnalysisModal
              isOpen={!!selectedSummaryId}
              onClose={closeSummary}
              session={selectedSummary || null}
              supervisorId={supervisorId}
              isAnalyzing={analyzeMutation.isPending}
              onAnalyze={handleAnalyze}
              onSubmitReview={onSubmitReview}
              rejectNote={rejectNote}
              setRejectNote={setRejectNote}
            />
          )}
        </div>
      </div>
    </ProtectedLayout>
  );
}
