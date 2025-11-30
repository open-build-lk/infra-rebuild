import { APIProvider } from "@vis.gl/react-google-maps";
import type { ReactNode } from "react";

interface MapProviderProps {
  children: ReactNode;
}

export function MapProvider({ children }: MapProviderProps) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-100 dark:bg-gray-800">
        <div className="text-center text-gray-500">
          <p className="mb-2 text-lg font-medium">Map Not Configured</p>
          <p className="text-sm">
            Please set VITE_GOOGLE_MAPS_API_KEY in your environment
          </p>
        </div>
      </div>
    );
  }

  return <APIProvider apiKey={apiKey}>{children}</APIProvider>;
}
