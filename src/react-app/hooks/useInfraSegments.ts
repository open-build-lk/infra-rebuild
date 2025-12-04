import { useEffect } from "react";
import {
  useInfraSegmentsStore,
  ProcessedInfraSegment,
  InfraSegmentData,
} from "@/stores/infraSegments";

// Re-export types for backwards compatibility
export type { ProcessedInfraSegment, InfraSegmentData };

export function useInfraSegmentsAPI() {
  const { rawSegments, isLoading, error, fetchSegments } = useInfraSegmentsStore();

  useEffect(() => {
    fetchSegments();
  }, [fetchSegments]);

  return { segments: rawSegments, isLoading, error };
}

export function useInfraSegments(): {
  segments: ProcessedInfraSegment[];
  isLoading: boolean;
  error: string | null;
} {
  const { segments, isLoading, error, fetchSegments } = useInfraSegmentsStore();

  useEffect(() => {
    fetchSegments();
  }, [fetchSegments]);

  return { segments, isLoading, error };
}

