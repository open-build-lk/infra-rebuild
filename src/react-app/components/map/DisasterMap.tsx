import { useState, useEffect } from "react";
import { Map, InfoWindow } from "@vis.gl/react-google-maps";
import { MapProvider } from "./MapProvider";
import { RoadSegmentOverlay } from "./RoadSegmentOverlay";
import { DamageTypeMarker } from "./DamageTypeMarker";
import { MapLegend } from "./MapLegend";

interface RoadSegmentData {
  id: string;
  reportId: string;
  roadName: string | null;
  segment: {
    path: google.maps.LatLngLiteral[];
    midpoint: google.maps.LatLngLiteral;
  };
  damageType: string;
  severity: number;
  description: string;
  status: string;
  reportedAt: string;
}

interface DisasterMapProps {
  showVerifiedOnly?: boolean;
}

export function DisasterMap({ showVerifiedOnly = false }: DisasterMapProps) {
  const [segments, setSegments] = useState<RoadSegmentData[]>([]);
  const [selectedSegment, setSelectedSegment] =
    useState<RoadSegmentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sri Lanka center coordinates
  const center = { lat: 7.8731, lng: 80.7718 };

  useEffect(() => {
    async function fetchSegments() {
      try {
        setIsLoading(true);
        const endpoint = showVerifiedOnly
          ? "/api/v1/map/segments/verified"
          : "/api/v1/map/segments";
        const response = await fetch(endpoint);

        if (!response.ok) {
          throw new Error("Failed to fetch road segments");
        }

        const data = await response.json();
        setSegments(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    fetchSegments();
  }, [showVerifiedOnly]);

  const mapId = import.meta.env.VITE_GOOGLE_MAP_ID;

  return (
    <MapProvider>
      <div className="relative h-full w-full">
        {isLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/50 dark:bg-gray-900/50">
            <div className="text-gray-500">Loading map data...</div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/50 dark:bg-gray-900/50">
            <div className="text-red-500">{error}</div>
          </div>
        )}

        <Map
          defaultCenter={center}
          defaultZoom={8}
          mapId={mapId}
          style={{ width: "100%", height: "100%" }}
          gestureHandling="greedy"
          disableDefaultUI={false}
        >
          {/* Road segment polylines */}
          {segments.map((seg) => (
            <RoadSegmentOverlay
              key={`segment-${seg.id}`}
              segment={{
                id: seg.id,
                path: seg.segment.path,
                damageType: seg.damageType,
                severity: seg.severity,
              }}
              onClick={() => setSelectedSegment(seg)}
            />
          ))}

          {/* Damage type markers at segment midpoints */}
          {segments.map((seg) => (
            <DamageTypeMarker
              key={`marker-${seg.id}`}
              position={seg.segment.midpoint}
              damageType={seg.damageType}
              severity={seg.severity}
              onClick={() => setSelectedSegment(seg)}
            />
          ))}

          {/* Info window for selected segment */}
          {selectedSegment && (
            <InfoWindow
              position={selectedSegment.segment.midpoint}
              onCloseClick={() => setSelectedSegment(null)}
            >
              <div className="max-w-xs p-2">
                <h3 className="mb-1 text-base font-bold capitalize">
                  {selectedSegment.damageType.replace("_", " ")}
                </h3>
                {selectedSegment.roadName && (
                  <p className="mb-1 text-sm text-gray-600">
                    {selectedSegment.roadName}
                  </p>
                )}
                <p className="mb-2 text-sm">{selectedSegment.description}</p>
                <div className="flex gap-2 text-xs text-gray-500">
                  <span
                    className={`rounded px-1.5 py-0.5 ${
                      selectedSegment.severity === 4
                        ? "bg-red-100 text-red-700"
                        : selectedSegment.severity === 3
                          ? "bg-orange-100 text-orange-700"
                          : selectedSegment.severity === 2
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                    }`}
                  >
                    Severity: {selectedSegment.severity}
                  </span>
                  <span
                    className={`rounded px-1.5 py-0.5 ${
                      selectedSegment.status === "verified"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {selectedSegment.status}
                  </span>
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  Reported:{" "}
                  {new Date(selectedSegment.reportedAt).toLocaleDateString()}
                </p>
              </div>
            </InfoWindow>
          )}
        </Map>

        <MapLegend />
      </div>
    </MapProvider>
  );
}
