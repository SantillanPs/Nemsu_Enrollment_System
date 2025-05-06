const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to execute a command and return a promise
function execCommand(command) {
  return new Promise((resolve, reject) => {
    console.log(`Executing: ${command}`);
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return reject(error);
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
      }
      console.log(`stdout: ${stdout}`);
      resolve(stdout);
    });
  });
}

// Main function to apply the migration
async function applyMigration() {
  try {
    // Check if the database file exists
    const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
    if (!fs.existsSync(dbPath)) {
      console.log('Database file not found. Creating a new database...');
      // Create the database by running prisma db push
      await execCommand('npx prisma db push');
    } else {
      console.log('Database file found. Applying migration...');
      // Apply the migration directly to the database
      await execCommand('npx prisma migrate dev --name add_system_user_flag');
    }

    // Generate the Prisma client
    await execCommand('npx prisma generate');

    console.log('Migration applied successfully!');
  } catch (error) {
    console.error('Failed to apply migration:', error);
  }
}

// Run the migration
applyMigration();
