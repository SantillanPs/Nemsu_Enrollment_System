import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { UserRole } from "@/lib/utils/role-check";

const prisma = new PrismaClient();

// Hard-coded super admin credentials
// In a production environment, these would be stored as environment variables
const SUPER_ADMIN_EMAIL = "system.admin@university.edu";
const SUPER_ADMIN_PASSWORD = "SuperAdmin@123"; // This would be more secure in production
const SUPER_ADMIN_FIRST_NAME = "System";
const SUPER_ADMIN_LAST_NAME = "Administrator";

/**
 * Ensures that the system super admin account exists
 * This function should be called during application startup
 */
export async function ensureSuperAdminExists() {
  try {
    // Check if the system super admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: SUPER_ADMIN_EMAIL },
    });

    if (existingAdmin) {
      // If the admin exists but isn't a SUPER_ADMIN or system user, update it
      if (
        existingAdmin.role !== UserRole.SUPER_ADMIN.toUpperCase() ||
        !existingAdmin.isSystemUser
      ) {
        await prisma.user.update({
          where: { id: existingAdmin.id },
          data: {
            role: UserRole.SUPER_ADMIN.toUpperCase(),
            isSystemUser: true,
          },
        });
        console.log("Updated system super admin account");
      }
      return;
    }

    // Create the super admin account if it doesn't exist
    const hashedPassword = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10);

    const superAdmin = await prisma.user.create({
      data: {
        email: SUPER_ADMIN_EMAIL,
        password: hashedPassword,
        role: UserRole.SUPER_ADMIN.toUpperCase(),
        isSystemUser: true,
        profile: {
          create: {
            firstName: SUPER_ADMIN_FIRST_NAME,
            lastName: SUPER_ADMIN_LAST_NAME,
            dateOfBirth: new Date("2000-01-01"), // Placeholder date
            isVerified: true,
          },
        },
      },
    });

    console.log("Created system super admin account:", {
      id: superAdmin.id,
      email: superAdmin.email,
    });
  } catch (error) {
    console.error("Error ensuring super admin exists:", error);
  }
}

/**
 * Checks if a user is the system super admin
 */
export function isSystemSuperAdmin(email: string): boolean {
  return email === SUPER_ADMIN_EMAIL;
}

/**
 * Gets the system super admin email
 * This can be used to display the email in documentation or for login
 */
export function getSystemSuperAdminEmail(): string {
  return SUPER_ADMIN_EMAIL;
}
