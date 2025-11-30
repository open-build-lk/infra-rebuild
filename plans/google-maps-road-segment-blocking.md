# Google Maps API Integration with Road Segment Blocking

**Type**: Enhancement
**Priority**: High
**Created**: 2025-11-30
**Updates**: plans/openrebuildlk-disaster-infrastructure-platform.md

---

## Overview

Update the OpenRebuildLK platform to use Google Maps API instead of Leaflet, with the ability to mark road segments as blocked/damaged between two GPS coordinates, with decorator icons indicating the type of problem.

---

## Problem Statement

The current plan specifies Leaflet for mapping. However, Google Maps provides:
1. Better snap-to-roads functionality via Roads API
2. Superior mobile experience and performance
3. Official React library (`@vis.gl/react-google-maps`)
4. Better coverage and accuracy for Sri Lanka roads

Additionally, we need to visualize **blocked road segments** (not just point markers) with:
- Polylines following actual road geometry
- Color-coded severity
- Decorator icons indicating damage type

---

## Technical Approach

### Maps Library Change

| Before | After |
|--------|-------|
| Leaflet + react-leaflet | Google Maps JavaScript API |
| - | @vis.gl/react-google-maps (official) |

### Key Components

```
┌─────────────────────────────────────────────────────────────┐
│                      DisasterMap                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              APIProvider (Google Maps)               │    │
│  │  ┌─────────────────────────────────────────────┐    │    │
│  │  │                    Map                       │    │    │
│  │  │  ┌─────────────────────────────────────┐    │    │    │
│  │  │  │  RoadSegmentOverlay (Polylines)     │    │    │    │
│  │  │  │  - Snap to roads between 2 points   │    │    │    │
│  │  │  │  - Color by severity                │    │    │    │
│  │  │  │  - Dashed for closures              │    │    │    │
│  │  │  └─────────────────────────────────────┘    │    │    │
│  │  │  ┌─────────────────────────────────────┐    │    │    │
│  │  │  │  DamageMarkers (AdvancedMarker)     │    │    │    │
│  │  │  │  - Icon by damage type              │    │    │    │
│  │  │  │  - Positioned mid-segment           │    │    │    │
│  │  │  └─────────────────────────────────────┘    │    │    │
│  │  │  ┌─────────────────────────────────────┐    │    │    │
│  │  │  │  InfoWindow (Details popup)         │    │    │    │
│  │  │  └─────────────────────────────────────┘    │    │    │
│  │  └─────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Details

### 1. Install Dependencies

```bash
bun add @vis.gl/react-google-maps
```

### 2. Environment Variables

```env
# .dev.vars (Cloudflare Workers)
GOOGLE_MAPS_API_KEY=your_api_key_here
GOOGLE_MAP_ID=your_map_id_here
```

### 3. API Provider Setup

**File**: `src/react-app/components/map/MapProvider.tsx`

```tsx
import { APIProvider } from '@vis.gl/react-google-maps';

export function MapProvider({ children }: { children: React.ReactNode }) {
  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      {children}
    </APIProvider>
  );
}
```

### 4. Road Segment Data Model

Update database schema to support road segments:

```sql
-- New table for road segments (damage between two points)
CREATE TABLE road_segments (
  id TEXT PRIMARY KEY,
  report_id TEXT REFERENCES damage_reports(id),
  start_lat REAL NOT NULL,
  start_lng REAL NOT NULL,
  end_lat REAL NOT NULL,
  end_lng REAL NOT NULL,
  snapped_path TEXT, -- JSON array of snapped coordinates
  road_name TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

**File**: `src/worker/db/schema.ts` (additions)

```typescript
export const roadSegments = sqliteTable("road_segments", {
  id: text("id").primaryKey(),
  reportId: text("report_id").references(() => damageReports.id),
  startLat: real("start_lat").notNull(),
  startLng: real("start_lng").notNull(),
  endLat: real("end_lat").notNull(),
  endLng: real("end_lng").notNull(),
  snappedPath: text("snapped_path"), // JSON array
  roadName: text("road_name"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});
```

### 5. Snap-to-Roads Service

**File**: `src/worker/services/roadsService.ts`

```typescript
interface SnappedPoint {
  lat: number;
  lng: number;
  placeId?: string;
}

export async function snapToRoads(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
  apiKey: string
): Promise<SnappedPoint[]> {
  // Use Directions API to get road-following path
  const origin = `${startLat},${startLng}`;
  const destination = `${endLat},${endLng}`;

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=driving&key=${apiKey}`
  );

  const data = await response.json();

  if (data.status !== 'OK' || !data.routes[0]) {
    // Fallback to straight line
    return [
      { lat: startLat, lng: startLng },
      { lat: endLat, lng: endLng }
    ];
  }

  // Decode the polyline
  const encodedPath = data.routes[0].overview_polyline.points;
  return decodePolyline(encodedPath);
}

