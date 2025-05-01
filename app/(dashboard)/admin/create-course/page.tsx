"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { BookOpen, Save, X } from "lucide-react"

export default function CreateCourse() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Mock data for form
  const departments = [
    { id: "cs", name: "Computer Science" },
    { id: "bus", name: "Business" },
    { id: "eng", name: "Engineering" },
    { id: "math", name: "Mathematics" },
    { id: "sci", name: "Sciences" },
    { id: "hum", name: "Humanities" },
    { id: "art", name: "Arts" },
  ]

  const faculty = [
    { id: 1, name: "Dr. Alan Turing", department: "Computer Science" },
    { id: 2, name: "Dr. Katherine Johnson", department: "Mathematics" },
    { id: 3, name: "Prof. Jane Austen", department: "English" },
    { id: 4, name: "Dr. Richard Feynman", department: "Physics" },
    { id: 5, name: "Dr. Marie Curie", department: "Chemistry" },
    { id: 6, name: "Prof. Howard Zinn", department: "History" },
    { id: 7, name: "Dr. Rosalind Franklin", department: "Biology" },
    { id: 8, name: "Prof. Philip Kotler", department: "Business" },
  ]

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    // In a real app, this would send a request to your backend
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Redirect to courses page after successful creation
      router.push("/dashboard/admin/courses")
    } catch (error) {
      console.error("Error creating course:", error)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <CardTitle>Create New Course</CardTitle>
          </div>
          <CardDescription>Add a new course to the university catalog</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="courseCode">Course Code *</Label>
                <Input id="courseCode" placeholder="e.g., CS101" required />
                <p className="text-xs text-muted-foreground">Enter a unique course code (department prefix + number)</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="courseTitle">Course Title *</Label>
                <Input id="courseTitle" placeholder="e.g., Introduction to Computer Science" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="courseDescription">Course Description *</Label>
              <Textarea
                id="courseDescription"
                placeholder="Enter a detailed description of the course..."
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="credits">Credits *</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select credits" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Credit</SelectItem>
                    <SelectItem value="2">2 Credits</SelectItem>
                    <SelectItem value="3">3 Credits</SelectItem>
                    <SelectItem value="4">4 Credits</SelectItem>
                    <SelectItem value="5">5 Credits</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="instructor">Primary Instructor *</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select instructor" />
                  </SelectTrigger>
                  <SelectContent>
                    {faculty.map((instructor) => (
                      <SelectItem key={instructor.id} value={instructor.id.toString()}>
                        {instructor.name} ({instructor.department})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Maximum Capacity *</Label>
                <Input id="capacity" type="number" min="1" placeholder="e.g., 30" required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input id="startDate" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input id="endDate" type="date" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Schedule *</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="monday" />
                  <Label htmlFor="monday">Monday</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="tuesday" />
                  <Label htmlFor="tuesday">Tuesday</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="wednesday" />
                  <Label htmlFor="wednesday">Wednesday</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="thursday" />
                  <Label htmlFor="thursday">Thursday</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="friday" />
                  <Label htmlFor="friday">Friday</Label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time *</Label>
                <Input id="startTime" type="time" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time *</Label>
                <Input id="endTime" type="time" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input id="location" placeholder="e.g., Science Building, Room 301" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prerequisites">Prerequisites</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select prerequisites (if any)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="cs100">CS100: Computer Fundamentals</SelectItem>
                  <SelectItem value="math101">MATH101: College Algebra</SelectItem>
                  <SelectItem value="eng101">ENG101: Basic Composition</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Select any prerequisite courses required for enrollment</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="active" defaultChecked />
                <Label htmlFor="active">Make course active and available for enrollment</Label>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard/admin/courses")}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? "Creating Course..." : "Create Course"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
