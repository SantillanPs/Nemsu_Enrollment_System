const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Testing Prisma client connection...');
    
    // Try to count users
    const userCount = await prisma.user.count();
    console.log(`Database connection successful! Found ${userCount} users.`);
    
    return { success: true, message: 'Prisma client is working correctly!' };
  } catch (error) {
    console.error('Error testing Prisma client:', error);
    return { success: false, error: error.message };
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(result => {
    console.log(result);
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
