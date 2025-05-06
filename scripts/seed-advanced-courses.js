// Script to seed advanced courses with complex prerequisite relationships
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Define course status constants
const CourseStatus = {
  OPEN: "OPEN",
  CLOSED: "CLOSED",
  CANCELLED: "CANCELLED",
};

// Define semester constants
const Semester = {
  FIRST: "FIRST",
  SECOND: "SECOND",
  SUMMER: "SUMMER",
};

async function main() {
  try {
    console.log('Starting to seed advanced courses with complex prerequisites...');

    // Get all existing courses to avoid code conflicts
    const existingCourses = await prisma.course.findMany({
      select: {
        code: true,
      },
    });
    const existingCourseCodes = new Set(existingCourses.map(c => c.code));

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
      console.log('No faculty members found. Please run the main seed script first.');
      return;
    }

    console.log(`Found ${faculty.length} faculty members to assign to courses.`);

    // Define advanced courses with complex prerequisite relationships
    const advancedCourses = [
      // Interdisciplinary Courses
      {
        code: "TECH401",
        name: "Technology Ethics",
        description: "Ethical considerations in technology development and implementation",
        credits: 3,
        capacity: 30,
        semester: Semester.FIRST,
        year: 4,
        status: CourseStatus.OPEN,
        prerequisites: ["CS207", "BUS101"], // Requires Software Engineering and Intro to Business
      },
      {
        code: "TECH402",
        name: "Technology Entrepreneurship",
        description: "Starting and growing technology-based ventures",
        credits: 3,
        capacity: 25,
        semester: Semester.SECOND,
        year: 4,
        status: CourseStatus.OPEN,
        prerequisites: ["CS207", "BUS201"], // Requires Software Engineering and Principles of Marketing
      },
      
      // Advanced Computer Science
      {
        code: "CS410",
        name: "Distributed Systems",
        description: "Design and implementation of distributed computing systems",
        credits: 4,
        capacity: 25,
        semester: Semester.FIRST,
        year: 4,
        status: CourseStatus.OPEN,
        prerequisites: ["CS302", "CS304"], // Requires Computer Networks and Cloud Computing
      },
      {
        code: "CS420",
        name: "Advanced Artificial Intelligence",
        description: "Advanced topics in AI including deep learning and reinforcement learning",
        credits: 4,
        capacity: 20,
        semester: Semester.SECOND,
        year: 4,
        status: CourseStatus.OPEN,
        prerequisites: ["CS303", "MATH301"], // Requires AI and Numerical Analysis
      },
      {
        code: "CS430",
        name: "Computer Graphics",
        description: "Principles and practice of interactive computer graphics",
        credits: 3,
        capacity: 25,
        semester: Semester.FIRST,
        year: 4,
        status: CourseStatus.OPEN,
        prerequisites: ["CS208", "MATH202"], // Requires Algorithms and Linear Algebra
      },
      
      // Advanced Mathematics
      {
        code: "MATH401",
        name: "Complex Analysis",
        description: "Functions of a complex variable and their applications",
        credits: 3,
        capacity: 30,
        semester: Semester.FIRST,
        year: 4,
        status: CourseStatus.OPEN,
        prerequisites: ["MATH203", "MATH204"], // Requires Calculus 2 and Differential Equations
      },
      {
        code: "MATH410",
        name: "Mathematical Modeling",
        description: "Construction and analysis of mathematical models for real-world problems",
        credits: 3,
        capacity: 25,
        semester: Semester.SECOND,
        year: 4,
        status: CourseStatus.OPEN,
        prerequisites: ["MATH204", "MATH301"], // Requires Differential Equations and Numerical Analysis
      },
      
      // Advanced Physics
      {
        code: "PHYS301",
        name: "Quantum Mechanics",
        description: "Principles of quantum mechanics and applications",
        credits: 4,
        capacity: 25,
        semester: Semester.FIRST,
        year: 3,
        status: CourseStatus.OPEN,
        prerequisites: ["PHYS201", "MATH204"], // Requires Modern Physics and Differential Equations
      },
      {
        code: "PHYS401",
        name: "Statistical Mechanics",
        description: "Statistical methods in physics and thermodynamics",
        credits: 3,
        capacity: 20,
        semester: Semester.SECOND,
        year: 4,
        status: CourseStatus.OPEN,
        prerequisites: ["PHYS301", "MATH301"], // Requires Quantum Mechanics and Numerical Analysis
      },
      
      // Advanced Business
      {
        code: "BUS301",
        name: "Business Analytics",
        description: "Data-driven decision making in business",
        credits: 3,
        capacity: 35,
        semester: Semester.FIRST,
        year: 3,
        status: CourseStatus.OPEN,
        prerequisites: ["BUS202", "CS205"], // Requires Financial Accounting and Database Systems
      },
      {
        code: "BUS401",
        name: "Strategic Management",
        description: "Formulation and implementation of organizational strategy",
        credits: 3,
        capacity: 30,
        semester: Semester.SECOND,
        year: 4,
        status: CourseStatus.OPEN,
        prerequisites: ["BUS201", "BUS301"], // Requires Principles of Marketing and Business Analytics
      },
    ];

    // Filter out courses that already exist
    const coursesToCreate = advancedCourses.filter(course => !existingCourseCodes.has(course.code));
    console.log(`Creating ${coursesToCreate.length} new advanced courses...`);

    // Create a map to store newly created courses by code
    const courseMap = {};

    // Create courses first without prerequisites
    for (const courseData of coursesToCreate) {
      const { prerequisites, ...data } = courseData;
      
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
    console.log('Adding prerequisites to advanced courses...');
    
    // Get all courses including existing ones
    const allCourses = await prisma.course.findMany({
      select: {
        id: true,
        code: true,
        name: true,
      },
    });
    
    // Create a map of all courses by code
    const allCoursesMap = {};
    allCourses.forEach(course => {
      allCoursesMap[course.code] = course;
    });

    // Add prerequisites
    for (const courseData of coursesToCreate) {
      if (courseData.prerequisites.length > 0 && courseMap[courseData.code]) {
        const course = courseMap[courseData.code];
        const prereqCourses = courseData.prerequisites
          .map(code => allCoursesMap[code])
          .filter(c => c); // Filter out any undefined courses

        if (prereqCourses.length > 0) {
          try {
            await prisma.course.update({
              where: { id: course.id },
              data: {
                Course_B: {
                  connect: prereqCourses.map(c => ({ id: c.id })),
                },
              },
            });
            console.log(`Added ${prereqCourses.length} prerequisites to ${course.code} - ${course.name}`);
          } catch (error) {
            console.error(`Error adding prerequisites to course ${course.code}:`, error);
          }
        } else {
          console.log(`No valid prerequisites found for ${course.code}, skipping...`);
        }
      }
    }

    console.log('Successfully seeded advanced courses with complex prerequisites!');
  } catch (error) {
    console.error('Error seeding advanced courses:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
