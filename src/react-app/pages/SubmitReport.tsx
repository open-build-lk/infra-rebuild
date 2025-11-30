import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MapPin, Upload, AlertTriangle } from "lucide-react";
import { useAuthStore } from "@/stores/auth";

export function SubmitReport() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    damageType: "",
    severity: "",
    location: "",
    contactName: user?.name || "",
    contactPhone: user?.phone || "",
    contactEmail: user?.email || "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const damageTypes = [
    { value: "road_damage", label: "Road Damage" },
    { value: "bridge_damage", label: "Bridge Damage" },
    { value: "rail_damage", label: "Rail Damage" },
    { value: "signal_damage", label: "Signal/Sign Damage" },
    { value: "drainage", label: "Drainage Issue" },
    { value: "landslide", label: "Landslide" },
    { value: "flooding", label: "Flooding" },
    { value: "other", label: "Other" },
  ];

  const severityLevels = [
    { value: "low", label: "Low - Minor inconvenience" },
    { value: "medium", label: "Medium - Significant impact" },
    { value: "high", label: "High - Major disruption" },
    { value: "critical", label: "Critical - Immediate danger" },
  ];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // TODO: Implement API call to submit report
    // For now, simulate submission
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Redirect to reports list after submission
    navigate("/reports");
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Submit Damage Report</h1>
          <p className="text-gray-500">
            Help us track infrastructure damage by submitting a report
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Damage Details
            </CardTitle>
            <CardDescription>
              Provide as much detail as possible to help responders assess the
              situation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Report Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Brief description of the damage"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Damage Type */}
              <div className="space-y-2">
                <Label htmlFor="damageType">Type of Damage</Label>
                <select
                  id="damageType"
                  name="damageType"
                  value={formData.damageType}
                  onChange={handleChange}
                  required
                  className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                >
                  <option value="">Select damage type</option>
                  {damageTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Severity */}
              <div className="space-y-2">
                <Label htmlFor="severity">Severity Level</Label>
                <select
                  id="severity"
                  name="severity"
                  value={formData.severity}
                  onChange={handleChange}
                  required
                  className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                >
                  <option value="">Select severity</option>
                  {severityLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Detailed Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe the damage, when it occurred, and any other relevant details"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <div className="flex gap-2">
                  <Input
                    id="location"
                    name="location"
                    placeholder="Address or landmark near the damage"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" size="icon">
                    <MapPin className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Click the pin icon to use your current location
                </p>
              </div>

              {/* Photo Upload */}
              <div className="space-y-2">
                <Label>Photos (Optional)</Label>
                <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 hover:border-gray-400">
                  <div className="text-center">
                    <Upload className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">
                      Drag and drop photos here, or click to browse
                    </p>
                    <p className="text-xs text-gray-400">
                      JPG, PNG up to 10MB each
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              {!user && (
                <div className="space-y-4 rounded-lg bg-gray-50 p-4">
                  <h3 className="font-medium">Contact Information</h3>
                  <p className="text-sm text-gray-500">
                    Optional: Provide your contact details if you'd like updates
                    on this report
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="contactName">Name</Label>
                      <Input
                        id="contactName"
                        name="contactName"
                        placeholder="Your name"
                        value={formData.contactName}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Phone</Label>
                      <Input
                        id="contactPhone"
                        name="contactPhone"
                        type="tel"
                        placeholder="+94 77 123 4567"
                        value={formData.contactPhone}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="contactEmail">Email</Label>
                      <Input
                        id="contactEmail"
                        name="contactEmail"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.contactEmail}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Report"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
