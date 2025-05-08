"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, User, Trash2 } from "lucide-react";

interface Section {
  id: string;
  sectionCode: string;
  schedule: string;
  room: string;
  maxStudents: number;
  enrollments: any[];
}

interface SectionsTableProps {
  sections: Section[];
  getInstructorName: (section: Section) => string;
  onEditSection: (section: Section) => void;
  onAssignInstructor: (section: Section) => void;
  onDeleteSection: (section: Section) => void;
}

export function SectionsTable({
  sections,
  getInstructorName,
  onEditSection,
  onAssignInstructor,
  onDeleteSection,
}: SectionsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Section</TableHead>
          <TableHead>Instructor</TableHead>
          <TableHead>Schedule</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Enrollment</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sections.map((section) => (
          <TableRow key={section.id}>
            <TableCell className="font-medium">
              {section.sectionCode}
            </TableCell>
            <TableCell>{getInstructorName(section)}</TableCell>
            <TableCell>{section.schedule}</TableCell>
            <TableCell>{section.room}</TableCell>
            <TableCell>
              <div className="flex items-center">
                <span className="mr-2">
                  {section.enrollments.length}/{section.maxStudents}
                </span>
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      section.enrollments.length / section.maxStudents > 0.9
                        ? "bg-red-500"
                        : section.enrollments.length / section.maxStudents > 0.7
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                    style={{
                      width: `${
                        (section.enrollments.length / section.maxStudents) * 100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge className="bg-green-100 text-green-800">
                Active
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onAssignInstructor(section)}
                >
                  <User className="h-4 w-4" />
                  <span className="sr-only">Assign Instructor</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditSection(section)}
                >
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Edit Section</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600"
                  onClick={() => onDeleteSection(section)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete Section</span>
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
