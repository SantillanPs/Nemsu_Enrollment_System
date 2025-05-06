const { execSync } = require('child_process');

try {
  console.log('Running Prisma generate...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('Prisma generate completed successfully!');
} catch (error) {
  console.error('Error running Prisma generate:', error);
}
