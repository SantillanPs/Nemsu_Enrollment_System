// Script to seed more courses with prerequisites
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
    console.log('Starting to seed more courses with prerequisites...');

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

    // Define new courses by department
    const newCourses = [
      // Computer Science Department - Advanced Courses
      {
        code: "CS205",
        name: "Database Systems",
        description: "Introduction to database design, implementation, and management",
        credits: 3,
        capacity: 30,
        semester: Semester.FIRST,
        year: 2,
        status: CourseStatus.OPEN,
        prerequisites: ["CS102"], // Requires Computer Programming 1
      },
      {
        code: "CS206",
        name: "Web Development Fundamentals",
        description: "Introduction to HTML, CSS, JavaScript, and web development principles",
        credits: 3,
        capacity: 35,
        semester: Semester.SECOND,
        year: 2,
        status: CourseStatus.OPEN,
        prerequisites: ["CS102"], // Requires Computer Programming 1
      },
      {
        code: "CS304",
        name: "Cloud Computing",
        description: "Introduction to cloud architectures, services, and deployment models",
        credits: 3,
        capacity: 25,
        semester: Semester.FIRST,
        year: 3,
        status: CourseStatus.OPEN,
        prerequisites: ["CS205", "CS302"], // Requires Database Systems and Computer Networks
      },
      {
        code: "CS305",
        name: "Big Data Analytics",
        description: "Processing and analyzing large datasets using modern tools and techniques",
        credits: 3,
        capacity: 25,
        semester: Semester.SECOND,
        year: 3,
        status: CourseStatus.OPEN,
        prerequisites: ["CS205", "CS208"], // Requires Database Systems and Algorithms
      },
      
      // Mathematics Department - Advanced Courses
      {
        code: "MATH203",
        name: "Calculus 2",
        description: "Integral calculus and applications",
        credits: 3,
        capacity: 40,
        semester: Semester.FIRST,
        year: 2,
        status: CourseStatus.OPEN,
        prerequisites: ["MATH102"], // Requires Calculus 1
      },
      {
        code: "MATH204",
        name: "Differential Equations",
        description: "Ordinary differential equations and their applications",
        credits: 3,
        capacity: 35,
        semester: Semester.SECOND,
        year: 2,
        status: CourseStatus.OPEN,
        prerequisites: ["MATH203"], // Requires Calculus 2
      },
      {
        code: "MATH301",
        name: "Numerical Analysis",
        description: "Numerical methods for solving mathematical problems",
        credits: 3,
        capacity: 30,
        semester: Semester.FIRST,
        year: 3,
        status: CourseStatus.OPEN,
        prerequisites: ["MATH203", "MATH202"], // Requires Calculus 2 and Linear Algebra
      },
      
      // Physics Department
      {
        code: "PHYS101",
        name: "General Physics 1",
        description: "Mechanics, thermodynamics, and waves",
        credits: 4,
        capacity: 40,
        semester: Semester.FIRST,
        year: 1,
        status: CourseStatus.OPEN,
        prerequisites: [], // No prerequisites for first-year course
      },
      {
        code: "PHYS102",
        name: "General Physics 2",
        description: "Electricity, magnetism, and optics",
        credits: 4,
        capacity: 40,
        semester: Semester.SECOND,
        year: 1,
        status: CourseStatus.OPEN,
        prerequisites: ["PHYS101"], // Requires General Physics 1
      },
      {
        code: "PHYS201",
        name: "Modern Physics",
        description: "Introduction to quantum mechanics and relativity",
        credits: 3,
        capacity: 35,
        semester: Semester.FIRST,
        year: 2,
        status: CourseStatus.OPEN,
        prerequisites: ["PHYS102", "MATH102"], // Requires General Physics 2 and Calculus 1
      },
      
      // Business Department
      {
        code: "BUS101",
        name: "Introduction to Business",
        description: "Overview of business concepts and practices",
        credits: 3,
        capacity: 45,
        semester: Semester.FIRST,
        year: 1,
        status: CourseStatus.OPEN,
        prerequisites: [], // No prerequisites for first-year course
      },
      {
        code: "BUS201",
        name: "Principles of Marketing",
        description: "Marketing concepts, strategies, and applications",
        credits: 3,
        capacity: 40,
        semester: Semester.FIRST,
        year: 2,
        status: CourseStatus.OPEN,
        prerequisites: ["BUS101"], // Requires Introduction to Business
      },
      {
        code: "BUS202",
        name: "Financial Accounting",
        description: "Principles of financial accounting and reporting",
        credits: 3,
        capacity: 40,
        semester: Semester.SECOND,
        year: 2,
        status: CourseStatus.OPEN,
        prerequisites: ["BUS101"], // Requires Introduction to Business
      },
    ];

    // Filter out courses that already exist
    const coursesToCreate = newCourses.filter(course => !existingCourseCodes.has(course.code));
    console.log(`Creating ${coursesToCreate.length} new courses...`);

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
    console.log('Adding prerequisites to courses...');
    
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

    console.log('Successfully seeded additional courses with prerequisites!');
  } catch (error) {
    console.error('Error seeding courses:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
