const { exec } = require('child_process');

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

// Main function to apply the schema changes
async function applySchemaChanges() {
  try {
    // Push the schema changes directly to the database
    await execCommand('npx prisma db push --accept-data-loss');

    // Generate the Prisma client
    await execCommand('npx prisma generate');

    console.log('Schema changes applied successfully!');
  } catch (error) {
    console.error('Failed to apply schema changes:', error);
  }
}

// Run the function
applySchemaChanges();