function decodePolyline(encoded: string): SnappedPoint[] {
  const points: SnappedPoint[] = [];
  let index = 0, lat = 0, lng = 0;

  while (index < encoded.length) {
    let shift = 0, result = 0;
    let byte: number;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    lat += (result & 1) ? ~(result >> 1) : (result >> 1);

    shift = 0;
    result = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    lng += (result & 1) ? ~(result >> 1) : (result >> 1);

    points.push({
      lat: lat / 1e5,
      lng: lng / 1e5
    });
  }

  return points;
}
```

### 6. Road Segment Visualization

**File**: `src/react-app/components/map/RoadSegmentOverlay.tsx`

```tsx
import { useEffect, useRef } from 'react';
import { useMap } from '@vis.gl/react-google-maps';

interface RoadSegment {
  id: string;
  path: google.maps.LatLngLiteral[];
  damageType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

const SEVERITY_STYLES = {
  low: { color: '#EAB308', weight: 5, opacity: 0.7 },
  medium: { color: '#F97316', weight: 6, opacity: 0.8 },
  high: { color: '#DC2626', weight: 7, opacity: 0.9 },
  critical: { color: '#991B1B', weight: 8, opacity: 1.0 },
};

export function RoadSegmentOverlay({
  segment,
  onClick
}: {
  segment: RoadSegment;
  onClick?: () => void;
}) {
  const map = useMap();
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map) return;

    const style = SEVERITY_STYLES[segment.severity];

    // Create polyline with optional dashed pattern for closures
    const polyline = new google.maps.Polyline({
      path: segment.path,
      strokeColor: style.color,
      strokeOpacity: style.opacity,
      strokeWeight: style.weight,
      map,
      // Add symbols for blocked roads
      icons: segment.severity === 'critical' ? [{
        icon: {
          path: 'M -2,-2 2,-2 2,2 -2,2 z',
          strokeColor: '#FFFFFF',
          fillColor: '#FFFFFF',
          fillOpacity: 1,
          scale: 2,
        },
        repeat: '40px',
      }] : undefined,
    });

    if (onClick) {
      polyline.addListener('click', onClick);
    }

    polylineRef.current = polyline;

    return () => {
      polyline.setMap(null);
    };
  }, [map, segment, onClick]);

  return null;
}
```

### 7. Damage Type Decorator Icons

**File**: `src/react-app/components/map/DamageTypeMarker.tsx`

```tsx
import { AdvancedMarker } from '@vis.gl/react-google-maps';
import {
  Waves,
  Mountain,
  CloudRain,
  Construction,
  OctagonAlert,
  AlertTriangle
} from 'lucide-react';

const DAMAGE_ICONS = {
  washout: { icon: Waves, color: '#3B82F6' },
  collapse: { icon: OctagonAlert, color: '#DC2626' },
  landslide: { icon: Mountain, color: '#92400E' },
  flooding: { icon: CloudRain, color: '#0EA5E9' },
  blockage: { icon: Construction, color: '#F97316' },
  other: { icon: AlertTriangle, color: '#6B7280' },
};

