import { ensureSuperAdminExists } from "./utils/system-admin";

/**
 * Initialize server-side components
 * This function is called during application startup
 */
export async function initializeServer() {
  // Ensure the system super admin account exists
  await ensureSuperAdminExists();
}
