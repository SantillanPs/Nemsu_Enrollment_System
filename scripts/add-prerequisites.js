// Script to add prerequisites to courses
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting to add course prerequisites...');

    // Get all courses
    const courses = await prisma.course.findMany({
      select: {
        id: true,
        code: true,
        name: true,
        year: true,
        semester: true,
      },
    });

    // Create a map of course codes to course objects for easier lookup
    const courseMap = {};
    courses.forEach(course => {
      courseMap[course.code] = course;
    });

    // Define prerequisites relationships
    const prerequisites = [
      // First year courses don't have prerequisites
      
      // Second year prerequisites
      { course: 'CS201', prerequisites: ['CS101', 'CS102'] }, // Data Structures requires Intro to Computing and Computer Programming 1
      { course: 'CS202', prerequisites: ['CS102'] }, // Object-Oriented Programming requires Computer Programming 1
      { course: 'MATH201', prerequisites: ['MATH101'] }, // Discrete Mathematics requires College Algebra
      { course: 'CS207', prerequisites: ['CS102'] }, // Software Engineering requires Computer Programming 1
      { course: 'CS208', prerequisites: ['CS201'] }, // Algorithms requires Data Structures
      { course: 'MATH202', prerequisites: ['MATH102'] }, // Linear Algebra requires Calculus 1
      
      // Third year prerequisites
      { course: 'CS301', prerequisites: ['CS202'] }, // Mobile Development requires Object-Oriented Programming
      { course: 'CS302', prerequisites: ['CS201'] }, // Computer Networks requires Data Structures
      { course: 'CS303', prerequisites: ['CS201', 'MATH201'] }, // AI requires Data Structures and Discrete Mathematics
      { course: 'CS311', prerequisites: ['CS302'] }, // Blockchain requires Computer Networks
      { course: 'CS312', prerequisites: ['CS302'] }, // IoT Systems requires Computer Networks
      { course: 'CS313', prerequisites: ['CS207'] }, // DevOps Practices requires Software Engineering
      { course: 'CS314', prerequisites: ['CS207'] }, // Research Methods requires Software Engineering
      
      // Fourth year prerequisites
      { course: 'CS401', prerequisites: ['CS303'] }, // Machine Learning requires AI
      { course: 'CS402', prerequisites: ['CS302'] }, // Cybersecurity requires Computer Networks
      { course: 'CS403', prerequisites: ['CS301'] }, // Web Development requires Mobile Development
      { course: 'CS404', prerequisites: ['CS402'] }, // Digital Forensics requires Cybersecurity
      { course: 'CS405', prerequisites: ['CS303'] }, // NLP requires AI
      { course: 'CS406', prerequisites: ['CS303', 'MATH202'] }, // Quantum Computing requires AI and Linear Algebra
      { course: 'CS407', prerequisites: ['CS314'] }, // Tech Entrepreneurship requires Research Methods
      { course: 'CS411', prerequisites: ['CS313'] }, // System Integration requires DevOps
      { course: 'CS412', prerequisites: ['CS313'] }, // IT Governance requires DevOps
      { course: 'CS413', prerequisites: ['CS402'] }, // Data Privacy requires Cybersecurity
    ];

    // Add prerequisites to courses
    for (const prereqDef of prerequisites) {
      const course = courseMap[prereqDef.course];
      if (!course) {
        console.log(`Course ${prereqDef.course} not found, skipping...`);
        continue;
      }

      const prereqCourses = prereqDef.prerequisites
        .map(code => courseMap[code])
        .filter(c => c); // Filter out any undefined courses

      if (prereqCourses.length === 0) {
        console.log(`No valid prerequisites found for ${prereqDef.course}, skipping...`);
        continue;
      }

      console.log(`Adding ${prereqCourses.length} prerequisites to ${course.code} - ${course.name}`);

      // Connect prerequisites to the course
      await prisma.course.update({
        where: { id: course.id },
        data: {
          prerequisites: {
            connect: prereqCourses.map(c => ({ id: c.id })),
          },
        },
      });
    }

    console.log('Successfully added prerequisites to courses!');
  } catch (error) {
    console.error('Error adding prerequisites:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
