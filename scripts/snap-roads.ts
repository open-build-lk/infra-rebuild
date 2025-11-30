/**
 * One-time script to pre-compute snapped road paths using Google Directions API.
 * Run with: bun run scripts/snap-roads.ts
 *
 * This fetches the actual road geometry for each segment and saves it to the data file.
 * After running, the app uses pre-computed paths - zero API calls at runtime.
 */

import { initialRoadSegments } from "../src/react-app/data/initialRoadSegments";

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

if (!GOOGLE_MAPS_API_KEY) {
  console.error("Please set GOOGLE_MAPS_API_KEY environment variable");
  process.exit(1);
}

interface SnappedPoint {
  lat: number;
  lng: number;
}

interface DirectionsResponse {
  status: string;
  routes: Array<{
    overview_polyline: {
      points: string;
    };
  }>;
}

function decodePolyline(encoded: string): SnappedPoint[] {
  const points: SnappedPoint[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte: number;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    lat += result & 1 ? ~(result >> 1) : result >> 1;

    shift = 0;
    result = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    lng += result & 1 ? ~(result >> 1) : result >> 1;

    points.push({
      lat: lat / 1e5,
      lng: lng / 1e5,
    });
  }

  return points;
}

async function snapToRoads(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number
): Promise<SnappedPoint[]> {
  const origin = `${startLat},${startLng}`;
  const destination = `${endLat},${endLng}`;

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=driving&key=${GOOGLE_MAPS_API_KEY}`
  );

  const data = (await response.json()) as DirectionsResponse;

  if (data.status !== "OK" || !data.routes[0]) {
    // Fallback to straight line
    return [
      { lat: startLat, lng: startLng },
      { lat: endLat, lng: endLng },
    ];
  }

  return decodePolyline(data.routes[0].overview_polyline.points);
}

async function main() {
  console.log("Snapping roads to actual road geometry...\n");

  const results: Record<string, SnappedPoint[]> = {};

  // Filter to only segments (not point damage)
  const segments = initialRoadSegments.filter(
    (seg) => seg.fromLat !== seg.toLat || seg.fromLng !== seg.toLng
  );

  console.log(`Processing ${segments.length} road segments...\n`);

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    process.stdout.write(`[${i + 1}/${segments.length}] ${seg.roadNo} - ${seg.roadName}... `);

    try {
      const path = await snapToRoads(seg.fromLat, seg.fromLng, seg.toLat, seg.toLng);
      results[seg.id] = path;
      console.log(`✓ (${path.length} points)`);
    } catch (error) {
      console.log(`✗ (using straight line)`);
      results[seg.id] = [
        { lat: seg.fromLat, lng: seg.fromLng },
        { lat: seg.toLat, lng: seg.toLng },
      ];
    }

    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  // Generate the output file
  const output = `// Auto-generated snapped road paths
// Generated: ${new Date().toISOString()}
// DO NOT EDIT - regenerate with: bun run scripts/snap-roads.ts

export const snappedRoadPaths: Record<string, Array<{ lat: number; lng: number }>> = ${JSON.stringify(results, null, 2)};
`;

  await Bun.write("src/react-app/data/snappedRoadPaths.ts", output);

  console.log(`\n✅ Done! Saved ${Object.keys(results).length} snapped paths to src/react-app/data/snappedRoadPaths.ts`);
}

main();
