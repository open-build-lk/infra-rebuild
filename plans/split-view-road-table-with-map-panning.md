# feat: Split View Road Table with Map Panning

## Overview

Add a split-view interface displaying blocked roads in a TanStack Table grouped by province, with click-to-pan functionality that centers the map on the selected province or road segment.

## Problem Statement / Motivation

Currently, users can only view road damage on the map and must visually scan to find specific areas. There's no way to:
- See all blocked roads in a structured list format
- Quickly navigate to a specific province's road damage
- Get an overview of damage counts by province
- Click on a road entry to locate it on the map

This feature enables users to browse road damage systematically and navigate the map efficiently.

## Proposed Solution

### Layout Design

```
┌──────────────────────────────────────────────────────────────────┐
│ Stats Bar (existing)                                             │
├─────────────────────┬────────────────────────────────────────────┤
│                     │                                            │
│  Province List      │                                            │
│  (Grouped Table)    │           Map View                         │
│                     │                                            │
│  ▶ Eastern (8)      │                                            │
│  ▼ Central (26)     │                                            │
│    ├ A-005 ...      │                                            │
│    ├ B-246 ...      │                                            │
│    └ ...            │                                            │
│  ▶ Uva (13)         │                                            │
│  ▶ Sabaragamuwa (21)│                                            │
│  ...                │                                            │
│                     │                                            │
│  Width: 320px       │           Flex: 1 (remaining)              │
│                     │                                            │
└─────────────────────┴────────────────────────────────────────────┘
```

**Desktop (≥1024px)**: Side-by-side split view, table on left (320px fixed), map on right
**Tablet (768-1023px)**: Same layout with narrower table (280px)
**Mobile (<768px)**: Stacked layout with collapsible province list above map

### Interaction Model

1. **Click Province Header**: Expands/collapses group AND pans map to fit all segments in that province
2. **Click Road Segment Row**: Pans map to that segment's midpoint at zoom level 14, highlights the polyline
3. **Hover Province**: Subtle highlight, no map change
4. **Keyboard**: Tab navigates provinces, Enter expands/pans, Arrow keys navigate within group

## Technical Approach

### Dependencies

```bash
bun add @tanstack/react-table
```

### New Files

```
src/react-app/
├── components/
│   └── road-table/
│       ├── RoadTable.tsx          # Main table component
│       ├── ProvinceGroup.tsx      # Province header row with expand/collapse
│       └── RoadSegmentRow.tsx     # Individual road segment row
├── stores/
│   └── mapView.ts                 # Zustand store for map/table coordination
```

### Modified Files

- `src/react-app/pages/Home.tsx` - Add split view layout
- `src/react-app/components/map/DisasterMap.tsx` - Add MapController for panning
- `src/react-app/components/map/index.ts` - Export MapController

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Home.tsx                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    useMapViewStore()                      │  │
│  │  - selectedProvince: string | null                        │  │
│  │  - selectedSegmentId: string | null                       │  │
│  │  - targetLocation: LatLngExpression | null                │  │
│  │  - targetZoom: number                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│         ┌────────────────────┼─────────────────────┐            │
│         ▼                    ▼                     ▼            │
│  ┌─────────────┐    ┌──────────────────┐   ┌────────────────┐  │
│  │ RoadTable   │    │  DisasterMap     │   │  MapController │  │
│  │             │    │                  │   │  (useMap hook) │  │
│  │ - Reads     │    │ - Reads          │   │                │  │
│  │   segments  │    │   segments       │   │ - Listens to   │  │
│  │ - Calls     │    │ - Highlights     │   │   store changes│  │
│  │   store     │    │   selected       │   │ - Calls flyTo  │  │
│  │   actions   │    │   segment        │   │                │  │
│  └─────────────┘    └──────────────────┘   └────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Zustand Store

```typescript
// src/react-app/stores/mapView.ts
interface MapViewState {
  selectedProvince: string | null;
  selectedSegmentId: string | null;
  expandedProvinces: Set<string>;
}

interface MapViewActions {
  selectProvince: (province: string) => void;
  selectSegment: (segmentId: string, location: LatLngExpression) => void;
  toggleProvinceExpanded: (province: string) => void;
  clearSelection: () => void;
}
```

### MapController Component

```typescript
// Inside DisasterMap.tsx
function MapController() {
  const map = useMap();
  const { selectedProvince, selectedSegmentId } = useMapViewStore();

  useEffect(() => {
    if (selectedSegmentId) {
      // Pan to specific segment
      const segment = findSegmentById(selectedSegmentId);
      map.flyTo(segment.midpoint, 14, { duration: 1.5 });
    } else if (selectedProvince) {
      // Fit bounds to all segments in province
      const bounds = calculateProvinceBounds(selectedProvince);
      map.fitBounds(bounds, { padding: [50, 50], duration: 1.5 });
    }
  }, [selectedProvince, selectedSegmentId, map]);

  return null;
}
```

### Table Columns

| Column | Width | Description |
|--------|-------|-------------|
| Road No. | 80px | Road number (A-004, B-187) |
| Road Name | flex | Road name, truncated with ellipsis |
| Type | 40px | Damage type emoji icon |
| Severity | 70px | Colored badge (Low/Med/High/Crit) |

### Province Header Row

