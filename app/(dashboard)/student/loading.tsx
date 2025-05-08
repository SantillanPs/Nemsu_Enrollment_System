"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BookOpen,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function StudentDashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Verification Status Card Skeleton */}
      <Card className="border-gray-200 bg-gray-50 mb-4">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Enrolled Courses Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              <Skeleton className="h-4 w-28" />
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground opacity-30" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-8 mb-1" />
            <Skeleton className="h-3 w-32" />
          </CardContent>
        </Card>

        {/* Pending Requests Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              <Skeleton className="h-4 w-32" />
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground opacity-30" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-8 mb-1" />
            <Skeleton className="h-3 w-28" />
          </CardContent>
        </Card>

        {/* Completed Credits Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              <Skeleton className="h-4 w-32" />
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground opacity-30" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-8 mb-1" />
            <Skeleton className="h-3 w-36" />
          </CardContent>
        </Card>

        {/* GPA Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              <Skeleton className="h-4 w-16" />
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground opacity-30" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-8 mb-1" />
            <Skeleton className="h-3 w-24" />
          </CardContent>
        </Card>
      </div>

      {/* Recent Enrollment Requests Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-48" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-64" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-4">
                  <div>
                    <Skeleton className="h-5 w-48 mb-2" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines Skeleton */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-40" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-56" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="border-b pb-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-40 mb-2" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-3 w-full mt-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Announcements Skeleton */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-32" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-56" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="border-b pb-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-48 mb-2" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-3 w-full mt-2" />
                <Skeleton className="h-3 w-full mt-2" />
                <Skeleton className="h-3 w-3/4 mt-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
