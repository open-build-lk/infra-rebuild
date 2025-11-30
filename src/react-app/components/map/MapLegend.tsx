import {
  Waves,
  Mountain,
  CloudRain,
  Construction,
  OctagonAlert,
  AlertTriangle,
} from "lucide-react";

const SEVERITY_COLORS = [
  { level: 1, label: "Low", color: "#EAB308" },
  { level: 2, label: "Medium", color: "#F97316" },
  { level: 3, label: "High", color: "#DC2626" },
  { level: 4, label: "Critical", color: "#991B1B" },
];

const DAMAGE_TYPES = [
  { type: "washout", label: "Washout", icon: Waves, color: "#3B82F6" },
  { type: "collapse", label: "Collapse", icon: OctagonAlert, color: "#DC2626" },
  { type: "landslide", label: "Landslide", icon: Mountain, color: "#92400E" },
  { type: "flooding", label: "Flooding", icon: CloudRain, color: "#0EA5E9" },
  {
    type: "blockage",
    label: "Blockage",
    icon: Construction,
    color: "#F97316",
  },
  { type: "other", label: "Other", icon: AlertTriangle, color: "#6B7280" },
];

export function MapLegend() {
  return (
    <div className="absolute bottom-4 left-4 z-10 rounded-lg bg-white p-4 shadow-lg dark:bg-gray-800">
      <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
        Map Legend
      </h3>

      {/* Severity section */}
      <div className="mb-4">
        <h4 className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
          Severity
        </h4>
        <div className="space-y-1">
          {SEVERITY_COLORS.map((item) => (
            <div key={item.level} className="flex items-center gap-2">
              <div
                className="h-1 w-6 rounded"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-gray-600 dark:text-gray-300">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Damage types section */}
      <div>
        <h4 className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
          Damage Type
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {DAMAGE_TYPES.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.type} className="flex items-center gap-1.5">
                <Icon
                  className="h-4 w-4"
                  style={{ color: item.color }}
                />
                <span className="text-xs text-gray-600 dark:text-gray-300">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
