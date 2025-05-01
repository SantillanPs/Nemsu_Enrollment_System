"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin } from "lucide-react"

export default function MyCourses() {
  const [activeTab, setActiveTab] = useState("current")

  // Mock data for currently enrolled courses
  const currentCourses = [
    {
      id: 1,
      code: "CS 321",
      title: "Programming Languages",
      section: "3CSC",
      units: 3,
      location: "ICT Bldg Lab",
      schedule: "Tuesday, Friday",
      time: "9:00 AM - 10:30 AM",
      instructor: "Prof. Jhon Mark Palen",
    },
    {
      id: 2,
      code: "CS 322",
      title: "Software Engineering 1",
      section: "3CSC",
      units: 3,
      location: "CECST 501",
      schedule: "Tuesday, Friday",
      time: "2:30 PM - 4:00 PM",
      instructor: "Prof. Catherine Alimboyong",
    },
    {
      id: 3,
      code: "Cs 323",
      title: "Social Issues and Professional",
      section: "3CSC",
      units: 3,
      location: "CECST 501",
      schedule: "Tuesday, Friday",
      time: "4:00 PM - 5:30 PM",
      instructor: "Prof. Nap Salera",
    },
    {
      id: 4,
      code: "CS 324",
      title: "Graphics and Visual Computing",
      section: "3CSC",
      units: 3,
      location: "ICT Bldg Lab",
      schedule: "Tuesday, Friday",
      time: "1:00 PM - 2:30 PM",
      instructor: "Prof. Jhon Mark Palen",
    },
    {
      id: 5,
      code: "CS 325",
      title: "Mobile Computing 1",
      section: "3CSC",
      units: 3,
      location: "ICT Bldg Lab",
      schedule: "Tuesday, Friday",
      time: "10:30 AM - 12:00 PM",
      instructor: "Prof. Virgilio Tuga",
    },
    {
      id: 6,
      code: "CS 326",
      title: "Modeling and Simulation",
      section: "3CSC",
      units: 3,
      location: "CECST 603",
      schedule: "Tuesday, Friday",
      time: "7:30 AM - 9:00 AM",
      instructor: "Prof. Bryan Legaspo Guibijar",
    },
  ]

  // Mock data for previous courses
  const previousCourses = [
    {
    "id": 1,
    "code": "CS 214",
    "title": "Embedded Systems and Technologies 2",
    "section": "3CSC",
    "units": 3,
    "grade": "1.8",
    "instructor": "Prof. Howard Zinn"
  },
  {
    "id": 2,
    "code": "CS 216",
    "title": "Web Systems and Technologies 2",
    "section": "3CSC",
    "units": 3,
    "grade": "2.0",
    "instructor": "Prof. Howard Zinn"
  },
  {
    "id": 3,
    "code": "CS 311",
    "title": "System Fundamentals - Elective 1",
    "section": "3CSC",
    "units": 3,
    "grade": "1.4",
    "instructor": "Prof. Howard Zinn"
  },
  {
    "id": 4,
    "code": "CS 312",
    "title": "Information Assurance and Security",
    "section": "3CSC",
    "units": 3,
    "grade": "1.5",
    "instructor": "Prof. Howard Zinn"
  },
  {
    "id": 5,
    "code": "CS 313",
    "title": "Automata Theory and Formal Languages",
    "section": "3CSC",
    "units": 3,
    "grade": "1.8",
    "instructor": "Prof. Howard Zinn"
  },
  {
    "id": 6,
    "code": "CS 314",
    "title": "Architecture and Organization",
    "section": "3CSC",
    "units": 3,
    "grade": "2.0",
    "instructor": "Prof. Howard Zinn"
  },
  {
    "id": 7,
    "code": "Rizal",
    "title": "Life Works of Jose Rizal",
    "section": "3CSC",
    "units": 3,
    "grade": "2.0",
    "instructor": "Prof. Howard Zinn"
  },
  {
    "id": 8,
    "code": "CS 315",
    "title": "Application Devt. & Emerging Technologies",
    "section": "3CSC",
    "units": 3,
    "grade": "2.3",
    "instructor": "Prof. Howard Zinn"
  }
  ]

  

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Courses</h1>
        <div>
          <Badge className="mr-2 bg-blue-100 text-blue-800">Total Credits: 10</Badge>
          <Badge className="bg-green-100 text-green-800">GPA: 1.7</Badge>
        </div>
      </div>

      <Tabs defaultValue="current" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="current">Currently Enrolled</TabsTrigger>
          <TabsTrigger value="previous">Previously Enrolled</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="mt-6">
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left font-medium p-3">Name</th>
                    <th className="text-left font-medium p-3">Description</th>
                    <th className="text-left font-medium p-3">Section</th>
                    <th className="text-left font-medium p-3">Units</th>
                    <th className="text-left font-medium p-3">Room</th>
                    <th className="text-left font-medium p-3">Schedule</th>
                    <th className="text-left font-medium p-3">Time</th>
                    <th className="text-right font-medium p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentCourses.map((course) => (
                    <tr key={course.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">{course.code}</td>
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{course.title}</div>
                          <div className="text-xs text-gray-500 mt-1">{course.instructor}</div>
                        </div>
                      </td>
                      <td className="p-3">{course.section}</td>
                      <td className="p-3 text-center">{course.units}</td>
                      <td className="p-3">
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1 text-gray-500" />
                          {course.location}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1 text-gray-500" />
                          {course.schedule}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1 text-gray-500" />
                          {course.time}
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <Button variant="outline" size="sm">
                          Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {currentCourses.length === 0 && (
            <div className="text-center py-10">
              <h3 className="text-lg font-medium">No currently enrolled courses</h3>
              <p className="text-muted-foreground mt-1">Browse available courses to enroll</p>
              <Button className="mt-4">Browse Courses</Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="previous" className="mt-6">
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left font-medium p-3">Course Code</th>
                    <th className="text-left font-medium p-3">Course Description</th>
                    <th className="text-left font-medium p-3">Section</th>
                    <th className="text-left font-medium p-3">Units</th>
                    <th className="text-left font-medium p-3">Grade</th>
                    <th className="text-right font-medium p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {previousCourses.map((course) => (
                    <tr key={course.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">{course.code}</td>
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{course.title}</div>
                          <div className="text-xs text-gray-500 mt-1">{course.instructor}</div>
                        </div>
                      </td>
                      <td className="p-3">{course.section}</td>
                      <td className="p-3 text center">{course.units}</td>
                      <td className="p-3">
                        <Badge
                          className={
                            course.grade.startsWith("1")
                              ? "bg-green-100 text-green-800"
                              : course.grade.startsWith("2")
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {course.grade}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        <Button variant="outline" size="sm">
                          Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {previousCourses.length === 0 && (
            <div className="text-center py-10">
              <h3 className="text-lg font-medium">No previous courses</h3>
              <p className="text-muted-foreground mt-1">You haven't completed any courses yet</p>
            </div>
          )}
        </TabsContent>

        
      </Tabs>
    </div>
  )
}
