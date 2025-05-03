import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  console.log("Cleaning existing data...");
  await prisma.enrollment.deleteMany();
  await prisma.course.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  console.log("Creating faculty members...");
  // Create faculty members
  const faculty = await Promise.all([
    createUser("alan.turing@university.edu", "Dr. Alan Turing", Role.FACULTY),
    createUser(
      "katherine.johnson@university.edu",
      "Dr. Katherine Johnson",
      Role.FACULTY
    ),
    createUser("grace.hopper@university.edu", "Dr. Grace Hopper", Role.FACULTY),
    createUser(
      "ada.lovelace@university.edu",
      "Prof. Ada Lovelace",
      Role.FACULTY
    ),
    createUser(
      "john.von.neumann@university.edu",
      "Dr. John von Neumann",
      Role.FACULTY
    ),
    createUser(
      "donald.knuth@university.edu",
      "Prof. Donald Knuth",
      Role.FACULTY
    ),
  ]);

  console.log("Creating courses...");
  // First Year - First Semester
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
    createCourse({
      code: "GE101",
      name: "Understanding the Self",
      description: "Study of the self and personal development",
      credits: 3,
      capacity: 40,
      facultyId: faculty[3].id,
      semester: "FIRST",
      year: 1,
    }),
    createCourse({
      code: "PE101",
      name: "Physical Fitness",
      description: "Basic physical education and fitness activities",
      credits: 2,
      capacity: 45,
      facultyId: faculty[4].id,
      semester: "FIRST",
      year: 1,
    }),
    createCourse({
      code: "NSTP1",
      name: "National Service Training Program 1",
      description: "Civic consciousness and defense preparedness",
      credits: 3,
      capacity: 50,
      facultyId: faculty[5].id,
      semester: "FIRST",
      year: 1,
    }),
    createCourse({
      code: "FIL101",
      name: "Filipino Communication",
      description: "Development of Filipino language skills",
      credits: 3,
      capacity: 35,
      facultyId: faculty[0].id,
      semester: "FIRST",
      year: 1,
    }),
  ]);

  // First Year - Second Semester
  await Promise.all([
    createCourse({
      code: "MATH102",
      name: "Calculus 1",
      description: "Introduction to differential calculus",
      credits: 3,
      capacity: 40,
      facultyId: faculty[1].id,
      semester: "SECOND",
      year: 1,
    }),
    createCourse({
      code: "CS102",
      name: "Computer Programming 1",
      description: "Fundamentals of programming using Python",
      credits: 3,
      capacity: 30,
      facultyId: faculty[2].id,
      semester: "SECOND",
      year: 1,
    }),
    createCourse({
      code: "GE102",
      name: "Readings in Philippine History",
      description: "Study of Philippine historical development",
      credits: 3,
      capacity: 40,
      facultyId: faculty[3].id,
      semester: "SECOND",
      year: 1,
    }),
    createCourse({
      code: "PE102",
      name: "Rhythmic Activities",
      description: "Dance and movement education",
      credits: 2,
      capacity: 45,
      facultyId: faculty[4].id,
      semester: "SECOND",
      year: 1,
    }),
    createCourse({
      code: "NSTP2",
      name: "National Service Training Program 2",
      description: "Civic engagement and community service",
      credits: 3,
      capacity: 50,
      facultyId: faculty[5].id,
      semester: "SECOND",
      year: 1,
    }),
    createCourse({
      code: "ENG102",
      name: "Technical Writing",
      description: "Writing for technical and professional purposes",
      credits: 3,
      capacity: 35,
      facultyId: faculty[0].id,
      semester: "SECOND",
      year: 1,
    }),
    createCourse({
      code: "PHY101",
      name: "Physics 1",
      description: "Mechanics and thermodynamics",
      credits: 3,
      capacity: 35,
      facultyId: faculty[1].id,
      semester: "SECOND",
      year: 1,
    }),
  ]);

  // Second Year - First Semester
  await Promise.all([
    createCourse({
      code: "CS201",
      name: "Data Structures",
      description: "Study of data organization and manipulation",
      credits: 3,
      capacity: 30,
      facultyId: faculty[2].id,
      semester: "FIRST",
      year: 2,
    }),
    createCourse({
      code: "CS202",
      name: "Object-Oriented Programming",
      description: "OOP concepts using Java",
      credits: 3,
      capacity: 30,
      facultyId: faculty[3].id,
      semester: "FIRST",
      year: 2,
    }),
    createCourse({
      code: "MATH201",
      name: "Discrete Mathematics",
      description: "Mathematical structures for computer science",
      credits: 3,
      capacity: 40,
      facultyId: faculty[4].id,
      semester: "FIRST",
      year: 2,
    }),
    createCourse({
      code: "GE201",
      name: "Ethics",
      description: "Study of moral philosophy and values",
      credits: 3,
      capacity: 40,
      facultyId: faculty[5].id,
      semester: "FIRST",
      year: 2,
    }),
    createCourse({
      code: "CS203",
      name: "Computer Organization",
      description: "Computer architecture and assembly language",
      credits: 3,
      capacity: 35,
      facultyId: faculty[0].id,
      semester: "FIRST",
      year: 2,
    }),
    createCourse({
      code: "ENG201",
      name: "Business Communication",
      description: "Professional business writing and speaking",
      credits: 3,
      capacity: 35,
      facultyId: faculty[1].id,
      semester: "FIRST",
      year: 2,
    }),
    createCourse({
      code: "STAT201",
      name: "Probability and Statistics",
      description: "Statistical methods and probability theory",
      credits: 3,
      capacity: 40,
      facultyId: faculty[2].id,
      semester: "FIRST",
      year: 2,
    }),
  ]);

  // Second Year - Second Semester
  await Promise.all([
    createCourse({
      code: "CS204",
      name: "Database Management Systems",
      description: "Design and implementation of databases",
      credits: 3,
      capacity: 30,
      facultyId: faculty[3].id,
      semester: "SECOND",
      year: 2,
    }),
    createCourse({
      code: "CS205",
      name: "Web Development",
      description: "Frontend and backend web technologies",
      credits: 3,
      capacity: 30,
      facultyId: faculty[4].id,
      semester: "SECOND",
      year: 2,
    }),
    createCourse({
      code: "CS206",
      name: "Operating Systems",
      description: "Principles of operating systems",
      credits: 3,
      capacity: 35,
      facultyId: faculty[5].id,
      semester: "SECOND",
      year: 2,
    }),
    createCourse({
      code: "CS207",
      name: "Software Engineering",
      description: "Software development methodologies",
      credits: 3,
      capacity: 35,
      facultyId: faculty[0].id,
      semester: "SECOND",
      year: 2,
    }),
    createCourse({
      code: "GE202",
      name: "Art Appreciation",
      description: "Understanding and appreciating art",
      credits: 3,
      capacity: 40,
      facultyId: faculty[1].id,
      semester: "SECOND",
      year: 2,
    }),
    createCourse({
      code: "CS208",
      name: "Algorithms",
      description: "Design and analysis of algorithms",
      credits: 3,
      capacity: 30,
      facultyId: faculty[2].id,
      semester: "SECOND",
      year: 2,
    }),
    createCourse({
      code: "MATH202",
      name: "Linear Algebra",
      description: "Vector spaces and linear transformations",
      credits: 3,
      capacity: 40,
      facultyId: faculty[3].id,
      semester: "SECOND",
      year: 2,
    }),
  ]);

  // Summer Internship
  await createCourse({
    code: "INTERN200",
    name: "Summer Internship Program",
    description: "Industry-based training and experience",
    credits: 6,
    capacity: 100,
    facultyId: faculty[0].id,
    semester: "SUMMER",
    year: 2,
  });

  // Third Year - First Semester
  await Promise.all([
    createCourse({
      code: "CS301",
      name: "Mobile Development",
      description: "Mobile app development for iOS and Android",
      credits: 3,
      capacity: 30,
      facultyId: faculty[1].id,
      semester: "FIRST",
      year: 3,
    }),
    createCourse({
      code: "CS302",
      name: "Computer Networks",
      description: "Network protocols and architecture",
      credits: 3,
      capacity: 35,
      facultyId: faculty[2].id,
      semester: "FIRST",
      year: 3,
    }),
    createCourse({
      code: "CS303",
      name: "Artificial Intelligence",
      description: "Basic concepts of AI and machine learning",
      credits: 3,
      capacity: 30,
      facultyId: faculty[3].id,
      semester: "FIRST",
      year: 3,
    }),
    createCourse({
      code: "CS304",
      name: "Information Security",
      description: "Computer security and cryptography",
      credits: 3,
      capacity: 35,
      facultyId: faculty[4].id,
      semester: "FIRST",
      year: 3,
    }),
    createCourse({
      code: "CS305",
      name: "Cloud Computing",
      description: "Cloud services and deployment",
      credits: 3,
      capacity: 30,
      facultyId: faculty[5].id,
      semester: "FIRST",
      year: 3,
    }),
    createCourse({
      code: "CS306",
      name: "Software Testing",
      description: "Software quality assurance and testing",
      credits: 3,
      capacity: 35,
      facultyId: faculty[0].id,
      semester: "FIRST",
      year: 3,
    }),
    createCourse({
      code: "CS307",
      name: "Project Management",
      description: "IT project planning and management",
      credits: 3,
      capacity: 40,
      facultyId: faculty[1].id,
      semester: "FIRST",
      year: 3,
    }),
  ]);

  // Third Year - Second Semester
  await Promise.all([
    createCourse({
      code: "CS308",
      name: "Data Science",
      description: "Data analysis and visualization",
      credits: 3,
      capacity: 30,
      facultyId: faculty[2].id,
      semester: "SECOND",
      year: 3,
    }),
    createCourse({
      code: "CS309",
      name: "Game Development",
      description: "2D and 3D game programming",
      credits: 3,
      capacity: 30,
      facultyId: faculty[3].id,
      semester: "SECOND",
      year: 3,
    }),
    createCourse({
      code: "CS310",
      name: "Computer Graphics",
      description: "3D modeling and rendering",
      credits: 3,
      capacity: 30,
      facultyId: faculty[4].id,
      semester: "SECOND",
      year: 3,
    }),
    createCourse({
      code: "CS311",
      name: "Blockchain Technology",
      description: "Distributed ledger systems",
      credits: 3,
      capacity: 30,
      facultyId: faculty[5].id,
      semester: "SECOND",
      year: 3,
    }),
    createCourse({
      code: "CS312",
      name: "IoT Systems",
      description: "Internet of Things applications",
      credits: 3,
      capacity: 30,
      facultyId: faculty[0].id,
      semester: "SECOND",
      year: 3,
    }),
    createCourse({
      code: "CS313",
      name: "DevOps Practices",
      description: "Continuous integration and deployment",
      credits: 3,
      capacity: 35,
      facultyId: faculty[1].id,
      semester: "SECOND",
      year: 3,
    }),
    createCourse({
      code: "CS314",
      name: "Research Methods",
      description: "Research methodology in computing",
      credits: 3,
      capacity: 40,
      facultyId: faculty[2].id,
      semester: "SECOND",
      year: 3,
    }),
  ]);

  // Fourth Year - First Semester
  await Promise.all([
    createCourse({
      code: "CS401",
      name: "Thesis 1",
      description: "Research project development",
      credits: 3,
      capacity: 30,
      facultyId: faculty[3].id,
      semester: "FIRST",
      year: 4,
    }),
    createCourse({
      code: "CS402",
      name: "Systems Architecture",
      description: "Enterprise systems design",
      credits: 3,
      capacity: 35,
      facultyId: faculty[4].id,
      semester: "FIRST",
      year: 4,
    }),
    createCourse({
      code: "CS403",
      name: "Machine Learning",
      description: "Advanced AI and deep learning",
      credits: 3,
      capacity: 30,
      facultyId: faculty[5].id,
      semester: "FIRST",
      year: 4,
    }),
    createCourse({
      code: "CS404",
      name: "Digital Forensics",
      description: "Computer crime investigation",
      credits: 3,
      capacity: 30,
      facultyId: faculty[0].id,
      semester: "FIRST",
      year: 4,
    }),
    createCourse({
      code: "CS405",
      name: "Natural Language Processing",
      description: "Text processing and analysis",
      credits: 3,
      capacity: 30,
      facultyId: faculty[1].id,
      semester: "FIRST",
      year: 4,
    }),
    createCourse({
      code: "CS406",
      name: "Quantum Computing",
      description: "Introduction to quantum algorithms",
      credits: 3,
      capacity: 30,
      facultyId: faculty[2].id,
      semester: "FIRST",
      year: 4,
    }),
    createCourse({
      code: "CS407",
      name: "Tech Entrepreneurship",
      description: "Starting a tech business",
      credits: 3,
      capacity: 40,
      facultyId: faculty[3].id,
      semester: "FIRST",
      year: 4,
    }),
  ]);

  // Fourth Year - Second Semester
  await Promise.all([
    createCourse({
      code: "CS408",
      name: "Thesis 2",
      description: "Research project implementation",
      credits: 3,
      capacity: 30,
      facultyId: faculty[4].id,
      semester: "SECOND",
      year: 4,
    }),
    createCourse({
      code: "CS409",
      name: "Professional Practice",
      description: "Ethics and professional issues",
      credits: 3,
      capacity: 40,
      facultyId: faculty[5].id,
      semester: "SECOND",
      year: 4,
    }),
    createCourse({
      code: "CS410",
      name: "Emerging Technologies",
      description: "Current trends in computing",
      credits: 3,
      capacity: 35,
      facultyId: faculty[0].id,
      semester: "SECOND",
      year: 4,
    }),
    createCourse({
      code: "CS411",
      name: "System Integration",
      description: "Enterprise application integration",
      credits: 3,
      capacity: 35,
      facultyId: faculty[1].id,
      semester: "SECOND",
      year: 4,
    }),
    createCourse({
      code: "CS412",
      name: "IT Governance",
      description: "IT service management",
      credits: 3,
      capacity: 40,
      facultyId: faculty[2].id,
      semester: "SECOND",
      year: 4,
    }),
    createCourse({
      code: "CS413",
      name: "Data Privacy",
      description: "Privacy laws and compliance",
      credits: 3,
      capacity: 35,
      facultyId: faculty[3].id,
      semester: "SECOND",
      year: 4,
    }),
    createCourse({
      code: "CS414",
      name: "Career Development",
      description: "Professional growth and planning",
      credits: 3,
      capacity: 40,
      facultyId: faculty[4].id,
      semester: "SECOND",
      year: 4,
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

  // Create student accounts
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
  const student3 = await createUser(
    "alex.student@university.edu",
    "Alex Student",
    Role.STUDENT
  );
  const student4 = await createUser(
    "maria.student@university.edu",
    "Maria Student",
    Role.STUDENT
  );
  const student5 = await createUser(
    "david.student@university.edu",
    "David Student",
    Role.STUDENT
  );

  console.log("Test Student Accounts Created:");
  console.log("- Email: john.student@university.edu (Password: password123)");
  console.log("- Email: jane.student@university.edu (Password: password123)");
  console.log("- Email: alex.student@university.edu (Password: password123)");
  console.log("- Email: maria.student@university.edu (Password: password123)");
  console.log("- Email: david.student@university.edu (Password: password123)");

  // Enroll students in the test course with different statuses
  await createEnrollment(student1.id, testCourse.id, "APPROVED");
  await createEnrollment(student2.id, testCourse.id, "APPROVED");
  await createEnrollment(student3.id, testCourse.id, "PENDING");
  await createEnrollment(student4.id, testCourse.id, "COMPLETED", "A");
  await createEnrollment(student5.id, testCourse.id, "REJECTED");

  console.log("Students enrolled in test course with various statuses");
  console.log("Database has been seeded! 🌱");
}

async function createUser(email: string, name: string, role: Role) {
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
