import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Define role constants since they're stored as strings in the schema
const Role = {
  ADMIN: "ADMIN",
  FACULTY: "FACULTY",
  STUDENT: "STUDENT",
};

async function main() {
  // Clean existing data
  console.log("Cleaning existing data...");
  await prisma.enrollment.deleteMany();
  await prisma.course.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  console.log("Creating faculty members...");
  // Create faculty members (reduced to 3)
  const faculty = await Promise.all([
    createUser("alan.turing@university.edu", "Dr. Alan Turing", Role.FACULTY),
    createUser("grace.hopper@university.edu", "Dr. Grace Hopper", Role.FACULTY),
    createUser(
      "ada.lovelace@university.edu",
      "Prof. Ada Lovelace",
      Role.FACULTY
    ),
  ]);

  console.log("Creating courses...");
  // First Year - First Semester (reduced number of courses)
  await Promise.all([
    createCourse({
      code: "MATH101",
      name: "College Algebra and Trigonometry",
      description: "Fundamental concepts of algebra and trigonometry",
      credits: 3,
      capacity: 40,
      facultyId: faculty[0].id,
      semester: "FIRST",
      year: 1,
    }),
    createCourse({
      code: "CS101",
      name: "Introduction to Computing",
      description: "Basic concepts of computer systems and programming",
      credits: 3,
      capacity: 30,
      facultyId: faculty[1].id,
      semester: "FIRST",
      year: 1,
    }),
    createCourse({
      code: "ENG101",
      name: "English Communication Skills",
      description: "Development of reading, writing, and speaking skills",
      credits: 3,
      capacity: 35,
      facultyId: faculty[2].id,
      semester: "FIRST",
      year: 1,
    }),
  ]);

  // First Year - Second Semester (reduced number of courses)
  await Promise.all([
    createCourse({
      code: "MATH102",
      name: "Calculus 1",
      description: "Introduction to differential calculus",
      credits: 3,
      capacity: 40,
      facultyId: faculty[0].id,
      semester: "SECOND",
      year: 1,
    }),
    createCourse({
      code: "CS102",
      name: "Computer Programming 1",
      description: "Fundamentals of programming using Python",
      credits: 3,
      capacity: 30,
      facultyId: faculty[1].id,
      semester: "SECOND",
      year: 1,
    }),
    createCourse({
      code: "ENG102",
      name: "Technical Writing",
      description: "Writing for technical and professional purposes",
      credits: 3,
      capacity: 35,
      facultyId: faculty[2].id,
      semester: "SECOND",
      year: 1,
    }),
  ]);

  // Create demo admin
  await createUser("admin@university.edu", "Admin User", Role.ADMIN);

  // Create test admin account
  const testAdmin = await createUser(
    "test.admin@university.edu",
    "Test Admin",
    Role.ADMIN
  );
  console.log("Test Admin Account Created:");
  console.log("- Email: test.admin@university.edu");
  console.log("- Password: password123");
  console.log("- Role: ADMIN");

  // Create test faculty account
  const testFaculty = await createUser(
    "test.faculty@university.edu",
    "Test Faculty",
    Role.FACULTY
  );
  console.log("Test Faculty Account Created:");
  console.log("- Email: test.faculty@university.edu");
  console.log("- Password: password123");
  console.log("- Role: FACULTY");

  // Create a course assigned to the test faculty
  const testCourse = await createCourse({
    code: "CS500",
    name: "Advanced Web Development",
    description:
      "Modern web development techniques including React, Next.js, and serverless architecture",
    credits: 3,
    capacity: 25,
    facultyId: testFaculty.id,
    semester: "FIRST",
    year: 3,
  });
  console.log("Test Course Created and assigned to Test Faculty:");
  console.log(`- Course: ${testCourse.code}: ${testCourse.name}`);

  // Create student accounts (reduced to 2)
  const student1 = await createUser(
    "john.student@university.edu",
    "John Student",
    Role.STUDENT
  );
  const student2 = await createUser(
    "jane.student@university.edu",
    "Jane Student",
    Role.STUDENT
  );

  console.log("Test Student Accounts Created:");
  console.log("- Email: john.student@university.edu (Password: password123)");
  console.log("- Email: jane.student@university.edu (Password: password123)");

  // Enroll students in the test course with different statuses
  await createEnrollment(student1.id, testCourse.id, "APPROVED");
  await createEnrollment(student2.id, testCourse.id, "PENDING");

  console.log("Students enrolled in test course with various statuses");
  console.log("Database has been seeded! 🌱");
}

async function createUser(email: string, name: string, role: string) {
  const [firstName, lastName] = name.split(" ");

  // Hash the password using bcrypt
  const hashedPassword = await bcrypt.hash("password123", 10);

  return prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role,
      profile: {
        create: {
          firstName,
          lastName,
          dateOfBirth: new Date("1990-01-01"), // Mock date
          phone: "+1234567890",
          address: "123 University Street",
          // Add studentId for student accounts
          ...(role === Role.STUDENT && {
            studentId: `S${Math.floor(100000 + Math.random() * 900000)}`, // Generate random student ID
            schoolYear: 1,
            isVerified: true,
          }),
        },
      },
    },
  });
}

async function createCourse(data: {
  code: string;
  name: string;
  description: string;
  credits: number;
  capacity: number;
  facultyId: string;
  semester: string;
  year: number;
}) {
  return prisma.course.create({
    data: {
      ...data,
      status: "OPEN",
    },
  });
}

async function createEnrollment(
  studentId: string,
  courseId: string,
  status: "PENDING" | "APPROVED" | "REJECTED" | "WITHDRAWN" | "COMPLETED",
  grade?: string
) {
  return prisma.enrollment.create({
    data: {
      studentId,
      courseId,
      status,
      grade,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
