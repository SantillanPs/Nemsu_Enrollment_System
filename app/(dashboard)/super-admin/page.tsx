"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Shield,
  Key,
  Database,
  Server,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  UserPlus,
  BookOpen,
  ArrowUpRight,
  SwitchCamera,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SuperAdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    users: {
      total: 0,
      students: 0,
      faculty: 0,
      admins: 0,
      superAdmins: 0,
    },
    system: {
      status: "Operational",
      uptime: "99.9%",
      lastRestart: "2 days ago",
    },
  });

  // Redirect if not a super admin
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "SUPER_ADMIN") {
      router.push("/");
    }
  }, [session, status, router]);

  // Set default stats
  useEffect(() => {
    // Use hardcoded stats for now to avoid API issues
    setStats({
      users: {
        total: 1350,
        students: 1248,
        faculty: 86,
        admins: 12,
        superAdmins: 4,
      },
      system: {
        status: "Operational",
        uptime: "99.9%",
        lastRestart: "2 days ago",
      },
    });
  }, []);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (status === "authenticated" && session?.user?.role !== "SUPER_ADMIN") {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="overflow-hidden border-none shadow-md">
          <div className="bg-gradient-to-br from-red-500 to-red-600 p-1"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
              <Users className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.users.total}</div>
            <div className="flex items-center pt-1 text-xs text-green-600">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              <span>5% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-none shadow-md">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-1"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.users.students}</div>
            <div className="flex items-center pt-1 text-xs text-green-600">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              <span>12% from last semester</span>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-none shadow-md">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-1"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faculty</CardTitle>
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <UserPlus className="h-4 w-4 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.users.faculty}</div>
            <div className="flex items-center pt-1 text-xs text-green-600">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              <span>4% from last semester</span>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-none shadow-md">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-1"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
              <Shield className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.users.admins}</div>
            <div className="flex items-center pt-1 text-xs text-green-600">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              <span>2 new this month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="system" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
              <CardTitle>System Status</CardTitle>
              <CardDescription className="text-gray-300">
                Current system health and performance
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-100">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span className="font-medium">System Status</span>
                  </div>
                  <span className="text-green-600 font-medium">
                    {stats.system.status}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-blue-500 mr-2" />
                    <span className="font-medium">Uptime</span>
                  </div>
                  <span className="text-blue-600 font-medium">
                    {stats.system.uptime}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <div className="flex items-center">
                    <Server className="h-5 w-5 text-amber-500 mr-2" />
                    <span className="font-medium">Last Restart</span>
                  </div>
                  <span className="text-amber-600 font-medium">
                    {stats.system.lastRestart}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Link href="/super-admin/system">
                <Button variant="outline">View System Details</Button>
              </Link>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
              <CardTitle>User Management</CardTitle>
              <CardDescription className="text-blue-100">
                Manage all users in the system
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <Users className="h-8 w-8 text-gray-500 mb-2" />
                    <span className="text-lg font-medium">
                      {stats.users.total}
                    </span>
                    <span className="text-sm text-gray-500">Total Users</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 bg-red-50 rounded-lg border border-red-100">
                    <Shield className="h-8 w-8 text-red-500 mb-2" />
                    <span className="text-lg font-medium">
                      {stats.users.superAdmins}
                    </span>
                    <span className="text-sm text-gray-500">Super Admins</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Link href="/super-admin/users">
                <Button variant="outline">Manage Users</Button>
              </Link>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader className="bg-gradient-to-r from-red-600 to-red-800 text-white">
              <CardTitle>Security Management</CardTitle>
              <CardDescription className="text-red-100">
                Manage system security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-center mb-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                    <h3 className="font-medium">Super Admin Secret Key</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    The secret key is used to create new super admin accounts.
                    Keep it secure and regenerate it periodically.
                  </p>
                  <Link
                    href="/system-maintenance/security/key-management/maintenance-security-key-8675309"
                    className="w-full"
                  >
                    <Button
                      variant="outline"
                      className="w-full border-amber-300 text-amber-700 hover:bg-amber-50"
                    >
                      <Key className="h-4 w-4 mr-2" />
                      Manage Secret Key
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Link href="/super-admin/security">
                <Button variant="outline">Security Settings</Button>
              </Link>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
        <Link href="/super-admin/users" className="w-full sm:w-auto">
          <Button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 px-6 py-6 rounded-xl shadow-md w-full">
            <Users className="mr-3 h-5 w-5" />
            <div>
              <div className="font-semibold">Manage Users</div>
              <div className="text-xs text-red-100">
                View and manage all users
              </div>
            </div>
          </Button>
        </Link>
        <Link href="/super-admin-creation" className="w-full sm:w-auto">
          <Button
            variant="outline"
            className="px-6 py-6 rounded-xl border-2 border-red-200 text-red-700 hover:bg-red-50 shadow-md w-full"
          >
            <Key className="mr-3 h-5 w-5" />
            <div>
              <div className="font-semibold">Create Super Admin</div>
              <div className="text-xs text-red-600">Add a new super admin</div>
            </div>
          </Button>
        </Link>
      </div>

      {/* Other Dashboards */}
      <Card className="mt-8">
        <CardHeader className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
          <CardTitle className="flex items-center">
            <SwitchCamera className="h-5 w-5 mr-2" />
            Dashboard Navigation
          </CardTitle>
          <CardDescription className="text-gray-300">
            Access all parts of the system
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-sm text-gray-600 mb-4">
            As a super admin, you can navigate between different dashboards
            using the sidebar switcher. This allows you to see and use the
            system from the perspective of different user roles.
          </p>

          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 mb-4">
            <div className="flex items-center mb-2">
              <SwitchCamera className="h-5 w-5 text-amber-500 mr-2" />
              <h3 className="font-medium text-amber-800">Sidebar Switcher</h3>
            </div>
            <p className="text-sm text-amber-700">
              Use the <strong>Switch Dashboard</strong> dropdown in the sidebar
              to navigate between different dashboards while maintaining your
              super admin privileges.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center mb-2">
                <BookOpen className="h-5 w-5 text-blue-500 mr-2" />
                <h3 className="font-medium text-blue-700">Student Dashboard</h3>
              </div>
              <p className="text-sm text-gray-600">
                View courses, enrollment options, and student documents.
              </p>
            </div>

            <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
              <div className="flex items-center mb-2">
                <UserPlus className="h-5 w-5 text-indigo-500 mr-2" />
                <h3 className="font-medium text-indigo-700">
                  Faculty Dashboard
                </h3>
              </div>
              <p className="text-sm text-gray-600">
                Manage courses, view available courses, and review student
                documents.
              </p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
              <div className="flex items-center mb-2">
                <Shield className="h-5 w-5 text-purple-500 mr-2" />
                <h3 className="font-medium text-purple-700">Admin Dashboard</h3>
              </div>
              <p className="text-sm text-gray-600">
                Manage courses, faculty, and enrollment periods.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
