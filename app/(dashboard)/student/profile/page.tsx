"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const profileFormSchema = z.object({
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  dateOfBirth: z.date({
    required_error: "A date of birth is required.",
  }),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface AcademicInfo {
  totalCredits: number;
  gpa: number;
  currentEnrolledUnits: number;
  maxUnits: number;
  enrollmentStatus: string;
  academicStatus: string;
}

export default function StudentProfile() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [academicInfo, setAcademicInfo] = useState<AcademicInfo | null>(null);
  const { toast } = useToast();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: new Date(),
      phone: "",
      address: "",
    },
  });

  // Load profile data
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const response = await fetch("/api/profile");
        const data = await response.json();

        if (data.profile) {
          form.reset({
            firstName: data.profile.firstName,
            lastName: data.profile.lastName,
            dateOfBirth: new Date(data.profile.dateOfBirth),
            phone: data.profile.phone || "",
            address: data.profile.address || "",
          });
        }

        if (data.academic) {
          setAcademicInfo(data.academic);
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data. Please try again.",
          variant: "destructive",
        });
      }
    };

    loadProfileData();
  }, [form, toast]);

  // Save profile changes
  const onSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            View and update your personal information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date of Birth</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[240px] pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 000-0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="123 Main St, City, Country"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Academic Information</CardTitle>
          <CardDescription>Your academic progress and status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <h4 className="text-sm font-medium">Current Program</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Bachelor of Science in Computer Science
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Academic Status</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {academicInfo?.academicStatus || "Loading..."}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Enrollment Status</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {academicInfo?.enrollmentStatus || "Loading..."}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Total Credits Earned</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {academicInfo
                  ? `${academicInfo.totalCredits} credits`
                  : "Loading..."}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Current GPA</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {academicInfo?.gpa.toFixed(2) || "Loading..."}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Expected Graduation</h4>
              <p className="text-sm text-muted-foreground mt-1">Spring 2025</p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Current Enrolled Units</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {academicInfo
                  ? `${academicInfo.currentEnrolledUnits} / ${academicInfo.maxUnits} units`
                  : "Loading..."}
              </p>
              {academicInfo && (
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div
                    className={`h-2.5 rounded-full ${
                      academicInfo.currentEnrolledUnits /
                        academicInfo.maxUnits >
                      0.8
                        ? "bg-red-500"
                        : academicInfo.currentEnrolledUnits /
                            academicInfo.maxUnits >
                          0.5
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        (academicInfo.currentEnrolledUnits /
                          academicInfo.maxUnits) *
                          100
                      )}%`,
                    }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
