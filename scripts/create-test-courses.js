const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("Creating test courses...");

  // Create courses for Year 2, First Semester
  const year2FirstSemesterCourses = [
    {
      code: "CS201",
      name: "Data Structures",
      description:
        "Study of data structures and algorithms for manipulating them",
      credits: 3,
      capacity: 30,
      semester: "First Semester",
      year: 2,
      status: "OPEN",
    },
    {
      code: "CS203",
      name: "Object-Oriented Programming",
      description: "Advanced concepts in object-oriented programming",
      credits: 3,
      capacity: 30,
      semester: "First Semester",
      year: 2,
      status: "OPEN",
    },
    {
      code: "MATH201",
      name: "Calculus II",
      description: "Advanced calculus concepts including integration",
      credits: 3,
      capacity: 40,
      semester: "First Semester",
      year: 2,
      status: "OPEN",
    },
  ];

  // Create the courses
  for (const courseData of year2FirstSemesterCourses) {
    try {
      // Check if course already exists
      const existingCourse = await prisma.course.findUnique({
        where: { code: courseData.code },
      });

      if (existingCourse) {
        console.log(`Course ${courseData.code} already exists, skipping...`);
        continue;
      }

      const course = await prisma.course.create({
        data: courseData,
      });

      console.log(`Created course: ${course.code} - ${course.name}`);
    } catch (error) {
      console.error(`Error creating course ${courseData.code}:`, error);
    }
  }

  console.log("Test courses created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
