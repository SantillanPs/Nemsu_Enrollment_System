"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Prerequisite {
  id: string;
  code: string;
  name: string;
}

interface CourseInfoCardProps {
  credits: number;
  capacity: number;
  semester: string;
  year: number;
  status: string;
  prerequisites: Prerequisite[];
  instructorName: string;
  createdAt: string;
  updatedAt: string;
  description: string;
  sectionsCount: number;
  totalEnrollments: number;
  totalCapacity: number;
}

export function CourseInfoCard({
  credits,
  capacity,
  semester,
  year,
  status,
  prerequisites,
  instructorName,
  createdAt,
  updatedAt,
  description,
  sectionsCount,
  totalEnrollments,
  totalCapacity,
}: CourseInfoCardProps) {
  // Map the database status to the UI status
  const uiStatus =
    status === "OPEN"
      ? "active"
      : status === "CLOSED"
      ? "inactive"
      : status.toLowerCase();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Information</CardTitle>
        <CardDescription>Details about this course and its sections</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Credits</p>
            <p>{credits}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Capacity</p>
            <p>{capacity}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Semester</p>
            <p>
              {semester.charAt(0) + semester.slice(1).toLowerCase()} {year}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Status</p>
            <Badge
              className={
                uiStatus === "active"
                  ? "bg-green-100 text-green-800"
                  : uiStatus === "pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }
            >
              {uiStatus.charAt(0).toUpperCase() + uiStatus.slice(1)}
            </Badge>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              Prerequisites
            </p>
            <p>
              {prerequisites && prerequisites.length > 0
                ? prerequisites.map((p) => p.code).join(", ")
                : "None"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              Instructor
            </p>
            <p>{instructorName}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Created</p>
            <p>{new Date(createdAt).toLocaleDateString()}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              Last Updated
            </p>
            <p>{new Date(updatedAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            Description
          </p>
          <p className="text-sm">{description}</p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              Sections ({sectionsCount})
            </p>
            <p className="text-sm">
              Total Enrollment: {totalEnrollments}/{totalCapacity}
            </p>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                totalCapacity > 0 && totalEnrollments / totalCapacity > 0.9
                  ? "bg-red-500"
                  : totalCapacity > 0 && totalEnrollments / totalCapacity > 0.7
                  ? "bg-yellow-500"
                  : "bg-green-500"
              }`}
              style={{
                width: `${
                  totalCapacity > 0
                    ? (totalEnrollments / totalCapacity) * 100
                    : 0
                }%`,
              }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
