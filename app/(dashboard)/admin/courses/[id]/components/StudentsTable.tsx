"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Student {
  id: string;
  profile: {
    firstName: string;
    lastName: string;
    studentId?: string;
  };
}

interface Enrollment {
  id: string;
  student: Student;
}

interface Section {
  id: string;
  sectionCode: string;
  enrollments: Enrollment[];
}

interface StudentsTableProps {
  sections: Section[];
}

export function StudentsTable({ sections }: StudentsTableProps) {
  return (
    <Tabs defaultValue={sections.length > 0 ? `section-${sections[0]?.id}` : ""}>
      <TabsList className="mb-4">
        {sections.map((section) => (
          <TabsTrigger key={section.id} value={`section-${section.id}`}>
            Section {section.sectionCode}
          </TabsTrigger>
        ))}
      </TabsList>
      {sections.map((section) => (
        <TabsContent key={section.id} value={`section-${section.id}`}>
          {section.enrollments.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {section.enrollments.map((enrollment) => (
                    <TableRow key={enrollment.id}>
                      <TableCell>
                        {enrollment.student.profile.studentId || "N/A"}
                      </TableCell>
                      <TableCell>
                        {`${enrollment.student.profile.firstName} ${enrollment.student.profile.lastName}`}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          View Profile
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-10">
              <h3 className="text-lg font-medium">No students enrolled</h3>
              <p className="text-muted-foreground mt-1">
                This section has no enrolled students
              </p>
            </div>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}