interface DamageTypeMarkerProps {
  position: google.maps.LatLngLiteral;
  damageType: keyof typeof DAMAGE_ICONS;
  severity: string;
  onClick?: () => void;
}

export function DamageTypeMarker({
  position,
  damageType,
  severity,
  onClick,
}: DamageTypeMarkerProps) {
  const config = DAMAGE_ICONS[damageType] || DAMAGE_ICONS.other;
  const Icon = config.icon;

  return (
    <AdvancedMarker position={position} onClick={onClick}>
      <div
        style={{
          background: 'white',
          borderRadius: '50%',
          padding: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          border: `3px solid ${config.color}`,
          cursor: 'pointer',
        }}
      >
        <Icon
          style={{
            width: 24,
            height: 24,
            color: config.color
          }}
        />
      </div>
    </AdvancedMarker>
  );
}
```

### 8. Complete Map Component

**File**: `src/react-app/components/map/DisasterMap.tsx`

```tsx
import { useState, useCallback } from 'react';
import {
  Map,
  InfoWindow,
  useAdvancedMarkerRef
} from '@vis.gl/react-google-maps';
import { RoadSegmentOverlay } from './RoadSegmentOverlay';
import { DamageTypeMarker } from './DamageTypeMarker';

interface DamageReport {
  id: string;
  segment: {
    path: google.maps.LatLngLiteral[];
    midpoint: google.maps.LatLngLiteral;
  };
  damageType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  reportedAt: Date;
}

export function DisasterMap({ reports }: { reports: DamageReport[] }) {
  const [selectedReport, setSelectedReport] = useState<DamageReport | null>(null);

  // Sri Lanka center
  const center = { lat: 7.8731, lng: 80.7718 };

  return (
    <Map
      defaultCenter={center}
      defaultZoom={8}
      mapId={import.meta.env.VITE_GOOGLE_MAP_ID}
      style={{ width: '100%', height: '100%' }}
      gestureHandling="greedy"
      disableDefaultUI={false}
    >
      {/* Road segment polylines */}
      {reports.map((report) => (
        <RoadSegmentOverlay
          key={`segment-${report.id}`}
          segment={{
            id: report.id,
            path: report.segment.path,
            damageType: report.damageType,
            severity: report.severity,
          }}
          onClick={() => setSelectedReport(report)}
        />
      ))}

      {/* Damage type markers at segment midpoints */}
      {reports.map((report) => (
        <DamageTypeMarker
          key={`marker-${report.id}`}
          position={report.segment.midpoint}
          damageType={report.damageType as any}
          severity={report.severity}
          onClick={() => setSelectedReport(report)}
        />
      ))}

      {/* Info window for selected report */}
      {selectedReport && (
        <InfoWindow
          position={selectedReport.segment.midpoint}
          onCloseClick={() => setSelectedReport(null)}
        >
          <div style={{ maxWidth: 300, padding: 8 }}>
            <h3 style={{ margin: '0 0 8px', fontWeight: 'bold' }}>
              {selectedReport.damageType.replace('_', ' ').toUpperCase()}
            </h3>
            <p style={{ margin: '0 0 8px', fontSize: 14 }}>
              {selectedReport.description}
            </p>
            <p style={{ margin: 0, fontSize: 12, color: '#666' }}>
              Severity: {selectedReport.severity} |
              Reported: {selectedReport.reportedAt.toLocaleDateString()}
            </p>
          </div>
        </InfoWindow>
      )}
    </Map>
  );
}
```

---

## API Route for Road Segments

**File**: `src/worker/routes/map.ts` (additions)

```typescript
// POST /api/v1/map/snap-road
mapRoutes.post('/snap-road', async (c) => {
  const { startLat, startLng, endLat, endLng } = await c.req.json();

  const snappedPath = await snapToRoads(
    startLat,
    startLng,
    endLat,
    endLng,
    c.env.GOOGLE_MAPS_API_KEY
  );

  return c.json({ path: snappedPath });
});