```
▼ Central Province (26 roads affected)
```

- Chevron icon for expand/collapse state
- Province name
- Count of road segments
- Background: gray-100 (light) / gray-800 (dark)
- Click anywhere on row to expand/collapse AND pan map

## Implementation Phases

### Phase 1: Foundation (Core Infrastructure)

**Tasks:**
- [ ] Install `@tanstack/react-table` dependency
- [ ] Create `src/react-app/stores/mapView.ts` Zustand store
- [ ] Create `MapController` component using `useMap()` hook
- [ ] Add `MapController` inside `DisasterMap` component
- [ ] Calculate province center coordinates from segment data

**Files:**
- `package.json` (add dependency)
- `src/react-app/stores/mapView.ts` (new)
- `src/react-app/components/map/DisasterMap.tsx` (modify)

### Phase 2: Table Component

**Tasks:**
- [ ] Create `RoadTable.tsx` with TanStack Table setup
- [ ] Implement province grouping with `getGroupedRowModel()`
- [ ] Implement expand/collapse with `getExpandedRowModel()`
- [ ] Style table with Tailwind matching existing UI
- [ ] Add click handlers calling store actions

**Files:**
- `src/react-app/components/road-table/RoadTable.tsx` (new)
- `src/react-app/components/road-table/index.ts` (new)

### Phase 3: Split View Layout

**Tasks:**
- [ ] Update `Home.tsx` with split view layout
- [ ] Add responsive breakpoints (mobile stacked, desktop split)
- [ ] Wire up RoadTable and DisasterMap with shared store
- [ ] Add segment highlighting on map when selected

**Files:**
- `src/react-app/pages/Home.tsx` (modify)

### Phase 4: Polish & Accessibility

**Tasks:**
- [ ] Add keyboard navigation (Tab, Enter, Arrow keys)
- [ ] Add ARIA labels for screen readers
- [ ] Add dark mode support for table
- [ ] Add loading state during map panning animation
- [ ] Test on mobile devices

**Files:**
- Various component files

## Acceptance Criteria

### Functional Requirements

- [ ] Table displays all 90 road segments grouped by 7 provinces
- [ ] Clicking province header expands/collapses that group
- [ ] Clicking province header pans map to show all segments in that province
- [ ] Clicking individual road segment pans map to that segment
- [ ] Selected segment is visually highlighted on both table and map
- [ ] Table shows road number, name, damage type (icon), and severity (badge)

### Non-Functional Requirements

- [ ] Table renders in under 100ms
- [ ] Map panning animation completes in 1.5 seconds
- [ ] Responsive layout works on 375px+ screen widths
- [ ] WCAG 2.1 Level AA keyboard accessibility
- [ ] Dark mode support matching existing app theme

### Quality Gates

- [ ] TypeScript strict mode passes
- [ ] Build completes without errors
- [ ] Manual testing on Chrome, Firefox, Safari
- [ ] Mobile testing on iOS Safari and Android Chrome

## Data Structure Reference

**Province Counts (from initialRoadSegments):**
- Eastern: 8 segments
- Central: 26 segments
- Uva: 13 segments
- North Central: 8 segments
- Sabaragamuwa: 21 segments
- North Western: 5 segments
- Western: 3 segments
- **Total: 84 segments** (after filtering point damage where fromLat === toLat)

**Province Center Coordinates** (calculated from segment midpoints):
```typescript
const PROVINCE_CENTERS: Record<string, [number, number]> = {
  "Eastern": [7.75, 81.50],
  "Central": [7.30, 80.60],
  "Uva": [6.85, 81.05],
  "North Central": [8.30, 80.40],
  "Sabaragamuwa": [6.75, 80.35],
  "North Western": [7.75, 79.90],
  "Western": [6.90, 79.95],
};
```

## Dependencies & Prerequisites

- **TanStack Table v8** - Headless table library
- **React-Leaflet useMap hook** - Already available in react-leaflet 5.0.0
- **Zustand** - Already installed (v5.0.9)

## Risk Analysis & Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| TanStack Table grouping complexity | Medium | Medium | Start with simple grouping, add features incrementally |
| Map panning conflicts with table state | Medium | Low | Clear state when user manually pans map |
| Mobile layout usability | High | Medium | Test early on real devices, consider tabs vs stacked |
| Bundle size increase | Low | Low | TanStack Table is well tree-shaken (~10KB gzipped) |

## References

### Internal References
- Map component: `src/react-app/components/map/DisasterMap.tsx`
- Road data: `src/react-app/data/initialRoadSegments.ts`
- Zustand pattern: `src/react-app/stores/auth.ts`
- Layout pattern: `src/react-app/components/layout/Layout.tsx`
- UI components: `src/react-app/components/ui/`

### External References
- [TanStack Table v8 Grouping](https://tanstack.com/table/v8/docs/guide/grouping)
- [TanStack Table v8 Expanding](https://tanstack.com/table/v8/docs/guide/expanding)
- [React-Leaflet useMap Hook](https://react-leaflet.js.org/docs/api-map/)
- [Leaflet flyTo/fitBounds](https://leafletjs.com/reference.html#map-flyto)

---

**Note:** This feature uses provinces for grouping since district-level data is not available in the current dataset. Districts could be added as an enhancement by geocoding coordinates or enriching the data source.
