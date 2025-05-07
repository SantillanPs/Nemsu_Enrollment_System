// Simple test script to verify enrollment period deletion
// Run this with Node.js: node test-enrollment-delete.js

const fetch = require('node-fetch');

// Replace these with actual values from your application
const API_URL = 'http://localhost:3000/api/enrollment-periods';
const ENROLLMENT_PERIOD_ID = 'your-enrollment-period-id'; // Replace with an actual ID
const ADMIN_COOKIE = 'your-admin-cookie'; // Replace with an actual cookie from browser dev tools

async function testDeleteEnrollmentPeriod() {
  try {
    console.log(`Attempting to delete enrollment period with ID: ${ENROLLMENT_PERIOD_ID}`);
    
    const response = await fetch(`${API_URL}/${ENROLLMENT_PERIOD_ID}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': ADMIN_COOKIE
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('Success! Enrollment period deleted:', data);
    } else {
      console.error('Error deleting enrollment period:', data);
    }
  } catch (error) {
    console.error('Exception occurred:', error);
  }
}

// Uncomment to run the test
// testDeleteEnrollmentPeriod();

console.log(`
INSTRUCTIONS:
1. This is a test script to verify enrollment period deletion
2. Before running, replace the placeholder values:
   - ENROLLMENT_PERIOD_ID: ID of the enrollment period to delete
   - ADMIN_COOKIE: Your admin session cookie (copy from browser dev tools)
3. Uncomment the testDeleteEnrollmentPeriod() line to run the test
4. Run with: node test-enrollment-delete.js

NOTE: This is just for testing. In production, use the UI to delete enrollment periods.
`);
