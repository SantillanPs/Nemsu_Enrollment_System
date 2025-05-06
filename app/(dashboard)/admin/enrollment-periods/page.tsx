"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  Edit,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface EnrollmentPeriod {
  id: string;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function EnrollmentPeriodsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [enrollmentPeriods, setEnrollmentPeriods] = useState<
    EnrollmentPeriod[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<EnrollmentPeriod | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: new Date(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 7)), // Default to 7 days from now
    isActive: false,
  });

  // Track if fields have been touched
  const [touched, setTouched] = useState({
    name: false,
  });

  // Fetch enrollment periods
  const fetchEnrollmentPeriods = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/enrollment-periods");

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fetch enrollment periods");
      }

      const data = await response.json();
      setEnrollmentPeriods(data.enrollmentPeriods || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      console.error("Error fetching enrollment periods:", err);
      // Set empty array to avoid undefined errors
      setEnrollmentPeriods([]);

      toast({
        title: "Database Setup Required",
        description:
          "The enrollment periods feature requires a database migration. Please contact your administrator.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollmentPeriods();
  }, []);

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Mark field as touched
    if (name === "name" && !touched.name) {
      setTouched((prev) => ({ ...prev, name: true }));
    }
  };

  // Handle date changes
  const handleStartDateChange = (date: Date | undefined) => {
    console.log("Start date changed:", date);
    if (date) {
      setFormData((prev) => {
        const newData = { ...prev, startDate: date };
        console.log("Updated form data (start date):", newData);
        return newData;
      });
    }
  };

  const handleEndDateChange = (date: Date | undefined) => {
    console.log("End date changed:", date);
    if (date) {
      setFormData((prev) => {
        const newData = { ...prev, endDate: date };
        console.log("Updated form data (end date):", newData);
        return newData;
      });
    }
  };

  // Handle active status change
  const handleActiveChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isActive: checked }));
  };

  // Reset form data
  const resetFormData = () => {
    setFormData({
      name: "",
      description: "",
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
      isActive: false,
    });

    // Reset touched state
    setTouched({
      name: false,
    });
  };

  // Open edit dialog
  const handleEdit = (period: EnrollmentPeriod) => {
    setSelectedPeriod(period);
    setFormData({
      name: period.name,
      description: period.description || "",
      startDate: new Date(period.startDate),
      endDate: new Date(period.endDate),
      isActive: period.isActive,
    });

    // Since we're editing an existing period, the name field is already filled
    // so we can mark it as touched
    setTouched({
      name: true,
    });

    setShowEditDialog(true);
  };

  // Open delete dialog
  const handleDelete = (period: EnrollmentPeriod) => {
    setSelectedPeriod(period);
    setShowDeleteDialog(true);
  };

  // Create new enrollment period
  const handleCreate = async () => {
    try {
      // Mark all fields as touched for validation
      setTouched({
        name: true,
      });

      // Validate form data
      if (!formData.name.trim()) {
        toast({
          title: "Validation Error",
          description: "Name is required",
          variant: "destructive",
        });
        return;
      }

      setIsSubmitting(true);

      // Convert dates to ISO strings before sending
      const dataToSend = {
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim(),
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate.toISOString(),
      };

      console.log("Sending data:", dataToSend);

      const response = await fetch("/api/enrollment-periods", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create enrollment period");
      }

      toast({
        title: "Success",
        description: "Enrollment period created successfully",
      });

      resetFormData();
      setShowAddDialog(false);
      fetchEnrollmentPeriods();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";

      toast({
        title: "Error",
        description: errorMessage.includes("Database")
          ? "The enrollment periods feature requires a database migration. Please contact your administrator."
          : errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update enrollment period
  const handleUpdate = async () => {
    if (!selectedPeriod) return;

    try {
      // Mark all fields as touched for validation
      setTouched({
        name: true,
      });

      // Validate form data
      if (!formData.name.trim()) {
        toast({
          title: "Validation Error",
          description: "Name is required",
          variant: "destructive",
        });
        return;
      }

      setIsSubmitting(true);

      // Convert dates to ISO strings before sending
      const dataToSend = {
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim(),
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate.toISOString(),
      };

      console.log("Sending update data:", dataToSend);

      const response = await fetch(
        `/api/enrollment-periods/${selectedPeriod.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToSend),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update enrollment period");
      }

      toast({
        title: "Success",
        description: "Enrollment period updated successfully",
      });

      setShowEditDialog(false);
      fetchEnrollmentPeriods();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";

      toast({
        title: "Error",
        description: errorMessage.includes("Database")
          ? "The enrollment periods feature requires a database migration. Please contact your administrator."
          : errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete enrollment period
  const handleConfirmDelete = async () => {
    if (!selectedPeriod) return;

    try {
      setIsSubmitting(true);

      const response = await fetch(
        `/api/enrollment-periods/${selectedPeriod.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete enrollment period");
      }

      toast({
        title: "Success",
        description: "Enrollment period deleted successfully",
      });

      setShowDeleteDialog(false);
      fetchEnrollmentPeriods();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";

      toast({
        title: "Error",
        description: errorMessage.includes("Database")
          ? "The enrollment periods feature requires a database migration. Please contact your administrator."
          : errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle enrollment period active status
  const handleToggleActive = async (period: EnrollmentPeriod) => {
    try {
      const response = await fetch(`/api/enrollment-periods/${period.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: !period.isActive,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update enrollment period");
      }

      toast({
        title: "Success",
        description: `Enrollment period ${
          period.isActive ? "deactivated" : "activated"
        } successfully`,
      });

      fetchEnrollmentPeriods();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";

      toast({
        title: "Error",
        description: errorMessage.includes("Database")
          ? "The enrollment periods feature requires a database migration. Please contact your administrator."
          : errorMessage,
        variant: "destructive",
      });
    }
  };

  // Check if a period is current (happening now)
  const isCurrentPeriod = (period: EnrollmentPeriod) => {
    const now = new Date();
    const start = new Date(period.startDate);
    const end = new Date(period.endDate);
    return period.isActive && now >= start && now <= end;
  };

  // Check if a period is upcoming
  const isUpcomingPeriod = (period: EnrollmentPeriod) => {
    const now = new Date();
    const start = new Date(period.startDate);
    return period.isActive && now < start;
  };

  // Check if a period is past
  const isPastPeriod = (period: EnrollmentPeriod) => {
    const now = new Date();
    const end = new Date(period.endDate);
    return now > end;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Enrollment Periods</h1>
        <Button
          onClick={() => {
            resetFormData();
            setShowAddDialog(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Enrollment Period
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Manage Enrollment Periods</CardTitle>
          <CardDescription>
            Set up and manage when students can enroll in courses
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">
              Loading enrollment periods...
            </div>
          ) : enrollmentPeriods.length === 0 ? (
            <div className="text-center py-4">
              No enrollment periods found. Create one to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrollmentPeriods.map((period) => (
                  <TableRow key={period.id}>
                    <TableCell className="font-medium">{period.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        {format(new Date(period.startDate), "PPP")}
                      </div>
                      <div className="flex items-center mt-1">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        {format(new Date(period.startDate), "p")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        {format(new Date(period.endDate), "PPP")}
                      </div>
                      <div className="flex items-center mt-1">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        {format(new Date(period.endDate), "p")}
                      </div>
                    </TableCell>
                    <TableCell>
                      {isCurrentPeriod(period) ? (
                        <div className="flex items-center">
                          <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                          <span className="text-green-600 font-medium">
                            Active Now
                          </span>
                        </div>
                      ) : isUpcomingPeriod(period) ? (
                        <div className="flex items-center">
                          <span className="flex h-2 w-2 rounded-full bg-blue-500 mr-2"></span>
                          <span className="text-blue-600 font-medium">
                            Upcoming
                          </span>
                        </div>
                      ) : isPastPeriod(period) ? (
                        <div className="flex items-center">
                          <span className="flex h-2 w-2 rounded-full bg-gray-400 mr-2"></span>
                          <span className="text-gray-500 font-medium">
                            Past
                          </span>
                        </div>
                      ) : period.isActive ? (
                        <div className="flex items-center">
                          <span className="flex h-2 w-2 rounded-full bg-yellow-500 mr-2"></span>
                          <span className="text-yellow-600 font-medium">
                            Scheduled
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <span className="flex h-2 w-2 rounded-full bg-gray-400 mr-2"></span>
                          <span className="text-gray-500 font-medium">
                            Inactive
                          </span>
                        </div>
                      )}
                      <div className="flex items-center mt-2">
                        <Switch
                          checked={period.isActive}
                          onCheckedChange={() => handleToggleActive(period)}
                          className="mr-2"
                        />
                        <span className="text-sm">
                          {period.isActive ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(period)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                          onClick={() => handleDelete(period)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Enrollment Period Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add Enrollment Period</DialogTitle>
            <DialogDescription>
              Create a new enrollment period to define when students can enroll
              in courses.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., Fall 2024 Enrollment"
                value={formData.name}
                onChange={handleChange}
                required
                className={
                  touched.name && !formData.name.trim()
                    ? "border-red-300 focus-visible:ring-red-500"
                    : ""
                }
              />
              {touched.name && !formData.name.trim() && (
                <p className="text-xs text-red-500 mt-1">Name is required</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Enter a description for this enrollment period..."
                rows={3}
                value={formData.description}
                onChange={handleChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <DatePicker
                  date={formData.startDate}
                  setDate={handleStartDateChange}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <DatePicker
                  date={formData.endDate}
                  setDate={handleEndDateChange}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={handleActiveChange}
              />
              <Label htmlFor="isActive">
                Make this enrollment period active
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Enrollment Period Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Enrollment Period</DialogTitle>
            <DialogDescription>
              Update the details of this enrollment period.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., Fall 2024 Enrollment"
                value={formData.name}
                onChange={handleChange}
                required
                className={
                  touched.name && !formData.name.trim()
                    ? "border-red-300 focus-visible:ring-red-500"
                    : ""
                }
              />
              {touched.name && !formData.name.trim() && (
                <p className="text-xs text-red-500 mt-1">Name is required</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Enter a description for this enrollment period..."
                rows={3}
                value={formData.description}
                onChange={handleChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <DatePicker
                  date={formData.startDate}
                  setDate={handleStartDateChange}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <DatePicker
                  date={formData.endDate}
                  setDate={handleEndDateChange}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={handleActiveChange}
              />
              <Label htmlFor="isActive">
                Make this enrollment period active
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this enrollment period? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedPeriod && (
              <div className="border rounded-md p-4 bg-gray-50">
                <p className="font-medium">{selectedPeriod.name}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {format(new Date(selectedPeriod.startDate), "PPP")} to{" "}
                  {format(new Date(selectedPeriod.endDate), "PPP")}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
