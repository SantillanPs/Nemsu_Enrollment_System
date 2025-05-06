"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Server,
  Database,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  HardDrive,
  Activity,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";

export default function SuperAdminSystemPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [systemStats, setSystemStats] = useState({
    status: "Operational",
    uptime: "99.9%",
    lastRestart: "2 days ago",
    databaseSize: "128 MB",
    databaseConnections: 12,
    activeUsers: 42,
    cpuUsage: 23,
    memoryUsage: 45,
    diskUsage: 32,
  });

  // Redirect if not a super admin
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "SUPER_ADMIN") {
      router.push("/");
    }
  }, [session, status, router]);

  // Mock function to simulate system restart
  const handleSystemRestart = () => {
    if (
      !confirm(
        "Are you sure you want to restart the system? This will disconnect all users."
      )
    ) {
      return;
    }
    
    alert("System restart initiated. This is a simulated action.");
  };

  // Mock function to simulate database maintenance
  const handleDatabaseMaintenance = () => {
    if (
      !confirm(
        "Are you sure you want to perform database maintenance? This may affect system performance."
      )
    ) {
      return;
    }
    
    alert("Database maintenance initiated. This is a simulated action.");
  };

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
      <div className="flex items-center">
        <Server className="h-6 w-6 mr-2 text-blue-500" />
        <h1 className="text-2xl font-bold">System Maintenance</h1>
      </div>

      <Alert variant="warning" className="bg-amber-50 border-amber-200">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800">Maintenance Notice</AlertTitle>
        <AlertDescription className="text-amber-700">
          System maintenance operations can affect all users. Schedule
          maintenance during off-peak hours when possible.
        </AlertDescription>
      </Alert>

      {/* System Status */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            System Status
          </CardTitle>
          <CardDescription className="text-blue-100">
            Current system health and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-100">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span className="font-medium">System Status</span>
                </div>
                <span className="text-green-600 font-medium">
                  {systemStats.status}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="font-medium">Uptime</span>
                </div>
                <span className="text-blue-600 font-medium">
                  {systemStats.uptime}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg border border-amber-100">
                <div className="flex items-center">
                  <RefreshCw className="h-5 w-5 text-amber-500 mr-2" />
                  <span className="font-medium">Last Restart</span>
                </div>
                <span className="text-amber-600 font-medium">
                  {systemStats.lastRestart}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                <div className="flex items-center">
                  <Database className="h-5 w-5 text-indigo-500 mr-2" />
                  <span className="font-medium">Database Size</span>
                </div>
                <span className="text-indigo-600 font-medium">
                  {systemStats.databaseSize}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border border-purple-100">
                <div className="flex items-center">
                  <HardDrive className="h-5 w-5 text-purple-500 mr-2" />
                  <span className="font-medium">Active Users</span>
                </div>
                <span className="text-purple-600 font-medium">
                  {systemStats.activeUsers}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center">
                  <Database className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="font-medium">DB Connections</span>
                </div>
                <span className="text-gray-600 font-medium">
                  {systemStats.databaseConnections}
                </span>
              </div>
            </div>
          </div>

          {/* Resource Usage */}
          <div className="mt-6 space-y-4">
            <h3 className="font-medium text-lg">Resource Usage</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">CPU Usage</span>
                <span className="text-sm text-gray-500">{systemStats.cpuUsage}%</span>
              </div>
              <Progress value={systemStats.cpuUsage} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Memory Usage</span>
                <span className="text-sm text-gray-500">{systemStats.memoryUsage}%</span>
              </div>
              <Progress value={systemStats.memoryUsage} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Disk Usage</span>
                <span className="text-sm text-gray-500">{systemStats.diskUsage}%</span>
              </div>
              <Progress value={systemStats.diskUsage} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* System Restart */}
        <Card className="border-amber-100">
          <CardHeader>
            <CardTitle className="flex items-center">
              <RefreshCw className="h-5 w-5 mr-2 text-amber-500" />
              System Restart
            </CardTitle>
            <CardDescription>
              Restart the application server
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Restarting the system will disconnect all users and temporarily
              make the application unavailable. Use this option only when
              necessary.
            </p>
            <Alert variant="warning" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                All active user sessions will be terminated.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className="w-full border-amber-200 text-amber-700 hover:bg-amber-50"
              onClick={handleSystemRestart}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Restart System
            </Button>
          </CardFooter>
        </Card>

        {/* Database Maintenance */}
        <Card className="border-blue-100">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2 text-blue-500" />
              Database Maintenance
            </CardTitle>
            <CardDescription>
              Perform database optimization tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Database maintenance includes optimization, cleanup, and integrity
              checks. This may temporarily slow down the system.
            </p>
            <div className="space-y-2">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-sm">Optimize database tables</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-sm">Clean up temporary data</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-sm">Verify data integrity</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
              onClick={handleDatabaseMaintenance}
            >
              <Database className="h-4 w-4 mr-2" />
              Run Maintenance
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
