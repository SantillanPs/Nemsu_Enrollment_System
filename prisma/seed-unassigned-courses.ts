import { PrismaClient, CourseStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Creating courses without assigned instructors...");

  // Courses available for enrollment (OPEN) but without instructors
  await Promise.all([
    createCourse({
      code: "OPEN101",
      name: "Introduction to Open Learning",
      description: "A course on self-directed learning methodologies",
      credits: 3,
      capacity: 35,
      semester: "FIRST",
      year: 1,
      status: CourseStatus.OPEN,
    }),
    createCourse({
      code: "OPEN201",
      name: "Advanced Open Learning",
      description: "Advanced techniques for self-directed learning",
      credits: 3,
      capacity: 30,
      semester: "SECOND",
      year: 2,
      status: CourseStatus.OPEN,
    }),
    createCourse({
      code: "OPEN301",
      name: "Collaborative Learning",
      description:
        "Methods for effective group learning without formal instruction",
      credits: 3,
      capacity: 25,
      semester: "FIRST",
      year: 3,
      status: CourseStatus.OPEN,
    }),
  ]);

  console.log(
    "Creating courses not yet available for enrollment (CLOSED) without instructors..."
  );

  // Courses not available for enrollment (CLOSED) and without instructors
  await Promise.all([
    createCourse({
      code: "FUTURE101",
      name: "Future Technologies",
      description:
        "Exploration of emerging technologies and their potential impact",
      credits: 3,
      capacity: 40,
      semester: "FIRST",
      year: 1,
      status: CourseStatus.CLOSED,
    }),
    createCourse({
      code: "FUTURE201",
      name: "Advanced Future Technologies",
      description: "In-depth study of specific emerging technologies",
      credits: 3,
      capacity: 35,
      semester: "SECOND",
      year: 2,
      status: CourseStatus.CLOSED,
    }),
    createCourse({
      code: "FUTURE301",
      name: "Future Technology Applications",
      description: "Practical applications of emerging technologies",
      credits: 3,
      capacity: 30,
      semester: "FIRST",
      year: 3,
      status: CourseStatus.CLOSED,
    }),
    createCourse({
      code: "FUTURE401",
      name: "Future Technology Integration",
      description: "Integrating emerging technologies into existing systems",
      credits: 3,
      capacity: 25,
      semester: "SECOND",
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
  status: CourseStatus;
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
