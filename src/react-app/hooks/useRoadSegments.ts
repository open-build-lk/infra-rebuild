import { useEffect } from "react";
import {
  useRoadSegmentsStore,
  ProcessedRoadSegment,
  RoadSegmentData,
} from "@/stores/roadSegments";

// Re-export types for backwards compatibility
export type { ProcessedRoadSegment, RoadSegmentData };

export function useRoadSegmentsAPI() {
  const { rawSegments, isLoading, error, fetchSegments } = useRoadSegmentsStore();

  useEffect(() => {
    fetchSegments();
  }, [fetchSegments]);

  return { segments: rawSegments, isLoading, error };
}

export function useRoadSegments(): {
  segments: ProcessedRoadSegment[];
  isLoading: boolean;
  error: string | null;
} {
  const { segments, isLoading, error, fetchSegments } = useRoadSegmentsStore();

  useEffect(() => {
    fetchSegments();
  }, [fetchSegments]);

  return { segments, isLoading, error };
}
