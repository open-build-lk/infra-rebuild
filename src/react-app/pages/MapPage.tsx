import { DisasterMap } from "@/components/map";

export function MapPage() {
  return (
    <div className="flex h-full flex-col p-4 lg:p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Infrastructure Map</h1>
        <p className="text-gray-500">
          View all reported damages and rebuild projects across Sri Lanka
        </p>
      </div>

      <div className="relative flex-1 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        <DisasterMap />
      </div>
    </div>
  );
}
