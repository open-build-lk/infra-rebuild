interface SnappedPoint {
  lat: number;
  lng: number;
  placeId?: string;
}

interface DirectionsResponse {
  status: string;
  routes: Array<{
    overview_polyline: {
      points: string;
    };
  }>;
}

/**
 * Snaps two GPS coordinates to the nearest road and returns
 * the road-following path between them using Google Directions API.
 */
export async function snapToRoads(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
  apiKey: string
): Promise<SnappedPoint[]> {
  const origin = `${startLat},${startLng}`;
  const destination = `${endLat},${endLng}`;

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=driving&key=${apiKey}`
  );

  const data = (await response.json()) as DirectionsResponse;

  if (data.status !== "OK" || !data.routes[0]) {
    // Fallback to straight line if no route found
    return [
      { lat: startLat, lng: startLng },
      { lat: endLat, lng: endLng },
    ];
  }

  // Decode the polyline to get actual road coordinates
  const encodedPath = data.routes[0].overview_polyline.points;
  return decodePolyline(encodedPath);
}

/**
 * Decodes a Google Maps encoded polyline string into an array of coordinates.
 * https://developers.google.com/maps/documentation/utilities/polylinealgorithm
 */
function decodePolyline(encoded: string): SnappedPoint[] {
  const points: SnappedPoint[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte: number;

    // Decode latitude
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    lat += result & 1 ? ~(result >> 1) : result >> 1;

    shift = 0;
    result = 0;

    // Decode longitude
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

/**
 * Calculates the midpoint of a path (for placing marker icons).
 */
export function calculateMidpoint(
  path: SnappedPoint[]
): SnappedPoint {
  if (path.length === 0) {
    return { lat: 0, lng: 0 };
  }

  if (path.length === 1) {
    return path[0];
  }

  // For simplicity, return the point closest to the middle of the array
  const midIndex = Math.floor(path.length / 2);
  return path[midIndex];
}
