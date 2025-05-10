"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface Faculty {
  id: string;
  profile: {
    firstName: string;
    lastName: string;
  };
}

interface Course {
  id: string;
  code: string;
  name: string;
  facultyId: string | null;
  faculty?: Faculty;
}

interface AssignInstructorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: Course | null;
  facultyList: Faculty[];
  selectedFacultyId: string;
  onFacultyChange: (value: string) => void;
  onSave: () => void;
  isSaving: boolean;
}

export function AssignInstructorDialog({
  open,
  onOpenChange,
  course,
  facultyList,
  selectedFacultyId,
  onFacultyChange,
  onSave,
  isSaving,
}: AssignInstructorDialogProps) {
  const instructorName = course?.faculty?.profile
    ? `${course.faculty.profile.firstName} ${course.faculty.profile.lastName}`
    : "No instructor assigned";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Instructor</DialogTitle>
          <DialogDescription>
            {course && `Assign an instructor to ${course.code}: ${course.name}`}
          </DialogDescription>
        </DialogHeader>
        {course && (
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-instructor">Current Instructor</Label>
              <Input id="current-instructor" value={instructorName} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-instructor">New Instructor</Label>
              <Select value={selectedFacultyId} onValueChange={onFacultyChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an instructor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Remove instructor</SelectItem>
                  {facultyList.map((faculty) => (
                    <SelectItem key={faculty.id} value={faculty.id}>
                      {`${faculty.profile.firstName} ${faculty.profile.lastName}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button onClick={onSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Assign Instructor"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
