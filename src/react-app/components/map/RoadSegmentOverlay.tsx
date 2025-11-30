import { useEffect, useRef } from "react";
import { useMap } from "@vis.gl/react-google-maps";

interface RoadSegment {
  id: string;
  path: google.maps.LatLngLiteral[];
  damageType: string;
  severity: number;
}

const SEVERITY_STYLES: Record<
  number,
  { color: string; weight: number; opacity: number }
> = {
  1: { color: "#EAB308", weight: 5, opacity: 0.7 }, // Low - Yellow
  2: { color: "#F97316", weight: 6, opacity: 0.8 }, // Medium - Orange
  3: { color: "#DC2626", weight: 7, opacity: 0.9 }, // High - Red
  4: { color: "#991B1B", weight: 8, opacity: 1.0 }, // Critical - Dark Red
};

interface RoadSegmentOverlayProps {
  segment: RoadSegment;
  onClick?: () => void;
}

export function RoadSegmentOverlay({
  segment,
  onClick,
}: RoadSegmentOverlayProps) {
  const map = useMap();
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map || segment.path.length === 0) return;

    const style = SEVERITY_STYLES[segment.severity] || SEVERITY_STYLES[2];

    // Create polyline with optional dashed pattern for critical severity
    const polyline = new google.maps.Polyline({
      path: segment.path,
      strokeColor: style.color,
      strokeOpacity: style.opacity,
      strokeWeight: style.weight,
      map,
      // Add white dashes for critical/blocked roads
      icons:
        segment.severity === 4
          ? [
              {
                icon: {
                  path: "M -2,-2 2,-2 2,2 -2,2 z",
                  strokeColor: "#FFFFFF",
                  fillColor: "#FFFFFF",
                  fillOpacity: 1,
                  scale: 2,
                },
                repeat: "40px",
              },
            ]
          : undefined,
    });

    if (onClick) {
      polyline.addListener("click", onClick);
    }

    polylineRef.current = polyline;

    return () => {
      polyline.setMap(null);
    };
  }, [map, segment, onClick]);

  return null;
}
