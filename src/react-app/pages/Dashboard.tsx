import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function Dashboard() {
  // TODO: Fetch real dashboard data from API
  const recentReports = [
    { id: "RD-2025-000001", status: "verified", location: "Colombo" },
    { id: "RD-2025-000002", status: "under-review", location: "Galle" },
    { id: "RD-2025-000003", status: "new", location: "Kandy" },
  ];

  const regionStats = [
    { name: "Western", total: 234, verified: 189 },
    { name: "Southern", total: 156, verified: 98 },
    { name: "Central", total: 123, verified: 87 },
    { name: "Northern", total: 98, verified: 45 },
    { name: "Eastern", total: 87, verified: 56 },
  ];

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500">
          Overview of infrastructure damage and rebuild progress
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{report.id}</p>
                    <p className="text-sm text-gray-500">{report.location}</p>
                  </div>
                  <Badge variant={report.status as "new" | "verified" | "under-review"}>
                    {report.status.replace("-", " ")}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Reports by Region */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Reports by Province</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {regionStats.map((region) => (
                <div key={region.name}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{region.name}</span>
                    <span className="text-gray-500">
                      {region.verified}/{region.total} verified
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-primary-600"
                      style={{
                        width: `${(region.verified / region.total) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Priority Queue */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">
              Top Priority Damages (Awaiting Action)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-gray-500 py-8">
              <p>Priority ranking will be displayed here</p>
              <p className="text-sm">
                Based on configurable weighted scoring system
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
