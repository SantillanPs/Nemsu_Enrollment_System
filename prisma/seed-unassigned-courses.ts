import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Define course status constants since they're stored as strings in the schema
const CourseStatus = {
  OPEN: "OPEN",
  CLOSED: "CLOSED",
};

// Define semester constants
const Semester = {
  FIRST: "FIRST",
  SECOND: "SECOND",
  SUMMER: "SUMMER",
};

async function main() {
  console.log("Creating courses without assigned instructors...");

  // First Year - First Semester (OPEN courses)
  await Promise.all([
    createCourse({
      code: "UNASSIGNED101",
      name: "Introduction to Programming",
      description: "Fundamentals of programming using Python and JavaScript",
      credits: 3,
      capacity: 35,
      semester: Semester.FIRST,
      year: 1,
      status: CourseStatus.OPEN,
    }),
    createCourse({
      code: "UNASSIGNED102",
      name: "Web Development Basics",
      description: "Introduction to HTML, CSS, and basic JavaScript",
      credits: 3,
      capacity: 30,
      semester: Semester.FIRST,
      year: 1,
      status: CourseStatus.OPEN,
    }),
  ]);

  // First Year - Second Semester (OPEN courses)
  await Promise.all([
    createCourse({
      code: "UNASSIGNED103",
      name: "Database Systems",
      description: "Introduction to database design and SQL",
      credits: 3,
      capacity: 35,
      semester: Semester.SECOND,
      year: 1,
      status: CourseStatus.OPEN,
    }),
    createCourse({
      code: "UNASSIGNED104",
      name: "Object-Oriented Programming",
      description: "Principles of object-oriented programming using Java",
      credits: 3,
      capacity: 30,
      semester: Semester.SECOND,
      year: 1,
      status: CourseStatus.OPEN,
    }),
  ]);

  // Second Year - First Semester (OPEN courses)
  await Promise.all([
    createCourse({
      code: "UNASSIGNED201",
      name: "Data Structures and Algorithms",
      description: "Study of fundamental data structures and algorithms",
      credits: 4,
      capacity: 30,
      semester: Semester.FIRST,
      year: 2,
      status: CourseStatus.OPEN,
    }),
    createCourse({
      code: "UNASSIGNED202",
      name: "Software Engineering",
      description: "Principles and practices of software engineering",
      credits: 3,
      capacity: 35,
      semester: Semester.FIRST,
      year: 2,
      status: CourseStatus.OPEN,
    }),
  ]);

  // Second Year - Second Semester (OPEN courses)
  await Promise.all([
    createCourse({
      code: "UNASSIGNED203",
      name: "Mobile App Development",
      description: "Development of mobile applications for iOS and Android",
      credits: 3,
      capacity: 25,
      semester: Semester.SECOND,
      year: 2,
      status: CourseStatus.OPEN,
    }),
    createCourse({
      code: "UNASSIGNED204",
      name: "Computer Networks",
      description: "Fundamentals of computer networking and protocols",
      credits: 3,
      capacity: 30,
      semester: Semester.SECOND,
      year: 2,
      status: CourseStatus.OPEN,
    }),
  ]);

  // Summer Courses (OPEN)
  await Promise.all([
    createCourse({
      code: "UNASSIGNED301",
      name: "Cloud Computing",
      description: "Introduction to cloud computing platforms and services",
      credits: 3,
      capacity: 25,
      semester: Semester.SUMMER,
      year: 2,
      status: CourseStatus.OPEN,
    }),
    createCourse({
      code: "UNASSIGNED302",
      name: "Data Science Fundamentals",
      description: "Introduction to data analysis and visualization",
      credits: 3,
      capacity: 30,
      semester: Semester.SUMMER,
      year: 3,
      status: CourseStatus.OPEN,
    }),
  ]);

  // Third Year - First Semester (OPEN courses)
  await Promise.all([
    createCourse({
      code: "UNASSIGNED303",
      name: "Artificial Intelligence",
      description: "Introduction to AI concepts and applications",
      credits: 4,
      capacity: 25,
      semester: Semester.FIRST,
      year: 3,
      status: CourseStatus.OPEN,
    }),
    createCourse({
      code: "UNASSIGNED304",
      name: "Cybersecurity",
      description: "Principles and practices of information security",
      credits: 3,
      capacity: 30,
      semester: Semester.FIRST,
      year: 3,
      status: CourseStatus.OPEN,
    }),
  ]);

  // CLOSED courses (not available for enrollment)
  console.log(
    "Creating courses not yet available for enrollment (CLOSED) without instructors..."
  );

  await Promise.all([
    createCourse({
      code: "UNASSIGNED401",
      name: "Advanced Web Development",
      description: "Advanced concepts in modern web development frameworks",
      credits: 4,
      capacity: 25,
      semester: Semester.SECOND,
      year: 3,
      status: CourseStatus.CLOSED,
    }),
    createCourse({
      code: "UNASSIGNED402",
      name: "Machine Learning",
      description:
        "Introduction to machine learning algorithms and applications",
      credits: 4,
      capacity: 20,
      semester: Semester.SECOND,
      year: 3,
      status: CourseStatus.CLOSED,
    }),
    createCourse({
      code: "UNASSIGNED403",
      name: "Blockchain Technology",
      description: "Introduction to blockchain concepts and applications",
      credits: 3,
      capacity: 25,
      semester: Semester.FIRST,
      year: 4,
      status: CourseStatus.CLOSED,
    }),
    createCourse({
      code: "UNASSIGNED404",
      name: "Quantum Computing",
      description: "Introduction to quantum computing principles",
      credits: 3,
      capacity: 20,
      semester: Semester.SECOND,
      year: 4,
      status: CourseStatus.CLOSED,
    }),
  ]);

  console.log("Unassigned courses created successfully!");
}

async function createCourse(data: {
  code: string;
  name: string;
  description: string;
  credits: number;
  capacity: number;
  semester: string;
  year: number;
  status: string;
}) {
  return prisma.course.create({
    data,
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
