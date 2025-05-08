"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Section {
  id: string;
  sectionCode: string;
  schedule: string;
  room: string;
  enrollments: any[];
}

interface DeleteSectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSection: Section | null;
  onConfirmDelete: () => void;
  getInstructorName: (section: Section) => string;
}

export function DeleteSectionDialog({
  open,
  onOpenChange,
  selectedSection,
  onConfirmDelete,
  getInstructorName,
}: DeleteSectionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Section</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this section? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        {selectedSection && (
          <div className="py-4">
            <div>
              <p className="font-medium">Section {selectedSection.sectionCode}</p>
              <p className="text-sm text-muted-foreground">
                Instructor: {getInstructorName(selectedSection)}
              </p>
              <p className="text-sm text-muted-foreground">
                Schedule: {selectedSection.schedule}
              </p>
              <p className="text-sm text-muted-foreground">
                Location: {selectedSection.room}
              </p>
            </div>
            {selectedSection.enrollments.length > 0 && (
              <div className="mt-4 bg-red-50 p-3 rounded-md">
                <p className="text-sm text-red-800">
                  <strong>Warning:</strong> This section has{" "}
                  {selectedSection.enrollments.length} enrolled students. Deleting
                  it will remove all student enrollments.
                </p>
              </div>
            )}
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirmDelete}>
            Delete Section
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
