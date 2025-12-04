// Data migration script for infrastructure segments
// This prepares data from hardcoded files for database import

import {
  initialSegments,
  mapReasonToDamageType,
  mapReasonToSeverity,
} from "../src/react-app/data/initialSegments";
import { snappedPaths } from "../src/react-app/data/snappedPaths";

export interface MigrationSegment {
  id: string;
  reportId: string;
  segmentNo: string;
  segmentName: string;
  province: string;
  reason: string;
  damageType: string;
  severity: number;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  fromKm: number;
  toKm: number;
  snappedPath: Array<{ lat: number; lng: number }>;
  dataSource: string;
}

export function prepareMigrationData(): MigrationSegment[] {
  return initialSegments.map((seg) => {
    // Use pre-computed snapped path, or fall back to straight line
    const path = snappedPaths[seg.id] || [
      { lat: seg.fromLat, lng: seg.fromLng },
      { lat: seg.toLat, lng: seg.toLng },
    ];

    return {
      id: seg.id,
      reportId: `report-${seg.id}`,
      segmentNo: seg.segmentNo,
      segmentName: seg.segmentName,
      province: seg.province,
      reason: seg.reason,
      damageType: mapReasonToDamageType(seg.reason),
      severity: mapReasonToSeverity(seg.reason),
      startLat: seg.fromLat,
      startLng: seg.fromLng,
      endLat: seg.toLat,
      endLng: seg.toLng,
      fromKm: seg.fromKm,
      toKm: seg.toKm,
      snappedPath: path,
      dataSource: seg.dataSource,
    };
  });
}

