import { AdvancedMarker } from "@vis.gl/react-google-maps";
import {
  Waves,
  Mountain,
  CloudRain,
  Construction,
  OctagonAlert,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";

const DAMAGE_ICONS: Record<string, { icon: LucideIcon; color: string }> = {
  washout: { icon: Waves, color: "#3B82F6" },
  collapse: { icon: OctagonAlert, color: "#DC2626" },
  landslide: { icon: Mountain, color: "#92400E" },
  flooding: { icon: CloudRain, color: "#0EA5E9" },
  blockage: { icon: Construction, color: "#F97316" },
  pothole: { icon: AlertTriangle, color: "#EAB308" },
  crack: { icon: AlertTriangle, color: "#F59E0B" },
  other: { icon: AlertTriangle, color: "#6B7280" },
};

interface DamageTypeMarkerProps {
  position: google.maps.LatLngLiteral;
  damageType: string;
  severity: number;
  onClick?: () => void;
}

export function DamageTypeMarker({
  position,
  damageType,
  onClick,
}: DamageTypeMarkerProps) {
  const config = DAMAGE_ICONS[damageType] || DAMAGE_ICONS.other;
  const Icon = config.icon;

  return (
    <AdvancedMarker position={position} onClick={onClick}>
      <div
        className="flex items-center justify-center rounded-full bg-white p-2 shadow-lg transition-transform hover:scale-110"
        style={{
          border: `3px solid ${config.color}`,
          cursor: "pointer",
        }}
      >
        <Icon
          style={{
            width: 24,
            height: 24,
            color: config.color,
          }}
        />
      </div>
    </AdvancedMarker>
  );
}
