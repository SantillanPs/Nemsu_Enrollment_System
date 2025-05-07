/**
 * Utility functions for checking user roles and permissions
 */

/**
 * Enum of all available roles in the system
 */
export enum UserRole {
  STUDENT = "student",
  FACULTY = "faculty",
  ADMIN = "admin",
  SUPER_ADMIN = "super_admin",
}

/**
 * Checks if a user has access to a specific role's functionality
 * Returns true if:
 * 1. The user has the exact role specified, OR
 * 2. The user is a super admin
 *
 * @param userRole The actual role of the user
 * @param requiredRole The role required for access
 * @returns boolean indicating if the user has access
 */
export function hasRoleAccess(userRole: string, requiredRole: string): boolean {
  // Normalize roles to lowercase for comparison
  const normalizedUserRole = userRole.toLowerCase();
  const normalizedRequiredRole = requiredRole.toLowerCase();

  // Super admins can access everything
  if (normalizedUserRole === UserRole.SUPER_ADMIN) {
    return true;
  }

  // Otherwise, check if the user has the exact required role
  return normalizedUserRole === normalizedRequiredRole;
}

/**
 * Checks if a user is a super admin
 *
 * @param userRole The role of the user to check
 * @returns boolean indicating if the user is a super admin
 */
export function isSuperAdmin(userRole: string): boolean {
  return userRole.toLowerCase() === UserRole.SUPER_ADMIN;
}

/**
 * Gets the effective role for UI display and navigation
 * For super admins, this can be their actual role or an "active" role they're viewing
 *
 * @param userRole The actual role of the user
 * @param activeRole Optional active role for super admins
 * @returns The effective role to use for UI
 */
export function getEffectiveRole(
  userRole: string,
  activeRole?: string | null
): string {
  const normalizedUserRole = userRole.toLowerCase();

  // If user is super admin and has an active role set, use that
  if (hasRoleAccess(normalizedUserRole, UserRole.SUPER_ADMIN) && activeRole) {
    return activeRole.toLowerCase();
  }

  // Otherwise use their actual role
  return normalizedUserRole;
}
