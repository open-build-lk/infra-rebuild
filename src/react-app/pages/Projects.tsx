import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

export function Projects() {
  // TODO: Fetch real projects from API
  const mockProjects = [
    {
      id: "RP-2025-0001",
      name: "A1 Highway Repair - Colombo Section",
      status: "in_progress" as const,
      progress: 65,
      linkedReports: 5,
      estimatedBudget: 15000000,
    },
    {
      id: "RP-2025-0002",
      name: "Galle Bridge Reconstruction",
      status: "planned" as const,
      progress: 0,
      linkedReports: 3,
      estimatedBudget: 45000000,
    },
    {
      id: "RP-2025-0003",
      name: "Central Province Road Network Restoration",
      status: "design" as const,
      progress: 25,
      linkedReports: 12,
      estimatedBudget: 120000000,
    },
  ];

  const statusLabels = {
    planned: "Planned",
    design: "In Design",
    tendering: "Tendering",
    in_progress: "In Progress",
    on_hold: "On Hold",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  const statusColors = {
    planned: "bg-blue-100 text-blue-800",
    design: "bg-purple-100 text-purple-800",
    tendering: "bg-yellow-100 text-yellow-800",
    in_progress: "bg-green-100 text-green-800",
    on_hold: "bg-orange-100 text-orange-800",
    completed: "bg-gray-100 text-gray-800",
    cancelled: "bg-red-100 text-red-800",
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Rebuild Projects</h1>
          <p className="text-gray-500">
            Track infrastructure rebuild and repair projects
          </p>
        </div>
        <Button asChild>
          <Link to="/projects/new">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </Button>
      </div>

      {/* Projects Grid */}
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {mockProjects.map((project) => (
          <Card
            key={project.id}
            className="transition-shadow hover:shadow-md"
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs text-gray-400">{project.id}</p>
                  <CardTitle className="text-base">{project.name}</CardTitle>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    statusColors[project.status]
                  }`}
                >
                  {statusLabels[project.status]}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {/* Progress Bar */}
              <div className="mb-3">
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-gray-500">Progress</span>
                  <span className="font-medium">{project.progress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-primary-600 transition-all"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="mb-3 flex justify-between text-sm">
                <div>
                  <span className="text-gray-500">Linked Reports:</span>{" "}
                  <span className="font-medium">{project.linkedReports}</span>
                </div>
                <div>
                  <span className="text-gray-500">Budget:</span>{" "}
                  <span className="font-medium">
                    {formatCurrency(project.estimatedBudget)}
                  </span>
                </div>
              </div>

              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link to={`/projects/${project.id}`}>View Details</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
