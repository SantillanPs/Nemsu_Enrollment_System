"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  ShimmerSkeleton,
  WaveSkeleton,
  PulseSkeleton,
  FadeSkeleton,
  GradientSkeleton,
} from "@/app/components/AnimatedSkeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, Clock, CheckCircle, AlertCircle } from "lucide-react";

export default function StudentDashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Verification Status Card Skeleton */}
      <Card className="border-gray-200 bg-gray-50 mb-4">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <PulseSkeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <ShimmerSkeleton className="h-5 w-40" />
              <ShimmerSkeleton className="h-4 w-64" delay="150" />
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
              <ShimmerSkeleton className="h-4 w-28" />
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground opacity-30" />
          </CardHeader>
          <CardContent>
            <GradientSkeleton className="h-8 w-8 mb-1" />
            <ShimmerSkeleton className="h-3 w-32" delay="150" />
          </CardContent>
        </Card>

        {/* Pending Requests Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              <ShimmerSkeleton className="h-4 w-32" delay="75" />
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground opacity-30" />
          </CardHeader>
          <CardContent>
            <GradientSkeleton className="h-8 w-8 mb-1" delay="75" />
            <ShimmerSkeleton className="h-3 w-28" delay="150" />
          </CardContent>
        </Card>

        {/* Completed Credits Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              <ShimmerSkeleton className="h-4 w-32" delay="150" />
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground opacity-30" />
          </CardHeader>
          <CardContent>
            <GradientSkeleton className="h-8 w-8 mb-1" delay="150" />
            <ShimmerSkeleton className="h-3 w-36" delay="300" />
          </CardContent>
        </Card>

        {/* GPA Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              <ShimmerSkeleton className="h-4 w-16" delay="300" />
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground opacity-30" />
          </CardHeader>
          <CardContent>
            <GradientSkeleton className="h-8 w-8 mb-1" delay="300" />
            <ShimmerSkeleton className="h-3 w-24" delay="500" />
          </CardContent>
        </Card>
      </div>

      {/* Recent Enrollment Requests Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>
              <WaveSkeleton className="h-6 w-48" />
            </CardTitle>
            <CardDescription>
              <WaveSkeleton className="h-4 w-64" delay="150" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b pb-4"
                >
                  <div>
                    <ShimmerSkeleton
                      className="h-5 w-48 mb-2"
                      delay={`${index * 150}`}
                    />
                    <ShimmerSkeleton
                      className="h-3 w-32"
                      delay={`${index * 150 + 75}`}
                    />
                  </div>
                  <FadeSkeleton
                    className="h-6 w-20 rounded-full"
                    delay={`${index * 150}`}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines Skeleton */}
        <Card>
          <CardHeader>
            <CardTitle>
              <WaveSkeleton className="h-6 w-40" delay="300" />
            </CardTitle>
            <CardDescription>
              <WaveSkeleton className="h-4 w-56" delay="450" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="border-b pb-4">
                  <div className="flex items-center justify-between">
                    <ShimmerSkeleton
                      className="h-5 w-40 mb-2"
                      delay={`${index * 150 + 300}`}
                    />
                    <ShimmerSkeleton
                      className="h-3 w-20"
                      delay={`${index * 150 + 375}`}
                    />
                  </div>
                  <ShimmerSkeleton
                    className="h-3 w-full mt-2"
                    delay={`${index * 150 + 450}`}
                  />
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
            <GradientSkeleton className="h-6 w-32" />
          </CardTitle>
          <CardDescription>
            <GradientSkeleton className="h-4 w-56" delay="150" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="border-b pb-4">
                <div className="flex items-center justify-between">
                  <ShimmerSkeleton
                    className="h-5 w-48 mb-2"
                    delay={`${index * 200}`}
                  />
                  <ShimmerSkeleton
                    className="h-3 w-20"
                    delay={`${index * 200 + 75}`}
                  />
                </div>
                <WaveSkeleton
                  className="h-3 w-full mt-2"
                  delay={`${index * 200 + 150}`}
                />
                <WaveSkeleton
                  className="h-3 w-full mt-2"
                  delay={`${index * 200 + 225}`}
                />
                <WaveSkeleton
                  className="h-3 w-3/4 mt-2"
                  delay={`${index * 200 + 300}`}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
