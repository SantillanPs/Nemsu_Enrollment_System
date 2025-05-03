import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  BookOpen,
  FileText,
  Calendar,
  Settings,
  GraduationCap,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/student", icon: Home },
  { name: "Courses", href: "/student/courses", icon: BookOpen },
  { name: "Documents", href: "/student/profile/documents", icon: FileText },
  // { name: "Schedule", href: "/student/schedule", icon: Calendar },
  // { name: "Grades", href: "/student/grades", icon: GraduationCap },
  // { name: "Settings", href: "/student/settings", icon: Settings },
];

export function StudentSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-56 flex-col border-r bg-white">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/student" className="flex items-center">
          <GraduationCap className="h-6 w-6 text-primary" />
          <span className="ml-2 text-lg font-semibold">Student Portal</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("mr-3 h-5 w-5")} />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
