const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testLogin(email, password) {
  try {
    console.log(`Testing login for email: ${email}`);
    
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
      },
    });

    if (!user) {
      console.log('No user found with this email');
      return { success: false, error: 'No user found' };
    }

    console.log('User found:', {
      id: user.id,
      email: user.email,
      role: user.role,
      hasProfile: !!user.profile,
    });

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      console.log('Invalid password');
      return { success: false, error: 'Invalid password' };
    }

    console.log('Password is valid!');
    return { 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isVerified: user.profile?.isVerified || false,
      }
    };
  } catch (error) {
    console.error('Error during login test:', error);
    return { success: false, error: error.message };
  } finally {
    await prisma.$disconnect();
  }
}

// Test with a known user from the database
// You can replace these with actual credentials to test
testLogin('test.faculty@university.edu', 'password123')
  .then(result => {
    console.log('Test result:', result);
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
