const { execSync } = require('child_process');

try {
  console.log('Running Prisma migration...');
  execSync('npx prisma migrate dev --name add_enrollment_periods', { stdio: 'inherit' });
  console.log('Prisma migration completed successfully!');
} catch (error) {
  console.error('Error running Prisma migration:', error);
}
