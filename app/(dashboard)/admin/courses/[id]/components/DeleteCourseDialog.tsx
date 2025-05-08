"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: () => void;
  courseCode: string;
  courseName: string;
  sectionsCount: number;
  enrollmentsCount: number;
}

export function DeleteCourseDialog({
  open,
  onOpenChange,
  onConfirmDelete,
  courseCode,
  courseName,
  sectionsCount,
  enrollmentsCount,
}: DeleteCourseDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Course</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this course? This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4">
          <div>
            <p className="font-medium">
              {courseCode}: {courseName}
            </p>
            <p className="text-sm text-muted-foreground">
              Sections: {sectionsCount}
            </p>
            <p className="text-sm text-muted-foreground">
              Enrolled Students: {enrollmentsCount}
            </p>
          </div>
          {enrollmentsCount > 0 && (
            <div className="mt-4 bg-red-50 p-3 rounded-md">
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> This course has {enrollmentsCount}{" "}
                enrolled students. Deleting it will remove all student
                enrollments and sections.
              </p>
            </div>
          )}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirmDelete}
            className="bg-red-600 hover:bg-red-700"
          >
            Delete Course
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
