import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create faculty members
  const faculty = await Promise.all([
    createUser("alan.turing@university.edu", "Dr. Alan Turing", Role.FACULTY),
    createUser(
      "katherine.johnson@university.edu",
      "Dr. Katherine Johnson",
      Role.FACULTY
    ),
    createUser("jane.austen@university.edu", "Prof. Jane Austen", Role.FACULTY),
    createUser(
      "richard.feynman@university.edu",
      "Dr. Richard Feynman",
      Role.FACULTY
    ),
    createUser(
      "rosalind.franklin@university.edu",
      "Dr. Rosalind Franklin",
      Role.FACULTY
    ),
    createUser("howard.zinn@university.edu", "Prof. Howard Zinn", Role.FACULTY),
  ]);

  // Create courses
  await Promise.all([
    createCourse({
      code: "CS101",
      name: "Introduction to Computer Science",
      description:
        "An introductory course to the fundamental principles of computing and programming.",
      credits: 3,
      capacity: 30,
      facultyId: faculty[0].id, // Alan Turing
      semester: "Fall 2024",
    }),
    createCourse({
      code: "CS112",
      name: "Fundamentals of programming - C++",
      description:
        "Introduction to differential and integral calculus of functions of one variable.",
      credits: 4,
      capacity: 25,
      facultyId: faculty[1].id, // Katherine Johnson
      semester: "Fall 2024",
    }),
    createCourse({
      code: "GE-US",
      name: "Understanding the Self",
      description:
        "Development of writing skills through the study and practice of academic writing.",
      credits: 3,
      capacity: 30,
      facultyId: faculty[2].id, // Jane Austen
      semester: "Fall 2024",
    }),
    createCourse({
      code: "GE-MMW",
      name: "Mathematics in the Modern World",
      description:
        "An introduction to classical mechanics, thermodynamics, and wave phenomena.",
      credits: 4,
      capacity: 24,
      facultyId: faculty[3].id, // Richard Feynman
      semester: "Spring 2025",
    }),
    createCourse({
      code: "BIO110",
      name: "General Biology",
      description:
        "Introduction to the principles of biology, including cell structure and function.",
      credits: 4,
      capacity: 30,
      facultyId: faculty[4].id, // Rosalind Franklin
      semester: "Spring 2025",
    }),
    createCourse({
      code: "HIST101",
      name: "World History",
      description:
        "Survey of world history from ancient civilizations to the modern era.",
      credits: 3,
      capacity: 35,
      facultyId: faculty[5].id, // Howard Zinn
      semester: "Spring 2025",
    }),
  ]);

  // Create a demo student
  const student = await createUser(
    "john.student@university.edu",
    "John Student",
    Role.STUDENT
  );

  console.log("Database has been seeded! 🌱");
}

async function createUser(email: string, name: string, role: Role) {
  const [firstName, lastName] = name.split(" ");

  return prisma.user.create({
    data: {
      email,
      password: "password123", // In a real app, this would be hashed
      role,
      profile: {
        create: {
          firstName,
          lastName,
          dateOfBirth: new Date("1990-01-01"), // Mock date
          phone: "+1234567890",
          address: "123 University Street",
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
}) {
  return prisma.course.create({
    data: {
      ...data,
      status: "OPEN",
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
