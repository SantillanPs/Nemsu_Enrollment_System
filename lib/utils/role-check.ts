/**
 * Utility functions for checking user roles and permissions
 */

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
  if (normalizedUserRole === 'super_admin') {
    return true;
  }
  
  // Otherwise, check if the user has the exact required role
  return normalizedUserRole === normalizedRequiredRole;
}
