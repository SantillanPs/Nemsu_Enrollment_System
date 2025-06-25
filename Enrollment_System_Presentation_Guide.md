# Enrollment System Presentation Guide

## Pre-Presentation Setup

### 1. Environment Preparation
- [ ] Start the development server with `npm run dev`
- [ ] Ensure database is seeded with test data using `npx prisma db seed`
- [ ] Prepare browser with multiple tabs for different user roles
- [ ] Clear browser cache and cookies for clean login states
- [ ] Test all login credentials before the presentation

### 2. Test Account Preparation
| Role | Email | Password | Notes |
|------|-------|----------|-------|
| Student (Unverified) | student.new@university.edu | password123 | New student without verification |
| Student (Verified) | student.verified@university.edu | password123 | Student with completed verification |
| Faculty | test.faculty@university.edu | password123 | Faculty member with assigned courses |
| Admin | test.admin@university.edu | password123 | Administrator account |
| Super Admin | system.admin@university.edu | SuperAdmin123 | System super admin account |

### 3. Prepare Demo Data
- [ ] Ensure courses are available for all semesters and years
- [ ] Have sample student documents ready for upload demonstration
- [ ] Create an active enrollment period for demonstration

## Presentation Script

### Introduction (5 minutes)
1. Open the application homepage
2. Highlight the university branding and welcome message
3. Explain the purpose of the system:
   - "This enrollment system streamlines the student registration process"
   - "It provides role-specific interfaces for students, faculty, and administrators"
   - "The system is fully responsive and works across different devices"

### Student Journey (10 minutes)

#### New Student Registration
1. Click "Apply Now" or navigate to `/signup`
2. Fill out the registration form with sample student information:
   - Email: demo.student@university.edu
   - Password: DemoPassword123
   - First Name: Demo
   - Last Name: Student
   - Student ID: S123456
   - School Year: 1
   - Date of Birth: 01/01/2000
3. Submit the form and show the success message
4. Navigate to the login page

#### Student Login & Document Verification
1. Log in with the verified student account
2. Point out the green sidebar theme for student accounts
3. Navigate to the document verification section
4. Demonstrate the document upload process:
   - Select a document type (Birth Certificate, High School Diploma, etc.)
   - Upload a sample PDF file
   - Submit the document for verification
5. Explain that faculty must approve these documents before enrollment

#### Course Enrollment
1. Navigate to "Available Courses"
2. Show how courses are filtered by year and semester
3. Select 2-3 courses by clicking on their cards
4. Point out the unit counter that prevents exceeding maximum allowed units
5. Complete the enrollment process
6. Navigate to "My Courses" to view enrolled courses
7. Demonstrate the PDF certificate generation feature

### Faculty Journey (10 minutes)

#### Faculty Login & Dashboard
1. Log out and log in with the faculty account
2. Point out the orange/yellow sidebar theme for faculty accounts
3. Navigate to the faculty dashboard
4. Show the overview of assigned courses and sections

#### Document Verification
1. Navigate to the "Student Verification" section
2. Show the list of pending document verifications
3. Open a document for review
4. Demonstrate the approval process with toggle switches
5. Show how a student becomes verified after all documents are approved

#### Course Assignment
1. Navigate to "Available Courses"
2. Show the list of unassigned courses
3. Demonstrate how faculty can assign themselves to courses
4. Navigate back to "My Courses" to see the newly assigned course

### Admin Journey (10 minutes)

#### Admin Login & Dashboard
1. Log out and log in with the admin account
2. Point out the blue sidebar theme for admin accounts
3. Navigate to the admin dashboard
4. Show the system overview statistics

#### User Management
1. Navigate to "Manage Students"
2. Demonstrate searching and filtering student records
3. Show how to reset a student's password
4. Demonstrate toggling a student's verification status

#### Course Management
1. Navigate to "Manage Courses"
2. Create a new course:
   - Course Code: DEMO101
   - Course Name: Introduction to System Demonstration
   - Description: A comprehensive overview of system demonstrations
   - Credits: 3
   - Capacity: 30
   - Semester: First Semester
   - Year: 1
3. Show how to activate/deactivate courses
4. Demonstrate changing course instructors

#### Enrollment Period Management
1. Navigate to "Enrollment Periods"
2. Create a new enrollment period:
   - Name: Demo Enrollment Period
   - Start Date: Today's date
   - End Date: One week from today
   - Semester: First Semester
3. Activate the enrollment period

### Super Admin Features (5 minutes)

#### Super Admin Login
1. Log out and log in with the super admin account
2. Point out the red sidebar theme for super admin accounts

#### Dashboard Switching
1. Show the dashboard switcher in the sidebar
2. Demonstrate switching between different role dashboards
3. Explain that super admins maintain their permissions regardless of view

#### System Maintenance
1. Navigate to system maintenance section
2. Show the database management options
3. Demonstrate faculty invitation generation

## Closing Remarks

1. Summarize the key features demonstrated:
   - Role-based access control
   - Document verification workflow
   - Course enrollment process
   - Administrative tools
   - Responsive design

2. Highlight technical aspects:
   - Next.js framework
   - Prisma ORM
   - TailwindCSS for responsive design
   - PDF generation capabilities

3. Mention potential future enhancements:
   - Integration with payment systems
   - Advanced reporting features
   - Mobile application development

## Troubleshooting Tips

### Common Issues and Solutions

1. **Login Problems**
   - Verify database connection is active
   - Check that the correct credentials are being used
   - Ensure the .env file has the correct NEXTAUTH_SECRET

2. **Course Display Issues**
   - Verify that courses exist for the selected semester/year
   - Check that the enrollment period is active

3. **Document Upload Failures**
   - Ensure file size is under 5MB
   - Verify the file type is supported (PDF, JPG, PNG)

4. **Database Connection Issues**
   - Run `npx prisma generate` to ensure client is up to date
   - Check that the DATABASE_URL in .env is correct

## Post-Presentation Cleanup

1. Log out of all accounts
2. Stop the development server
3. Reset the database if necessary with `npx prisma db push --force-reset`
4. Collect feedback from attendees
