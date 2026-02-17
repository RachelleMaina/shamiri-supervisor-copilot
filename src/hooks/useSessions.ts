import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

interface ScoreBlock {
  score: number;
  reasoning: string;
}

interface AiAnalysis {
  risk_flag: 'SAFE' | 'RISK';
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
  action: 'VALIDATE' | 'REJECT';
  notes?: string | null;
  created_at: string;
}

interface Session {
  id: string;
  fellow_name: string;

  ai_analysis?: AiAnalysis;
  supervisor_review?: SupervisorReview;
}


interface ReviewPayload {
  action: "validate" | "reject";
  note?: string;
}


export function useSessions(nameFilter = "", statusFilter = "") {
  return useQuery<Session[]>({
    queryKey: ["sessions", nameFilter, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (nameFilter) params.set("fellowName", nameFilter);
      if (statusFilter) params.set("status", statusFilter);

      const res = await api.get(`/sessions?${params.toString()}`);
      return res.data;
    },
  });
}


export function useSession(id: string | null) {
  return useQuery<Session>({
    queryKey: ["session", id],
    queryFn: async () => {
      if (!id) throw new Error("No session ID");
      const res = await api.get(`/sessions/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useSubmitReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionId,
      payload,
    }: { sessionId: string; payload: ReviewPayload }) => {
      const res = await api.post(`/sessions/${sessionId}/review`, payload);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["session", variables.sessionId] });
    },
    onError: (error) => {
      console.error("Review failed:", error);
  
    },
  });
}


export function useAnalyzeSession() {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: async (sessionId: string) => {
        const response = await axios.post(`/api/sessions/${sessionId}/analyze`);
        return response.data; 
      },
  
      onMutate: async (sessionId: string) => {
        await queryClient.cancelQueries({ queryKey: ["session", sessionId] });
  
        const previousSession = queryClient.getQueryData<Session>(["session", sessionId]);
  
        queryClient.setQueryData(["session", sessionId], (old: Session | undefined) => {
          if (!old) return old;
          return {
            ...old,
            aiAnalysis: undefined,
          };
        });
  
        return { previousSession };
      },
  
      onError: (err, sessionId, context) => {
        if (context?.previousSession) {
          queryClient.setQueryData(["session", sessionId], context.previousSession);
        }
        console.error("Analysis failed:", err);
     
      },
  
      onSuccess: (_, sessionId) => {
        queryClient.invalidateQueries({ queryKey: ["session", sessionId] });
        queryClient.invalidateQueries({ queryKey: ["sessions"] });
      },
  
     
    });
  }