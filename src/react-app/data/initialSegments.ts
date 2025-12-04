// Initial infrastructure segment data
// This data is displayed on the map before any user-submitted reports

export interface InitialSegment {
  id: string;
  province: string;
  segmentNo: string;
  segmentName: string;
  reason: string;
  fromKm: number;
  fromLat: number;
  fromLng: number;
  toKm: number;
  toLat: number;
  toLng: number;
  dataSource: string;
}

// Map reason to damage type
export function mapReasonToDamageType(reason: string): string {
  const r = reason.toLowerCase();
  if (r.includes("inundated") || r.includes("flood")) return "flooding";
  if (r.includes("landslide")) return "landslide";
  if (r.includes("collapse")) return "collapse";
  if (r.includes("washout") || r.includes("washed")) return "washout";
  if (r.includes("tree")) return "blockage";
  if (r.includes("rock")) return "landslide";
  if (r.includes("crack")) return "crack";
  return "other";
}

// Map reason to severity (1-4)
export function mapReasonToSeverity(reason: string): number {
  const r = reason.toLowerCase();
  if (r.includes("massive")) return 4;
  if (r.includes("landslide") || r.includes("collapse")) return 3;
  if (r.includes("inundated") || r.includes("flood")) return 2;
  if (r.includes("tree")) return 1;
  return 2;
}

export const initialSegments: InitialSegment[] = [
  { id: "seg-001", province: "Eastern", segmentNo: "B-187", segmentName: "Kalmunai - Chavalakadai", reason: "Inundated", fromKm: 3.5, fromLat: 7.41628132763044, fromLng: 81.81125112818002, toKm: 3.69, toLat: 7.4159069207123, toLng: 81.81293072743274, dataSource: "OpenStreetMap" },
  { id: "seg-002", province: "Eastern", segmentNo: "A-004", segmentName: "Colombo - Ratnapura - Wellawaya - Batticaloa", reason: "Inundated", fromKm: 422, fromLat: 6.8892399, fromLng: 81.6933511, toKm: 424, toLat: 6.8892399, toLng: 81.6933511, dataSource: "OpenStreetMap" },
  { id: "seg-003", province: "Eastern", segmentNo: "A-015", segmentName: "Batticaloa - Thirukkondiyadimadu - Trincomalee", reason: "Inundated", fromKm: 5, fromLat: 7.873429905967795, fromLng: 81.54033281799308, toKm: 8, toLat: 7.899913206544723, toLng: 81.53572444674928, dataSource: "OSRM routing" },
  { id: "seg-004", province: "Eastern", segmentNo: "A-015", segmentName: "Batticaloa - Thirukkondiyadimadu - Trincomalee", reason: "Inundated", fromKm: 19, fromLat: 7.971667227408371, fromLng: 81.51687336896723, toKm: 21, toLat: 7.9864259530667825, toLng: 81.50725152879653, dataSource: "OSRM routing" },
  { id: "seg-005", province: "Eastern", segmentNo: "B-344", segmentName: "Pattirippu - Vellavali", reason: "Inundated", fromKm: 1.25, fromLat: 7.517138685935679, fromLng: 81.78463137692036, toKm: 1.85, toLat: 7.516493086926698, toLng: 81.77923373760815, dataSource: "OpenStreetMap" },
  { id: "seg-006", province: "Eastern", segmentNo: "B-433", segmentName: "Umarana", reason: "Inundated", fromKm: 0, fromLat: 7.7078204, fromLng: 81.6727444, toKm: 3.3, toLat: 7.723098839157038, toLng: 81.67642831072646, dataSource: "OpenStreetMap" },
  { id: "seg-007", province: "Eastern", segmentNo: "B-541", segmentName: "Thambalagamuwa - Kinniya", reason: "Inundated", fromKm: 5, fromLat: 8.47879231224236, fromLng: 81.12393980479804, toKm: 6, toLat: 8.472756522904696, toLng: 81.1297371603254, dataSource: "OSRM routing" },
  { id: "seg-008", province: "Eastern", segmentNo: "B-333", segmentName: "Oddumavadi - Valachchenai", reason: "Inundated", fromKm: 1.8, fromLat: 7.914507578871575, fromLng: 81.45802666157508, toKm: 5, toLat: 7.912678428948477, toLng: 81.48676773956126, dataSource: "OpenStreetMap" },
  { id: "seg-009", province: "Central", segmentNo: "A-026", segmentName: "Kandy - Mahiyanganaya - Padiyathalawa", reason: "Landslide", fromKm: 29, fromLat: 7.278564115206363, fromLng: 80.7889528243124, toKm: 54, toLat: 7.329505349893146, toLng: 80.9069908285237, dataSource: "OSRM routing" },
  { id: "seg-010", province: "Central", segmentNo: "A-005", segmentName: "Peradeniya - Badulla - Chenkaladi", reason: "Landslide", fromKm: 14, fromLat: 7.279170231080494, fromLng: 80.67891057390771, toKm: 76, toLat: 7.352299724947288, toLng: 80.95900641985256, dataSource: "OSRM routing" },
];

