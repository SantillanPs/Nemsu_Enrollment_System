import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Define course status constants since they're stored as strings in the schema
const CourseStatus = {
  OPEN: "OPEN",
  CLOSED: "CLOSED",
};

async function main() {
  console.log("Creating courses without assigned instructors...");

  // Courses available for enrollment (OPEN) but without instructors (reduced to 1)
  await createCourse({
    code: "OPEN201",
    name: "Introduction to Open Learning",
    description: "A course on self-directed learning methodologies",
    credits: 3,
    capacity: 35,
    semester: "FIRST",
    year: 1,
    status: CourseStatus.OPEN,
  });

  console.log(
    "Creating courses not yet available for enrollment (CLOSED) without instructors..."
  );

  // Courses not available for enrollment (CLOSED) and without instructors (reduced to 1)
  await createCourse({
    code: "FUTURE201",
    name: "Future Technologies",
    description:
      "Exploration of emerging technologies and their potential impact",
    credits: 3,
    capacity: 40,
    semester: "FIRST",
    year: 1,
    status: CourseStatus.CLOSED,
  });

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
