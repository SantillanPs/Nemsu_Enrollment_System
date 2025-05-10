const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Creating test courses for multiple years...');

  // Create courses for Year 1, First Semester
  const year1FirstSemesterCourses = [
    {
      code: "CS101",
      name: "Introduction to Programming",
      description: "Basic programming concepts and problem-solving techniques",
      credits: 3,
      capacity: 30,
      semester: "First Semester",
      year: 1,
      status: "OPEN",
    },
    {
      code: "MATH101",
      name: "College Algebra",
      description: "Fundamental algebraic concepts and equations",
      credits: 3,
      capacity: 40,
      semester: "First Semester",
      year: 1,
      status: "OPEN",
    }
  ];

  // Create courses for Year 1, Second Semester
  const year1SecondSemesterCourses = [
    {
      code: "CS102",
      name: "Advanced Programming",
      description: "Advanced programming concepts and data structures",
      credits: 3,
      capacity: 30,
      semester: "Second Semester",
      year: 1,
      status: "OPEN",
    },
    {
      code: "MATH102",
      name: "Trigonometry",
      description: "Trigonometric functions and identities",
      credits: 3,
      capacity: 40,
      semester: "Second Semester",
      year: 1,
      status: "OPEN",
    }
  ];

  // Create courses for Year 2, First Semester
  const year2FirstSemesterCourses = [
    {
      code: "CS201",
      name: "Data Structures",
      description: "Study of data structures and algorithms for manipulating them",
      credits: 3,
      capacity: 30,
      semester: "First Semester",
      year: 2,
      status: "OPEN",
    },
    {
      code: "MATH201",
      name: "Calculus I",
      description: "Introduction to differential calculus",
      credits: 4,
      capacity: 35,
      semester: "First Semester",
      year: 2,
      status: "OPEN",
    }
  ];

  // Create courses for Year 2, Second Semester
  const year2SecondSemesterCourses = [
    {
      code: "CS202",
      name: "Database Systems",
      description: "Introduction to database design and SQL",
      credits: 3,
      capacity: 30,
      semester: "Second Semester",
      year: 2,
      status: "OPEN",
    },
    {
      code: "MATH202",
      name: "Calculus II",
      description: "Introduction to integral calculus",
      credits: 4,
      capacity: 35,
      semester: "Second Semester",
      year: 2,
      status: "OPEN",
    }
  ];

  // Combine all courses
  const allCourses = [
    ...year1FirstSemesterCourses,
    ...year1SecondSemesterCourses,
    ...year2FirstSemesterCourses,
    ...year2SecondSemesterCourses
  ];

  // Create the courses
  for (const courseData of allCourses) {
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

      console.log(`Created course: ${course.code} - ${course.name} (Year ${course.year}, ${course.semester})`);
    } catch (error) {
      console.error(`Error creating course ${courseData.code}:`, error);
    }
  }

  console.log('Test courses created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
