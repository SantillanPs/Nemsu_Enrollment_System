"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Edit, Plus, Trash2 } from "lucide-react";

interface CourseHeaderProps {
  courseId: string;
  courseCode: string;
  courseName: string;
  onAddSection: () => void;
  onDeleteCourse: () => void;
}

export function CourseHeader({
  courseId,
  courseCode,
  courseName,
  onAddSection,
  onDeleteCourse,
}: CourseHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <Link href="/admin/courses">
          <Button variant="ghost" size="sm" className="mr-2">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Courses
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">
          {courseCode}: {courseName}
        </h1>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onDeleteCourse}
          className="text-red-600"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Course
        </Button>
        <Link href={`/admin/courses/edit/${courseId}`}>
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit Course
          </Button>
        </Link>
        <Button onClick={onAddSection}>
          <Plus className="h-4 w-4 mr-2" />
          Add Section
        </Button>
      </div>
    </div>
  );
}
