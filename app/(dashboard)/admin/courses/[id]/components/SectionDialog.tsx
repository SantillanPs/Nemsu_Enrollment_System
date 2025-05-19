"use client";

import { useState, useEffect } from "react";
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

interface Section {
  id: string;
  sectionCode: string;
  schedule: string;
  room: string;
  maxStudents: number;
}

interface SectionFormData {
  sectionCode: string;
  schedule: string;
  room: string;
  maxStudents: number | string;
}

interface SectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSection: Section | null;
  courseCode: string;
  courseName: string;
  onSave: () => void;
  formData: SectionFormData;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function SectionDialog({
  open,
  onOpenChange,
  selectedSection,
  courseCode,
  courseName,
  onSave,
  formData,
  onFormChange,
}: SectionDialogProps) {
  const [days, setDays] = useState<string>("none");
  const [time, setTime] = useState<string>("none");

  // Update schedule when days or time changes
  useEffect(() => {
    // Skip if the dialog is not open
    if (!open) return;

    // Handle the "none" value as empty string
    const effectiveDays = days === "none" ? "" : days;
    const effectiveTime = time === "none" ? "" : time;

    // Create the new schedule string
    const newSchedule =
      effectiveDays && effectiveTime
        ? `${effectiveDays} ${effectiveTime}`
        : effectiveDays
        ? `${effectiveDays} (Time TBD)`
        : effectiveTime
        ? `(Days TBD) ${effectiveTime}`
        : "TBD";

    // Only update if the schedule has actually changed
    if (newSchedule !== formData.schedule) {
      const event = {
        target: {
          name: "schedule",
          value: newSchedule,
        },
      } as React.ChangeEvent<HTMLInputElement>;
      onFormChange(event);
    }
  }, [days, time, open, formData.schedule, onFormChange]);

  // Parse schedule into days and time when editing or when dialog opens/closes
  useEffect(() => {
    // Only run this effect when the dialog opens
    if (!open) return;

    // If we have a selected section with a valid schedule
    if (selectedSection?.schedule && selectedSection.schedule !== "TBD") {
      try {
        const parts = selectedSection.schedule.split(" ");
        if (parts.length >= 3) {
          const scheduleDays = parts.slice(0, parts.length - 2).join(" ");
          const scheduleTime = parts.slice(parts.length - 2).join(" ");
          setDays(scheduleDays);
          setTime(scheduleTime);
        } else {
          // Handle simple schedule format
          setDays("none");
          setTime("none");
        }
      } catch (error) {
        console.error("Error parsing schedule:", error);
        setDays("none");
        setTime("none");
      }
    } else {
      // Reset when adding a new section or when schedule is TBD
      setDays("none");
      setTime("none");
    }
  }, [selectedSection, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {selectedSection ? "Edit Section" : "Add New Section"}
          </DialogTitle>
          <DialogDescription>
            {selectedSection
              ? `Edit details for Section ${selectedSection.sectionCode}`
              : "Add a new section to this course"}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <p className="text-sm font-medium">Course</p>
            <p className="text-sm">
              {courseCode}: {courseName}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sectionCode">
              Section Code<span className="text-red-500">*</span>
            </Label>
            <Input
              id="sectionCode"
              name="sectionCode"
              placeholder="e.g., A, B, C"
              value={formData.sectionCode}
              onChange={onFormChange}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="days">
                Days <span className="text-gray-400 text-xs">(Optional)</span>
              </Label>
              <Select value={days} onValueChange={setDays}>
                <SelectTrigger id="days">
                  <SelectValue placeholder="Select days" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="Mon, Wed">Monday, Wednesday</SelectItem>
                  <SelectItem value="Tue, Thu">Tuesday, Thursday</SelectItem>
                  <SelectItem value="Mon, Wed, Fri">
                    Monday, Wednesday, Friday
                  </SelectItem>
                  <SelectItem value="Tue, Fri">Tuesday, Friday</SelectItem>
                  <SelectItem value="Mon">Monday</SelectItem>
                  <SelectItem value="Tue">Tuesday</SelectItem>
                  <SelectItem value="Wed">Wednesday</SelectItem>
                  <SelectItem value="Thu">Thursday</SelectItem>
                  <SelectItem value="Fri">Friday</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">
                Time <span className="text-gray-400 text-xs">(Optional)</span>
              </Label>
              <Select value={time} onValueChange={setTime}>
                <SelectTrigger id="time">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="9:00 AM - 10:30 AM">
                    9:00 AM - 10:30 AM
                  </SelectItem>
                  <SelectItem value="10:30 AM - 12:00 PM">
                    10:30 AM - 12:00 PM
                  </SelectItem>
                  <SelectItem value="1:00 PM - 2:30 PM">
                    1:00 PM - 2:30 PM
                  </SelectItem>
                  <SelectItem value="3:00 PM - 4:30 PM">
                    3:00 PM - 4:30 PM
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="room">
              Location<span className="text-red-500">*</span>
            </Label>
            <Input
              id="room"
              name="room"
              placeholder="e.g., Science Building, Room 301"
              value={formData.room}
              onChange={onFormChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxStudents">Capacity</Label>
            <Input
              id="maxStudents"
              name="maxStudents"
              type="number"
              min="1"
              placeholder="e.g., 30"
              value={formData.maxStudents === "" ? "" : formData.maxStudents}
              onChange={onFormChange}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={onSave}
            disabled={!formData.sectionCode || !formData.room}
          >
            {selectedSection ? "Save Changes" : "Add Section"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
