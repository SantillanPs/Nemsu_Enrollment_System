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
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
                    delay={`${index * 75}`}
                  />
                  <ShimmerSkeleton
                    className="h-6 w-48"
                    delay={`${index * 75 + 50}`}
                  />
                </div>
                <GradientSkeleton
                  className="h-6 w-20 rounded-full"
                  delay={`${index * 75}`}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center">
                  <PulseSkeleton
                    className="h-4 w-4 mr-2 rounded-full"
                    delay={`${index * 75 + 100}`}
                  />
                  <WaveSkeleton
                    className="h-4 w-32"
                    delay={`${index * 75 + 100}`}
                  />
                </div>
                <div className="flex items-center">
                  <PulseSkeleton
                    className="h-4 w-4 mr-2 rounded-full"
                    delay={`${index * 75 + 150}`}
                  />
                  <WaveSkeleton
                    className="h-4 w-40"
                    delay={`${index * 75 + 150}`}
                  />
                </div>
                <div className="flex items-center">
                  <PulseSkeleton
                    className="h-4 w-4 mr-2 rounded-full"
                    delay={`${index * 75 + 200}`}
                  />
                  <WaveSkeleton
                    className="h-4 w-36"
                    delay={`${index * 75 + 200}`}
                  />
                </div>
              </div>
              <div className="mt-4">
                <ShimmerSkeleton
                  className="h-4 w-full"
                  delay={`${index * 75 + 250}`}
                />
                <ShimmerSkeleton
                  className="h-4 w-full mt-2"
                  delay={`${index * 75 + 300}`}
                />
                <ShimmerSkeleton
                  className="h-4 w-3/4 mt-2"
                  delay={`${index * 75 + 350}`}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <FadeSkeleton
                className="h-9 w-24 rounded-md"
                delay={`${index * 75 + 400}`}
              />
              <FadeSkeleton
                className="h-9 w-24 rounded-md"
                delay={`${index * 75 + 450}`}
              />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
