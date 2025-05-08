"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Plus } from "lucide-react";

interface Section {
  id: string;
  sectionCode: string;
  schedule: string;
  room: string;
  maxStudents: number;
  enrollments: any[];
}

interface SectionSummaryCardProps {
  sections: Section[];
  getInstructorName: (section: Section) => string;
  onAddSection: () => void;
}

export function SectionSummaryCard({
  sections,
  getInstructorName,
  onAddSection,
}: SectionSummaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Section Summary</CardTitle>
        <CardDescription>Quick overview of all sections</CardDescription>
      </CardHeader>
      <CardContent>
        {sections.length > 0 ? (
          <div className="space-y-4">
            {sections.map((section) => (
              <div
                key={section.id}
                className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-medium">Section {section.sectionCode}</p>
                  <p className="text-sm text-muted-foreground">
                    {getInstructorName(section)}
                  </p>
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <Users className="h-3 w-3 mr-1" />
                    <span>
                      {section.enrollments.length}/{section.maxStudents}
                    </span>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No sections created yet</p>
            <Button
              size="sm"
              variant="outline"
              className="mt-2"
              onClick={onAddSection}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Section
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
