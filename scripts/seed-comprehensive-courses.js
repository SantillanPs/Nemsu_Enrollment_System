// Script to seed comprehensive courses from year 1 to 4
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Define course status constants
const CourseStatus = {
  OPEN: "OPEN",
  CLOSED: "CLOSED",
  CANCELLED: "CANCELLED",
};

// Define semester constants
const Semester = {
  FIRST: "First Semester",
  SECOND: "Second Semester",
  SUMMER: "Summer",
};

// Define year constants
const YearLevel = {
  FRESHMAN: "Freshman Year",
  SOPHOMORE: "Sophomore Year",
  JUNIOR: "Junior Year",
  SENIOR: "Senior Year",
};

async function main() {
  try {
    console.log("Starting to seed comprehensive courses from year 1 to 4...");

    // Delete existing courses to start fresh
    console.log("Deleting existing courses...");
    await prisma.enrollment.deleteMany();
    await prisma.courseSection.deleteMany();
    await prisma.course.deleteMany();
    console.log("Existing courses deleted.");

    // Empty set for existing course codes since we deleted all courses
    const existingCourseCodes = new Set();

    // Get faculty members to assign to courses
    const faculty = await prisma.user.findMany({
      where: {
        role: "FACULTY",
      },
      select: {
        id: true,
        email: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (faculty.length === 0) {
      console.log(
        "No faculty members found. Please run the main seed script first."
      );
      return;
    }

    console.log(
      `Found ${faculty.length} faculty members to assign to courses.`
    );

    // Define comprehensive courses from year 1 to 4
    const comprehensiveCourses = [
      // FRESHMAN YEAR - FIRST SEMESTER
      {
        code: "GE101",
        name: "Communication Skills 1",
        description:
          "Development of effective oral and written communication skills",
        credits: 3,
        capacity: 40,
        semester: Semester.FIRST,
        yearLevel: YearLevel.FRESHMAN,
        year: 1,
        status: CourseStatus.OPEN,
        prerequisites: [],
      },
      {
        code: "GE102",
        name: "Mathematics in the Modern World",
        description:
          "Appreciation of mathematics in solving real-world problems",
        credits: 3,
        capacity: 40,
        semester: Semester.FIRST,
        yearLevel: YearLevel.FRESHMAN,
        year: 1,
        status: CourseStatus.OPEN,
        prerequisites: [],
      },
      {
        code: "GE103",
        name: "Understanding the Self",
        description: "Philosophical and psychological perspectives of the self",
        credits: 3,
        capacity: 40,
        semester: Semester.FIRST,
        yearLevel: YearLevel.FRESHMAN,
        year: 1,
        status: CourseStatus.OPEN,
        prerequisites: [],
      },
      {
        code: "CS111",
        name: "Introduction to Computing",
        description:
          "Basic concepts of computer systems and information technology",
        credits: 3,
        capacity: 35,
        semester: Semester.FIRST,
        yearLevel: YearLevel.FRESHMAN,
        year: 1,
        status: CourseStatus.OPEN,
        prerequisites: [],
      },
      {
        code: "CS112",
        name: "Computer Programming 1",
        description: "Fundamentals of programming using a high-level language",
        credits: 3,
        capacity: 35,
        semester: Semester.FIRST,
        yearLevel: YearLevel.FRESHMAN,
        year: 1,
        status: CourseStatus.OPEN,
        prerequisites: [],
      },

      // FRESHMAN YEAR - SECOND SEMESTER
      {
        code: "GE104",
        name: "Communication Skills 2",
        description:
          "Advanced oral and written communication for academic purposes",
        credits: 3,
        capacity: 40,
        semester: Semester.SECOND,
        yearLevel: YearLevel.FRESHMAN,
        year: 1,
        status: CourseStatus.OPEN,
        prerequisites: ["GE101"],
      },
      {
        code: "GE105",
        name: "Art Appreciation",
        description: "Understanding and appreciation of various art forms",
        credits: 3,
        capacity: 40,
        semester: Semester.SECOND,
        yearLevel: YearLevel.FRESHMAN,
        year: 1,
        status: CourseStatus.OPEN,
        prerequisites: [],
      },
      {
        code: "GE106",
        name: "Science, Technology, and Society",
        description: "Interactions between science, technology, and society",
        credits: 3,
        capacity: 40,
        semester: Semester.SECOND,
        yearLevel: YearLevel.FRESHMAN,
        year: 1,
        status: CourseStatus.OPEN,
        prerequisites: [],
      },
      {
        code: "CS121",
        name: "Computer Programming 2",
        description:
          "Advanced programming concepts and object-oriented programming",
        credits: 3,
        capacity: 35,
        semester: Semester.SECOND,
        yearLevel: YearLevel.FRESHMAN,
        year: 1,
        status: CourseStatus.OPEN,
        prerequisites: ["CS112"],
      },
      {
        code: "CS122",
        name: "Discrete Structures",
        description: "Mathematical structures for computer science",
        credits: 3,
        capacity: 35,
        semester: Semester.SECOND,
        yearLevel: YearLevel.FRESHMAN,
        year: 1,
        status: CourseStatus.OPEN,
        prerequisites: ["GE102"],
      },

      // SOPHOMORE YEAR - FIRST SEMESTER
      {
        code: "GE201",
        name: "Ethics",
        description:
          "Ethical theories and moral issues in contemporary society",
        credits: 3,
        capacity: 40,
        semester: Semester.FIRST,
        yearLevel: YearLevel.SOPHOMORE,
        year: 2,
        status: CourseStatus.OPEN,
        prerequisites: [],
      },
      {
        code: "CS211",
        name: "Data Structures and Algorithms",
        description:
          "Implementation and analysis of fundamental data structures and algorithms",
        credits: 3,
        capacity: 35,
        semester: Semester.FIRST,
        yearLevel: YearLevel.SOPHOMORE,
        year: 2,
        status: CourseStatus.OPEN,
        prerequisites: ["CS121", "CS122"],
      },
      {
        code: "CS212",
        name: "Object-Oriented Programming",
        description:
          "Advanced object-oriented programming concepts and design patterns",
        credits: 3,
        capacity: 35,
        semester: Semester.FIRST,
        yearLevel: YearLevel.SOPHOMORE,
        year: 2,
        status: CourseStatus.OPEN,
        prerequisites: ["CS121"],
      },
      {
        code: "CS213",
        name: "Computer Organization and Architecture",
        description:
          "Computer system organization, architecture, and assembly language",
        credits: 3,
        capacity: 35,
        semester: Semester.FIRST,
        yearLevel: YearLevel.SOPHOMORE,
        year: 2,
        status: CourseStatus.OPEN,
        prerequisites: ["CS111"],
      },
      {
        code: "MATH211",
        name: "Calculus 1",
        description: "Limits, continuity, differentiation, and integration",
        credits: 3,
        capacity: 40,
        semester: Semester.FIRST,
        yearLevel: YearLevel.SOPHOMORE,
        year: 2,
        status: CourseStatus.OPEN,
        prerequisites: ["GE102"],
      },

      // SOPHOMORE YEAR - SECOND SEMESTER
      {
        code: "CS221",
        name: "Database Systems",
        description: "Database concepts, design, and implementation",
        credits: 3,
        capacity: 35,
        semester: Semester.SECOND,
        yearLevel: YearLevel.SOPHOMORE,
        year: 2,
        status: CourseStatus.OPEN,
        prerequisites: ["CS211"],
      },
      {
        code: "CS222",
        name: "Operating Systems",
        description: "Operating system concepts, design, and implementation",
        credits: 3,
        capacity: 35,
        semester: Semester.SECOND,
        yearLevel: YearLevel.SOPHOMORE,
        year: 2,
        status: CourseStatus.OPEN,
        prerequisites: ["CS213"],
      },
      {
        code: "CS223",
        name: "Web Development",
        description: "Web technologies, design, and development",
        credits: 3,
        capacity: 35,
        semester: Semester.SECOND,
        yearLevel: YearLevel.SOPHOMORE,
        year: 2,
        status: CourseStatus.OPEN,
        prerequisites: ["CS212"],
      },
      {
        code: "MATH221",
        name: "Calculus 2",
        description: "Applications of integration, sequences, and series",
        credits: 3,
        capacity: 40,
        semester: Semester.SECOND,
        yearLevel: YearLevel.SOPHOMORE,
        year: 2,
        status: CourseStatus.OPEN,
        prerequisites: ["MATH211"],
      },
      {
        code: "STAT221",
        name: "Probability and Statistics",
        description: "Probability theory and statistical methods",
        credits: 3,
        capacity: 40,
        semester: Semester.SECOND,
        yearLevel: YearLevel.SOPHOMORE,
        year: 2,
        status: CourseStatus.OPEN,
        prerequisites: ["MATH211"],
      },

      // JUNIOR YEAR - FIRST SEMESTER
      {
        code: "CS311",
        name: "Software Engineering",
        description: "Software development methodologies, processes, and tools",
        credits: 3,
        capacity: 30,
        semester: Semester.FIRST,
        yearLevel: YearLevel.JUNIOR,
        year: 3,
        status: CourseStatus.OPEN,
        prerequisites: ["CS212", "CS221"],
      },
      {
        code: "CS312",
        name: "Computer Networks",
        description: "Network architectures, protocols, and applications",
        credits: 3,
        capacity: 30,
        semester: Semester.FIRST,
        yearLevel: YearLevel.JUNIOR,
        year: 3,
        status: CourseStatus.OPEN,
        prerequisites: ["CS222"],
      },
      {
        code: "CS313",
        name: "Information Security",
        description: "Principles and practices of information security",
        credits: 3,
        capacity: 30,
        semester: Semester.FIRST,
        yearLevel: YearLevel.JUNIOR,
        year: 3,
        status: CourseStatus.OPEN,
        prerequisites: ["CS222"],
      },
      {
        code: "CS314",
        name: "Mobile Application Development",
        description: "Design and development of mobile applications",
        credits: 3,
        capacity: 30,
        semester: Semester.FIRST,
        yearLevel: YearLevel.JUNIOR,
        year: 3,
        status: CourseStatus.OPEN,
        prerequisites: ["CS212", "CS223"],
      },
      {
        code: "CS315",
        name: "Human-Computer Interaction",
        description: "Principles and methods of user interface design",
        credits: 3,
        capacity: 30,
        semester: Semester.FIRST,
        yearLevel: YearLevel.JUNIOR,
        year: 3,
        status: CourseStatus.OPEN,
        prerequisites: ["CS223"],
      },

      // JUNIOR YEAR - SECOND SEMESTER
      {
        code: "CS321",
        name: "Artificial Intelligence",
        description: "Principles and applications of artificial intelligence",
        credits: 3,
        capacity: 30,
        semester: Semester.SECOND,
        yearLevel: YearLevel.JUNIOR,
        year: 3,
        status: CourseStatus.OPEN,
        prerequisites: ["CS211", "STAT221"],
      },
      {
        code: "CS322",
        name: "Data Science",
        description: "Data analysis, visualization, and machine learning",
        credits: 3,
        capacity: 30,
        semester: Semester.SECOND,
        yearLevel: YearLevel.JUNIOR,
        year: 3,
        status: CourseStatus.OPEN,
        prerequisites: ["CS211", "STAT221"],
      },
      {
        code: "CS323",
        name: "Cloud Computing",
        description: "Cloud architectures, services, and deployment models",
        credits: 3,
        capacity: 30,
        semester: Semester.SECOND,
        yearLevel: YearLevel.JUNIOR,
        year: 3,
        status: CourseStatus.OPEN,
        prerequisites: ["CS312"],
      },
      {
        code: "CS324",
        name: "Software Project Management",
        description: "Project planning, estimation, and management",
        credits: 3,
        capacity: 30,
        semester: Semester.SECOND,
        yearLevel: YearLevel.JUNIOR,
        year: 3,
        status: CourseStatus.OPEN,
        prerequisites: ["CS311"],
      },
      {
        code: "CS325",
        name: "Research Methods in Computing",
        description: "Research methodologies and academic writing",
        credits: 3,
        capacity: 30,
        semester: Semester.SECOND,
        yearLevel: YearLevel.JUNIOR,
        year: 3,
        status: CourseStatus.OPEN,
        prerequisites: ["CS311"],
      },

      // SENIOR YEAR - FIRST SEMESTER
      {
        code: "CS411",
        name: "Capstone Project 1",
        description: "First part of the capstone project",
        credits: 3,
        capacity: 25,
        semester: Semester.FIRST,
        yearLevel: YearLevel.SENIOR,
        year: 4,
        status: CourseStatus.OPEN,
        prerequisites: ["CS311", "CS325"],
      },
      {
        code: "CS412",
        name: "Advanced Web Development",
        description: "Modern web frameworks and technologies",
        credits: 3,
        capacity: 25,
        semester: Semester.FIRST,
        yearLevel: YearLevel.SENIOR,
        year: 4,
        status: CourseStatus.OPEN,
        prerequisites: ["CS223", "CS311"],
      },
      {
        code: "CS413",
        name: "Machine Learning",
        description: "Algorithms and applications of machine learning",
        credits: 3,
        capacity: 25,
        semester: Semester.FIRST,
        yearLevel: YearLevel.SENIOR,
        year: 4,
        status: CourseStatus.OPEN,
        prerequisites: ["CS321", "CS322"],
      },
      {
        code: "CS414",
        name: "Internet of Things",
        description: "IoT architectures, protocols, and applications",
        credits: 3,
        capacity: 25,
        semester: Semester.FIRST,
        yearLevel: YearLevel.SENIOR,
        year: 4,
        status: CourseStatus.OPEN,
        prerequisites: ["CS312", "CS314"],
      },
      {
        code: "CS415",
        name: "Professional Ethics in Computing",
        description: "Ethical issues in computing and IT",
        credits: 3,
        capacity: 25,
        semester: Semester.FIRST,
        yearLevel: YearLevel.SENIOR,
        year: 4,
        status: CourseStatus.OPEN,
        prerequisites: ["GE201", "CS311"],
      },

      // SENIOR YEAR - SECOND SEMESTER
      {
        code: "CS421",
        name: "Capstone Project 2",
        description: "Second part of the capstone project",
        credits: 3,
        capacity: 25,
        semester: Semester.SECOND,
        yearLevel: YearLevel.SENIOR,
        year: 4,
        status: CourseStatus.OPEN,
        prerequisites: ["CS411"],
      },
      {
        code: "CS422",
        name: "Blockchain Technology",
        description: "Principles and applications of blockchain",
        credits: 3,
        capacity: 25,
        semester: Semester.SECOND,
        yearLevel: YearLevel.SENIOR,
        year: 4,
        status: CourseStatus.OPEN,
        prerequisites: ["CS312", "CS313"],
      },
      {
        code: "CS423",
        name: "Big Data Analytics",
        description: "Processing and analyzing large datasets",
        credits: 3,
        capacity: 25,
        semester: Semester.SECOND,
        yearLevel: YearLevel.SENIOR,
        year: 4,
        status: CourseStatus.OPEN,
        prerequisites: ["CS322", "CS323"],
      },
      {
        code: "CS424",
        name: "Computer Vision",
        description: "Image processing and computer vision techniques",
        credits: 3,
        capacity: 25,
        semester: Semester.SECOND,
        yearLevel: YearLevel.SENIOR,
        year: 4,
        status: CourseStatus.OPEN,
        prerequisites: ["CS413"],
      },
      {
        code: "CS425",
        name: "IT Entrepreneurship",
        description: "Starting and managing technology ventures",
        credits: 3,
        capacity: 25,
        semester: Semester.SECOND,
        yearLevel: YearLevel.SENIOR,
        year: 4,
        status: CourseStatus.OPEN,
        prerequisites: ["CS324", "CS415"],
      },
    ];

    // Filter out courses that already exist
    const coursesToCreate = comprehensiveCourses.filter(
      (course) => !existingCourseCodes.has(course.code)
    );
    console.log(
      `Creating ${coursesToCreate.length} new comprehensive courses...`
    );

    // Create a map to store newly created courses by code
    const courseMap = {};

    // Create courses first without prerequisites
    for (const courseData of coursesToCreate) {
      const { prerequisites, yearLevel, ...data } = courseData;

      // Assign a random faculty member
      const randomFaculty = faculty[Math.floor(Math.random() * faculty.length)];

      try {
        const course = await prisma.course.create({
          data: {
            ...data,
            facultyId: randomFaculty.id,
          },
        });

        console.log(`Created course: ${course.code} - ${course.name}`);
        courseMap[course.code] = course;
      } catch (error) {
        console.error(`Error creating course ${courseData.code}:`, error);
      }
    }

    // Now add prerequisites
    console.log("Adding prerequisites to courses...");

    // Get all courses including existing ones
    const allCourses = await prisma.course.findMany({
      select: {
        id: true,
        code: true,
        name: true,
      },
    });

    // Create a map of course codes to course objects
    const allCoursesMap = {};
    for (const course of allCourses) {
      allCoursesMap[course.code] = course;
    }

    // Add prerequisites to each course
    for (const courseData of coursesToCreate) {
      if (courseData.prerequisites.length > 0) {
        const course =
          courseMap[courseData.code] || allCoursesMap[courseData.code];

        if (!course) {
          console.log(
            `Course ${courseData.code} not found, skipping prerequisites...`
          );
          continue;
        }

        // Find prerequisite courses
        const prereqCourses = courseData.prerequisites
          .map((prereqCode) => allCoursesMap[prereqCode])
          .filter(Boolean);

        if (prereqCourses.length > 0) {
          try {
            await prisma.course.update({
              where: { id: course.id },
              data: {
                Course_B: {
                  connect: prereqCourses.map((c) => ({ id: c.id })),
                },
              },
            });
            console.log(
              `Added ${prereqCourses.length} prerequisites to ${course.code} - ${course.name}`
            );
          } catch (error) {
            console.error(
              `Error adding prerequisites to course ${course.code}:`,
              error
            );
          }
        } else {
          console.log(
            `No valid prerequisites found for ${course.code}, skipping...`
          );
        }
      }
    }

    console.log("Successfully seeded comprehensive courses from year 1 to 4!");
  } catch (error) {
    console.error("Error seeding courses:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
