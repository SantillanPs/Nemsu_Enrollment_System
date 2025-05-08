"use client";

import React from "react";
import { cn } from "@/lib/utils";
import "./skeleton-animations.css";

type AnimationType = "pulse" | "shimmer" | "wave" | "fade" | "gradient";
type DelayType = "75" | "150" | "300" | "500" | "700" | null;
type DurationType = "1000" | "1500" | "2000" | "2500" | null;

interface AnimatedSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  animation?: AnimationType;
  delay?: DelayType;
  duration?: DurationType;
}

export function AnimatedSkeleton({
  className,
  animation = "shimmer",
  delay = null,
  duration = null,
  ...props
}: AnimatedSkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-md bg-muted",
        `skeleton-${animation}`,
        delay && `delay-${delay}`,
        duration && `duration-${duration}`,
        className
      )}
      {...props}
    />
  );
}

// Convenience components for specific animations
export function ShimmerSkeleton({
  className,
  delay,
  duration,
  ...props
}: Omit<AnimatedSkeletonProps, "animation">) {
  return (
    <AnimatedSkeleton
      animation="shimmer"
      delay={delay}
      duration={duration}
      className={className}
      {...props}
    />
  );
}

export function WaveSkeleton({
  className,
  delay,
  duration,
  ...props
}: Omit<AnimatedSkeletonProps, "animation">) {
  return (
    <AnimatedSkeleton
      animation="wave"
      delay={delay}
      duration={duration}
      className={className}
      {...props}
    />
  );
}

export function PulseSkeleton({
  className,
  delay,
  duration,
  ...props
}: Omit<AnimatedSkeletonProps, "animation">) {
  return (
    <AnimatedSkeleton
      animation="pulse"
      delay={delay}
      duration={duration}
      className={className}
      {...props}
    />
  );
}

export function FadeSkeleton({
  className,
  delay,
  duration,
  ...props
}: Omit<AnimatedSkeletonProps, "animation">) {
  return (
    <AnimatedSkeleton
      animation="fade"
      delay={delay}
      duration={duration}
      className={className}
      {...props}
    />
  );
}

export function GradientSkeleton({
  className,
  delay,
  duration,
  ...props
}: Omit<AnimatedSkeletonProps, "animation">) {
  return (
    <AnimatedSkeleton
      animation="gradient"
      delay={delay}
      duration={duration}
      className={className}
      {...props}
    />
  );
}
