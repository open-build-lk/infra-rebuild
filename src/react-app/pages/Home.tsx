import { MapPin, FileText, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "react-router-dom";

export function Home() {
  // TODO: Fetch real stats from API
  const stats = {
    totalReports: 1234,
    verifiedReports: 987,
    activeProjects: 45,
    resolvedDamages: 654,
  };

  return (
    <div className="p-4 lg:p-6">
      {/* Hero Section */}
      <div className="mb-8 rounded-xl bg-gradient-to-r from-primary-600 to-primary-800 p-6 text-white lg:p-8">
        <h1 className="mb-2 text-2xl font-bold lg:text-3xl">
          OpenRebuildLK
        </h1>
        <p className="mb-4 text-primary-100 lg:text-lg">
          Disaster Infrastructure Damage and Rebuild Management Platform for
          Sri Lanka
        </p>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            size="lg"
            className="bg-white text-primary-700 hover:bg-gray-100"
            asChild
          >
            <Link to="/reports/new">Report Damage</Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-white text-white hover:bg-white/10"
            asChild
          >
            <Link to="/map">View Map</Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Reports
            </CardTitle>
            <FileText className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReports}</div>
            <p className="text-xs text-gray-500">Damage reports submitted</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Verified
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.verifiedReports}</div>
            <p className="text-xs text-gray-500">Verified by field officers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Active Projects
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProjects}</div>
            <p className="text-xs text-gray-500">Rebuild projects in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Resolved
            </CardTitle>
            <MapPin className="h-4 w-4 text-primary-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resolvedDamages}</div>
            <p className="text-xs text-gray-500">Damages fixed and closed</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Report Infrastructure Damage</CardTitle>
            <CardDescription>
              Submit a damage report for roads, bridges, rail tracks, or other
              infrastructure affected by disasters.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/reports/new">Submit Report</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Track Your Submission</CardTitle>
            <CardDescription>
              Check the status of your submitted damage report using your
              tracking ID.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild>
              <Link to="/track">Track Report</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
