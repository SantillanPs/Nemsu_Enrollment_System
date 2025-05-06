// Script to seed specialized courses with complex prerequisite chains
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
    console.log('Starting to seed specialized courses with complex prerequisite chains...');

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

    // Define specialized courses with complex prerequisite chains
    const specializedCourses = [
      // Capstone and Thesis Courses
      {
        code: "CS499",
        name: "Computer Science Capstone",
        description: "Culminating project applying computer science knowledge and skills",
        credits: 4,
        capacity: 20,
        semester: Semester.SECOND,
        year: 4,
        status: CourseStatus.OPEN,
        prerequisites: ["CS410", "CS420"], // Requires Distributed Systems and Advanced AI
      },
      {
        code: "MATH499",
        name: "Mathematics Thesis",
        description: "Independent research in mathematics",
        credits: 4,
        capacity: 15,
        semester: Semester.SECOND,
        year: 4,
        status: CourseStatus.OPEN,
        prerequisites: ["MATH401", "MATH410"], // Requires Complex Analysis and Mathematical Modeling
      },
      {
        code: "PHYS499",
        name: "Physics Research Project",
        description: "Independent research in physics",
        credits: 4,
        capacity: 15,
        semester: Semester.SECOND,
        year: 4,
        status: CourseStatus.OPEN,
        prerequisites: ["PHYS301", "PHYS401"], // Requires Quantum Mechanics and Statistical Mechanics
      },
      {
        code: "BUS499",
        name: "Business Strategy Capstone",
        description: "Comprehensive business case analysis and strategic planning",
        credits: 4,
        capacity: 25,
        semester: Semester.SECOND,
        year: 4,
        status: CourseStatus.OPEN,
        prerequisites: ["BUS301", "BUS401"], // Requires Business Analytics and Strategic Management
      },
      
      // Interdisciplinary Advanced Courses
      {
        code: "CSAI500",
        name: "AI Ethics and Governance",
        description: "Ethical, legal, and policy considerations in artificial intelligence",
        credits: 3,
        capacity: 20,
        semester: Semester.FIRST,
        year: 5,
        status: CourseStatus.CLOSED,
        prerequisites: ["CS420", "TECH401"], // Requires Advanced AI and Technology Ethics
      },
      {
        code: "DSCI500",
        name: "Advanced Data Science",
        description: "Advanced techniques in data analysis and machine learning",
        credits: 4,
        capacity: 20,
        semester: Semester.FIRST,
        year: 5,
        status: CourseStatus.CLOSED,
        prerequisites: ["CS420", "MATH410", "BUS301"], // Requires Advanced AI, Mathematical Modeling, and Business Analytics
      },
      {
        code: "QCOMP500",
        name: "Quantum Computing",
        description: "Principles and applications of quantum computing",
        credits: 4,
        capacity: 15,
        semester: Semester.SECOND,
        year: 5,
        status: CourseStatus.CLOSED,
        prerequisites: ["CS420", "PHYS301", "MATH401"], // Requires Advanced AI, Quantum Mechanics, and Complex Analysis
      },
      
      // Special Topics Courses
      {
        code: "CS450",
        name: "Special Topics: Blockchain Technology",
        description: "Advanced study of blockchain architecture and applications",
        credits: 3,
        capacity: 25,
        semester: Semester.FIRST,
        year: 4,
        status: CourseStatus.OPEN,
        prerequisites: ["CS410", "CS205"], // Requires Distributed Systems and Database Systems
      },
      {
        code: "CS455",
        name: "Special Topics: Internet of Things",
        description: "Design and implementation of IoT systems",
        credits: 3,
        capacity: 25,
        semester: Semester.SECOND,
        year: 4,
        status: CourseStatus.OPEN,
        prerequisites: ["CS302", "CS206"], // Requires Computer Networks and Web Development Fundamentals
      },
      {
        code: "MATH450",
        name: "Special Topics: Financial Mathematics",
        description: "Mathematical models in finance and investment",
        credits: 3,
        capacity: 25,
        semester: Semester.FIRST,
        year: 4,
        status: CourseStatus.OPEN,
        prerequisites: ["MATH401", "BUS202"], // Requires Complex Analysis and Financial Accounting
      },
    ];

    // Filter out courses that already exist
    const coursesToCreate = specializedCourses.filter(course => !existingCourseCodes.has(course.code));
    console.log(`Creating ${coursesToCreate.length} new specialized courses...`);

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
    console.log('Adding prerequisites to specialized courses...');
    
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

    console.log('Successfully seeded specialized courses with complex prerequisite chains!');
  } catch (error) {
    console.error('Error seeding specialized courses:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
