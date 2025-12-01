import { create } from "zustand";
import { LatLngExpression } from "leaflet";

export interface RoadSegmentData {
  id: string;
  reportId: string | null;
  roadNo: string | null;
  roadName: string | null;
  province: string | null;
  reason: string | null;
  fromKm: number | null;
  toKm: number | null;
  path: Array<{ lat: number; lng: number }>;
  midpoint: { lat: number; lng: number } | null;
  damageType: string | null;
  severity: number | null;
  description: string | null;
  status: string | null;
}

export interface ProcessedRoadSegment {
  id: string;
  roadNo: string;
  roadName: string | null;
  province: string;
  path: LatLngExpression[];
  midpoint: LatLngExpression;
  damageType: string;
  severity: number;
  description: string;
  reason: string;
}

interface RoadSegmentsState {
  rawSegments: RoadSegmentData[];
  segments: ProcessedRoadSegment[];
  isLoading: boolean;
  error: string | null;
  hasFetched: boolean;
}

interface RoadSegmentsActions {
  fetchSegments: () => Promise<void>;
}

function processSegments(rawSegments: RoadSegmentData[]): ProcessedRoadSegment[] {
  return rawSegments
    .filter((seg) => seg.path && seg.path.length >= 2)
    .map((seg) => {
      const path: LatLngExpression[] = seg.path.map((p) => [p.lat, p.lng]);
      const midIndex = Math.floor(seg.path.length / 2);
      const midpointRaw = seg.path[midIndex] || seg.path[0];
      const midpoint: LatLngExpression = [midpointRaw.lat, midpointRaw.lng];

      return {
        id: seg.id,
        roadNo: seg.roadNo || "Unknown",
        roadName: seg.roadName,
        province: seg.province || "Unknown",
        path,
        midpoint,
        damageType: seg.damageType || "other",
        severity: seg.severity || 2,
        description:
          seg.description ||
          `${seg.roadNo} from km ${seg.fromKm} to km ${seg.toKm}`,
        reason: seg.reason || seg.description || "Unknown",
      };
    });
}

export const useRoadSegmentsStore = create<RoadSegmentsState & RoadSegmentsActions>()(
  (set, get) => ({
    rawSegments: [],
    segments: [],
    isLoading: false,
    error: null,
    hasFetched: false,

    fetchSegments: async () => {
      // Don't fetch if already fetched or currently loading
      if (get().hasFetched || get().isLoading) {
        return;
      }

      set({ isLoading: true, error: null });

      try {
        const res = await fetch("/api/v1/map/segments");
        if (!res.ok) throw new Error("Failed to fetch segments");

        const rawSegments = (await res.json()) as RoadSegmentData[];
        const segments = processSegments(rawSegments);

        set({
          rawSegments,
          segments,
          isLoading: false,
          hasFetched: true,
        });
      } catch (err) {
        set({
          error: err instanceof Error ? err.message : "Failed to fetch segments",
          isLoading: false,
          hasFetched: true,
        });
      }
    },
  })
);
