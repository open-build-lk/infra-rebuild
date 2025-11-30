import { useMemo } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup } from "react-leaflet";
import { DivIcon, LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapLegend } from "./MapLegend";
import {
  initialRoadSegments,
  mapReasonToDamageType,
  mapReasonToSeverity,
} from "@/data/initialRoadSegments";
import { snappedRoadPaths } from "@/data/snappedRoadPaths";

interface RoadSegmentData {
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

// Severity colors
const SEVERITY_COLORS: Record<number, string> = {
  1: "#EAB308", // Yellow - Low
  2: "#F97316", // Orange - Medium
  3: "#DC2626", // Red - High
  4: "#991B1B", // Dark Red - Critical
};

// Damage type icons (using emoji for simplicity, could use custom icons)
const DAMAGE_ICONS: Record<string, { emoji: string; color: string }> = {
  flooding: { emoji: "🌊", color: "#3B82F6" },
  landslide: { emoji: "⛰️", color: "#92400E" },
  washout: { emoji: "💧", color: "#3B82F6" },
  collapse: { emoji: "🚧", color: "#DC2626" },
  blockage: { emoji: "🚜", color: "#F97316" },
  other: { emoji: "⚠️", color: "#6B7280" },
};

function createDamageIcon(damageType: string, severity: number): DivIcon {
  const config = DAMAGE_ICONS[damageType] || DAMAGE_ICONS.other;
  const severityColor = SEVERITY_COLORS[severity] || SEVERITY_COLORS[2];

  return new DivIcon({
    html: `
      <div style="
        background: white;
        border: 3px solid ${severityColor};
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: pointer;
      ">
        ${config.emoji}
      </div>
    `,
    className: "damage-marker",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

export function DisasterMap() {
  // Sri Lanka center coordinates
  const center: LatLngExpression = [7.8731, 80.7718];

  // Load road segments with pre-computed snapped paths (zero API calls!)
  const segments = useMemo<RoadSegmentData[]>(() => {
    return initialRoadSegments
      .filter((seg) => {
        // Filter out segments where start and end are the same (point damage)
        return seg.fromLat !== seg.toLat || seg.fromLng !== seg.toLng;
      })
      .map((seg) => {
        // Use pre-computed snapped path, or fall back to straight line
        const rawPath = snappedRoadPaths[seg.id] || [
          { lat: seg.fromLat, lng: seg.fromLng },
          { lat: seg.toLat, lng: seg.toLng },
        ];

        // Convert to Leaflet format [lat, lng]
        const path: LatLngExpression[] = rawPath.map((p) => [p.lat, p.lng]);

        // Calculate midpoint from the actual path
        const midIndex = Math.floor(rawPath.length / 2);
        const midpointRaw = rawPath[midIndex] || {
          lat: (seg.fromLat + seg.toLat) / 2,
          lng: (seg.fromLng + seg.toLng) / 2,
        };
        const midpoint: LatLngExpression = [midpointRaw.lat, midpointRaw.lng];

        return {
          id: seg.id,
          roadNo: seg.roadNo,
          roadName: seg.roadName,
          province: seg.province,
          path,
          midpoint,
          damageType: mapReasonToDamageType(seg.reason),
          severity: mapReasonToSeverity(seg.reason),
          description: `${seg.roadNo} from km ${seg.fromKm} to km ${seg.toKm}`,
          reason: seg.reason,
        };
      });
  }, []);

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={center}
        zoom={8}
        style={{ width: "100%", height: "100%" }}
        scrollWheelZoom={true}
      >
        {/* OpenStreetMap tiles - FREE! */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Road segment polylines */}
        {segments.map((seg) => (
          <Polyline
            key={`segment-${seg.id}`}
            positions={seg.path}
            pathOptions={{
              color: SEVERITY_COLORS[seg.severity] || SEVERITY_COLORS[2],
              weight: seg.severity === 4 ? 8 : seg.severity === 3 ? 6 : 5,
              opacity: 0.8,
              dashArray: seg.severity === 4 ? "10, 10" : undefined,
            }}
          >
            <Popup>
              <div className="min-w-48">
                <h3 className="mb-1 text-base font-bold capitalize">
                  {seg.damageType.replace("_", " ")}
                </h3>
                <p className="mb-1 text-sm font-medium text-gray-700">
                  {seg.roadNo} - {seg.roadName}
                </p>
                <p className="mb-1 text-xs text-gray-500">
                  {seg.province} Province
                </p>
                <p className="mb-2 text-sm">{seg.reason}</p>
                <p className="text-xs text-gray-500">{seg.description}</p>
              </div>
            </Popup>
          </Polyline>
        ))}

        {/* Damage type markers at segment midpoints */}
        {segments.map((seg) => (
          <Marker
            key={`marker-${seg.id}`}
            position={seg.midpoint}
            icon={createDamageIcon(seg.damageType, seg.severity)}
          >
            <Popup>
              <div className="min-w-48">
                <h3 className="mb-1 text-base font-bold capitalize">
                  {seg.damageType.replace("_", " ")}
                </h3>
                <p className="mb-1 text-sm font-medium text-gray-700">
                  {seg.roadNo} - {seg.roadName}
                </p>
                <p className="mb-1 text-xs text-gray-500">
                  {seg.province} Province
                </p>
                <p className="mb-2 text-sm">{seg.reason}</p>
                <p className="text-xs text-gray-500">{seg.description}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <MapLegend />
    </div>
  );
}
