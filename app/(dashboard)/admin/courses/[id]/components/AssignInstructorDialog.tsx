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

interface Faculty {
  id: string;
  profile: {
    firstName: string;
    lastName: string;
  };
}

interface Section {
  id: string;
  sectionCode: string;
  schedule: string;
  room: string;
}

interface AssignInstructorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSection: Section | null;
  courseCode: string;
  courseName: string;
  facultyList: Faculty[];
  selectedFacultyId: string;
  onFacultyChange: (value: string) => void;
  onSave: () => void;
  instructorName: string;
}

export function AssignInstructorDialog({
  open,
  onOpenChange,
  selectedSection,
  courseCode,
  courseName,
  facultyList,
  selectedFacultyId,
  onFacultyChange,
  onSave,
  instructorName,
}: AssignInstructorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Instructor</DialogTitle>
          <DialogDescription>
            {selectedSection &&
              `Assign an instructor to Section ${selectedSection.sectionCode}`}
          </DialogDescription>
        </DialogHeader>
        {selectedSection && (
          <div className="py-4 space-y-4">
            <div>
              <p className="text-sm font-medium">Course</p>
              <p className="text-sm">
                {courseCode}: {courseName}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Section</p>
              <p className="text-sm">
                Section {selectedSection.sectionCode} • {selectedSection.schedule} •{" "}
                {selectedSection.room}
              </p>
            </div>
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave}>Assign Instructor</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
