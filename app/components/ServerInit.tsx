import { initializeServer } from "@/lib/server-init";

// This is a server component that runs the initialization code
export async function ServerInit() {
  try {
    // Run the server initialization
    await initializeServer();
    console.log("Server initialization completed successfully");
  } catch (error) {
    // Log any errors but don't crash the application
    console.error("Error during server initialization:", error);
  }

  // This component doesn't render anything
  return null;
}
