"use client";

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
  CardHeader,
  CardFooter,
} from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Enrollment Status Card Skeleton */}
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

      {/* Tabs Skeleton */}
      <div className="border-b">
        <div className="flex space-x-4">
          <FadeSkeleton className="h-10 w-24" />
          <FadeSkeleton className="h-10 w-24" delay="150" />
          <FadeSkeleton className="h-10 w-24" delay="300" />
        </div>
      </div>

      {/* Course Cards Skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <ShimmerSkeleton
                    className="h-5 w-16 mb-2"
                    delay={index % 2 === 0 ? "75" : "150"}
                  />
                  <ShimmerSkeleton
                    className="h-6 w-48"
                    delay={index % 2 === 0 ? "150" : "300"}
                  />
                </div>
                <GradientSkeleton
                  className="h-6 w-20 rounded-full"
                  delay={
                    index === 0
                      ? "75"
                      : index === 1
                      ? "150"
                      : index === 2
                      ? "300"
                      : index === 3
                      ? "500"
                      : "700"
                  }
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center">
                  <PulseSkeleton
                    className="h-4 w-4 mr-2 rounded-full"
                    delay="75"
                  />
                  <WaveSkeleton className="h-4 w-32" delay="75" />
                </div>
                <div className="flex items-center">
                  <PulseSkeleton
                    className="h-4 w-4 mr-2 rounded-full"
                    delay="150"
                  />
                  <WaveSkeleton className="h-4 w-40" delay="150" />
                </div>
                <div className="flex items-center">
                  <PulseSkeleton
                    className="h-4 w-4 mr-2 rounded-full"
                    delay="300"
                  />
                  <WaveSkeleton className="h-4 w-36" delay="300" />
                </div>
              </div>
              <div className="mt-4">
                <ShimmerSkeleton className="h-4 w-full" delay="75" />
                <ShimmerSkeleton className="h-4 w-full mt-2" delay="150" />
                <ShimmerSkeleton className="h-4 w-3/4 mt-2" delay="300" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <FadeSkeleton className="h-9 w-24 rounded-md" delay="500" />
              <FadeSkeleton className="h-9 w-24 rounded-md" delay="700" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