// GET /api/v1/map/segments
mapRoutes.get('/segments', async (c) => {
  const db = createDb(c.env.DB);

  const segments = await db
    .select({
      id: roadSegments.id,
      reportId: roadSegments.reportId,
      snappedPath: roadSegments.snappedPath,
      damageType: damageReports.damageType,
      severity: damageReports.severity,
      description: damageReports.description,
      reportedAt: damageReports.createdAt,
    })
    .from(roadSegments)
    .innerJoin(damageReports, eq(roadSegments.reportId, damageReports.id))
    .where(eq(damageReports.status, 'verified'));

  // Format for frontend
  const formatted = segments.map(s => ({
    id: s.id,
    segment: {
      path: JSON.parse(s.snappedPath || '[]'),
      midpoint: calculateMidpoint(JSON.parse(s.snappedPath || '[]')),
    },
    damageType: s.damageType,
    severity: s.severity,
    description: s.description,
    reportedAt: new Date(s.reportedAt),
  }));

  return c.json(formatted);
});
```

---

## Cost Estimation

### Google Maps APIs Required

| API | Usage/Month | Cost |
|-----|-------------|------|
| Maps JavaScript API | 50,000 loads | First 10K free, then $7/1K = ~$280 |
| Directions API | 10,000 requests | First 10K free = $0 |
| Total | - | ~$280/month |

### Cost Optimization

1. Cache snapped road paths in database (don't recalculate)
2. Use static maps for non-interactive previews
3. Batch road snapping requests
4. Set daily quotas in Google Cloud Console

---

## Acceptance Criteria

### Functional Requirements

- [ ] Map renders using Google Maps JavaScript API
- [ ] Road segments display as polylines between two GPS coordinates
- [ ] Polylines follow actual road geometry (snap-to-roads)
- [ ] Color coding by severity (yellow → orange → red)
- [ ] Critical/closed segments show dashed pattern
- [ ] Decorator icons show damage type at segment midpoint
- [ ] Clicking segment/icon shows InfoWindow with details
- [ ] Map legend explains colors and icons

### Non-Functional Requirements

- [ ] Map loads in < 2 seconds
- [ ] Smooth panning/zooming with 100+ segments
- [ ] Mobile-responsive touch controls
- [ ] Works offline with cached tiles (basic viewing)

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/react-app/components/map/MapProvider.tsx` | Google Maps API provider |
| `src/react-app/components/map/DisasterMap.tsx` | Main map component |
| `src/react-app/components/map/RoadSegmentOverlay.tsx` | Polyline for road segments |
| `src/react-app/components/map/DamageTypeMarker.tsx` | Icons for damage types |
| `src/react-app/components/map/MapLegend.tsx` | Color/icon legend |
| `src/worker/services/roadsService.ts` | Snap-to-roads logic |

## Files to Modify

| File | Changes |
|------|---------|
| `src/worker/db/schema.ts` | Add roadSegments table |
| `src/worker/routes/map.ts` | Add road segment endpoints |
| `src/react-app/pages/MapPage.tsx` | Use DisasterMap component |
| `package.json` | Add @vis.gl/react-google-maps |
| `wrangler.json` | Add GOOGLE_MAPS_API_KEY var |

---

## Dependencies

```bash
bun add @vis.gl/react-google-maps
```

Remove:
```bash
bun remove leaflet react-leaflet @types/leaflet  # (if installed)
```

---

## References

### Official Documentation
- [@vis.gl/react-google-maps](https://visgl.github.io/react-google-maps/)
- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [Directions API](https://developers.google.com/maps/documentation/directions/overview)
- [Roads API](https://developers.google.com/maps/documentation/roads/snap)

### Pricing
- [Google Maps Platform Pricing](https://developers.google.com/maps/billing-and-pricing/pricing)

### Icons (Already Available)
- [Lucide Icons](https://lucide.dev/) - Already in project
