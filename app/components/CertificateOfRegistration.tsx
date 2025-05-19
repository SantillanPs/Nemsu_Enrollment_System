"use client";

import React from "react";
import { format } from "date-fns";
import UniversityLogo from "./UniversityLogo";

interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  section?: {
    sectionCode: string;
    room: string;
    schedule: string;
  };
}

interface Section {
  id: string;
  sectionCode: string;
  schedule: string;
  room: string;
}

interface Enrollment {
  id: string;
  status: string;
  course: Course;
  section?: Section;
}

interface StudentProfile {
  firstName: string;
  lastName: string;
  studentId: string;
  address?: string;
  schoolYear?: number;
}

interface CertificateProps {
  studentProfile: StudentProfile;
  enrollments: Enrollment[];
  currentSemester: string;
  currentYear: string;
}

const CertificateOfRegistration: React.FC<CertificateProps> = ({
  studentProfile,
  enrollments,
  currentSemester,
  currentYear,
}) => {
  const totalCredits = enrollments.reduce(
    (sum, enrollment) => sum + enrollment.course.credits,
    0
  );

  // Format the current date
  const currentDate = format(new Date(), "MM/dd/yyyy");

  return (
    <div className="w-full bg-white p-8" id="certificate-container">
      {/* Header with University Logo and Name */}
      <div className="flex items-center mb-4">
        <div className="w-20 h-20 relative mr-4">
          <UniversityLogo width={80} height={80} />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-center">
            NORTH EASTERN MINDANAO STATE UNIVERSITY
          </h1>
          <p className="text-sm text-center">
            Formerly Surigao del Sur State University
          </p>
          <p className="text-sm text-center">
            Tandag City, Surigao del Sur, Philippines
          </p>
          <p className="text-sm text-center">
            (6826) No. (086) 214-4057 | www.nemsu.edu.ph
          </p>
        </div>
      </div>

      {/* Certificate Title */}
      <div className="bg-blue-200 py-2 mb-6">
        <h2 className="text-2xl font-bold text-center">
          CERTIFICATE OF REGISTRATION
        </h2>
      </div>

      {/* Student Information */}
      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div>
          <div className="flex mb-2">
            <span className="font-semibold w-32">Enrollment No.:</span>
            <span>{Math.floor(10000000 + Math.random() * 90000000)}</span>
          </div>
          <div className="flex mb-2">
            <span className="font-semibold w-32">Student No.:</span>
            <span>{studentProfile.studentId}</span>
          </div>
          <div className="flex mb-2">
            <span className="font-semibold w-32">Student Name:</span>
            <span>
              {studentProfile.lastName}, {studentProfile.firstName}
            </span>
          </div>
          <div className="flex mb-2">
            <span className="font-semibold w-32">Address:</span>
            <span>
              {studentProfile.address || "Tandag City, Surigao del Sur"}
            </span>
          </div>
          <div className="flex mb-2">
            <span className="font-semibold w-32">Course:</span>
            <span>BACHELOR OF SCIENCE IN COMPUTER SCIENCE</span>
          </div>
          <div className="flex mb-2">
            <span className="font-semibold w-32">Department:</span>
            <span>COLLEGE OF ENGINEERING, COMPUTER STUDIES AND TECHNOLOGY</span>
          </div>
          <div className="flex mb-2">
            <span className="font-semibold w-32">Scholarship/Grant:</span>
            <span>ZERO COLLECTION PROGRAM</span>
          </div>
        </div>
        <div>
          <div className="flex mb-2">
            <span className="font-semibold w-32">Enrollment Date:</span>
            <span>{currentDate}</span>
          </div>
          <div className="flex mb-2">
            <span className="font-semibold w-32">Curriculum:</span>
            <span>{currentYear}</span>
          </div>
          <div className="flex mb-2">
            <span className="font-semibold w-32">School Year:</span>
            <span>
              {currentYear} / {currentSemester}
            </span>
          </div>
          <div className="flex mb-2">
            <span className="font-semibold w-32">Year Level:</span>
            <span>
              {studentProfile.schoolYear
                ? `${getYearLevelText(studentProfile.schoolYear)} Year`
                : "First Year"}
            </span>
          </div>
          <div className="flex mb-2">
            <span className="font-semibold w-32">Student Type:</span>
            <span>Regular Student</span>
          </div>
        </div>
      </div>

      {/* Class Schedule */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-center border-2 border-gray-300 py-1 mb-2">
          CLASS SCHEDULE
        </h3>
        <table className="w-full border-collapse border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-1 text-left">SCHEDULE</th>
              <th className="border border-gray-300 p-1 text-left">
                SUBJECT CODE
              </th>
              <th className="border border-gray-300 p-1 text-left">
                SUBJECT NAME
              </th>
              <th className="border border-gray-300 p-1 text-left">SECTION</th>
              <th className="border border-gray-300 p-1 text-center">UNITS</th>
              <th className="border border-gray-300 p-1 text-left">ROOM</th>
              <th className="border border-gray-300 p-1 text-left">DAYS</th>
              <th className="border border-gray-300 p-1 text-left">TIME</th>
              <th className="border border-gray-300 p-1 text-center">
                PAY UNITS
              </th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map((enrollment) => (
              <tr key={enrollment.id}>
                <td className="border border-gray-300 p-1"></td>
                <td className="border border-gray-300 p-1">
                  {enrollment.course.code}
                </td>
                <td className="border border-gray-300 p-1">
                  {enrollment.course.name}
                </td>
                <td className="border border-gray-300 p-1">
                  {enrollment.section?.sectionCode ||
                    enrollment.course.section?.sectionCode ||
                    "3CSC"}
                </td>
                <td className="border border-gray-300 p-1 text-center">
                  {enrollment.course.credits.toFixed(1)}
                </td>
                <td className="border border-gray-300 p-1">
                  {enrollment.section?.room ||
                    enrollment.course.section?.room ||
                    "CECST 501"}
                </td>
                <td className="border border-gray-300 p-1">
                  {enrollment.section?.schedule
                    ? getScheduleDays(enrollment.section.schedule)
                    : enrollment.course.section?.schedule
                    ? getScheduleDays(enrollment.course.section.schedule)
                    : "TF"}
                </td>
                <td className="border border-gray-300 p-1">
                  {enrollment.section?.schedule
                    ? getScheduleTime(enrollment.section.schedule)
                    : enrollment.course.section?.schedule
                    ? getScheduleTime(enrollment.course.section.schedule)
                    : getRandomTimeSlot()}
                </td>
                <td className="border border-gray-300 p-1 text-center">
                  {enrollment.course.credits.toFixed(1)}
                </td>
              </tr>
            ))}
            <tr>
              <td
                colSpan={4}
                className="border border-gray-300 p-1 text-right font-bold"
              >
                TOTAL:
              </td>
              <td className="border border-gray-300 p-1 text-center font-bold">
                {totalCredits.toFixed(1)}
              </td>
              <td colSpan={3} className="border border-gray-300 p-1"></td>
              <td className="border border-gray-300 p-1 text-center font-bold">
                {totalCredits.toFixed(1)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="text-sm mt-8">
        <p>
          This is to certify that the student whose name appears on this
          document is officially enrolled this term.
        </p>
        <p className="mt-1">The student had listed above subjects/courses.</p>
      </div>
    </div>
  );
};

// Helper function to get year level text
function getYearLevelText(yearLevel: number): string {
  switch (yearLevel) {
    case 1:
      return "First";
    case 2:
      return "Second";
    case 3:
      return "Third";
    case 4:
      return "Fourth";
    case 5:
      return "Fifth";
    default:
      return "First";
  }
}

// Helper function to generate random time slots for demo purposes
function getRandomTimeSlot(): string {
  const timeSlots = [
    "9:00AM-10:30AM",
    "10:30AM-12:00PM",
    "1:00PM-2:30PM",
    "2:30PM-4:00PM",
    "4:00PM-5:30PM",
  ];
  return timeSlots[Math.floor(Math.random() * timeSlots.length)];
}

// Helper function to extract days from schedule string
function getScheduleDays(schedule: string): string {
  // Example formats: "MWF 9:00AM-10:30AM", "TTh 1:00PM-2:30PM"
  const days = schedule.split(" ")[0];
  if (days.includes("M")) return "M";
  if (days.includes("T") && days.includes("Th")) return "TTh";
  if (days.includes("T") && !days.includes("h")) return "T";
  if (days.includes("W")) return "W";
  if (days.includes("F")) return "F";
  return days || "TF"; // Default to TF if no days found
}

// Helper function to extract time from schedule string
function getScheduleTime(schedule: string): string {
  // Example formats: "MWF 9:00AM-10:30AM", "TTh 1:00PM-2:30PM"
  const parts = schedule.split(" ");
  if (parts.length > 1) {
    return parts[1]; // Return the time part
  }
  return getRandomTimeSlot(); // Fallback to random time slot
}

export default CertificateOfRegistration;
