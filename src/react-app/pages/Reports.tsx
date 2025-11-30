import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { Link } from "react-router-dom";

export function Reports() {
  // TODO: Fetch real reports from API
  const mockReports = [
    {
      id: "RD-2025-000001",
      description: "Road surface damage due to flooding",
      location: "Colombo, Western Province",
      status: "verified" as const,
      severity: 3,
      createdAt: "2025-11-28",
    },
    {
      id: "RD-2025-000002",
      description: "Bridge structural damage",
      location: "Galle, Southern Province",
      status: "under-review" as const,
      severity: 4,
      createdAt: "2025-11-27",
    },
    {
      id: "RD-2025-000003",
      description: "Culvert blocked by debris",
      location: "Kandy, Central Province",
      status: "new" as const,
      severity: 2,
      createdAt: "2025-11-26",
    },
  ];

  const severityLabels = {
    1: "Low",
    2: "Medium",
    3: "High",
    4: "Critical",
  };

  const severityVariants = {
    1: "low" as const,
    2: "medium" as const,
    3: "high" as const,
    4: "critical" as const,
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Damage Reports</h1>
          <p className="text-gray-500">
            View and manage infrastructure damage reports
          </p>
        </div>
        <Button asChild>
          <Link to="/reports/new">
            <Plus className="mr-2 h-4 w-4" />
            New Report
          </Link>
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="mb-4">
        <CardContent className="pt-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search reports..."
                className="pl-9"
              />
            </div>
            <Button variant="outline">Filter</Button>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <div className="space-y-4">
        {mockReports.map((report) => (
          <Card key={report.id} className="transition-shadow hover:shadow-md">
            <CardHeader className="pb-2">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-base font-medium">
                    {report.id}
                  </CardTitle>
                  <p className="text-sm text-gray-500">{report.location}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant={report.status}>{report.status.replace("-", " ")}</Badge>
                  <Badge variant={severityVariants[report.severity as keyof typeof severityVariants]}>
                    {severityLabels[report.severity as keyof typeof severityLabels]}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-2 text-sm">{report.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  Reported on {report.createdAt}
                </span>
                <Button variant="ghost" size="sm" asChild>
                  <Link to={`/reports/${report.id}`}>View Details</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
