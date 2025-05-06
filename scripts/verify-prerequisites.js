// Script to verify course prerequisites
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Verifying course prerequisites...');

    // Get all courses with their prerequisites
    const courses = await prisma.course.findMany({
      select: {
        id: true,
        code: true,
        name: true,
        year: true,
        semester: true,
        Course_B: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
      orderBy: [
        {
          year: 'asc',
        },
        {
          semester: 'asc',
        },
        {
          code: 'asc',
        },
      ],
    });

    console.log(`Found ${courses.length} total courses in the database.`);
    
    // Count courses with prerequisites
    const coursesWithPrereqs = courses.filter(course => course.Course_B.length > 0);
    console.log(`Found ${coursesWithPrereqs.length} courses with prerequisites.`);
    
    // Display courses with their prerequisites
    console.log('\nCourses with prerequisites:');
    console.log('==========================');
    
    coursesWithPrereqs.forEach(course => {
      console.log(`\n${course.code}: ${course.name} (Year ${course.year}, ${course.semester} semester)`);
      console.log('Prerequisites:');
      
      if (course.Course_B.length === 0) {
        console.log('  None');
      } else {
        course.Course_B.forEach(prereq => {
          console.log(`  - ${prereq.code}: ${prereq.name}`);
        });
      }
    });
    
    // Find courses with the most prerequisites
    const maxPrereqs = Math.max(...courses.map(course => course.Course_B.length));
    const coursesWithMaxPrereqs = courses.filter(course => course.Course_B.length === maxPrereqs);
    
    console.log(`\nCourses with the most prerequisites (${maxPrereqs}):`);
    coursesWithMaxPrereqs.forEach(course => {
      console.log(`- ${course.code}: ${course.name}`);
    });
    
    // Count prerequisites by year
    const prereqsByYear = {};
    courses.forEach(course => {
      if (!prereqsByYear[course.year]) {
        prereqsByYear[course.year] = {
          totalCourses: 0,
          coursesWithPrereqs: 0,
          totalPrereqs: 0,
        };
      }
      
      prereqsByYear[course.year].totalCourses++;
      
      if (course.Course_B.length > 0) {
        prereqsByYear[course.year].coursesWithPrereqs++;
        prereqsByYear[course.year].totalPrereqs += course.Course_B.length;
      }
    });
    
    console.log('\nPrerequisites by year:');
    Object.keys(prereqsByYear).sort().forEach(year => {
      const stats = prereqsByYear[year];
      console.log(`Year ${year}:`);
      console.log(`  Total courses: ${stats.totalCourses}`);
      console.log(`  Courses with prerequisites: ${stats.coursesWithPrereqs} (${Math.round(stats.coursesWithPrereqs / stats.totalCourses * 100)}%)`);
      console.log(`  Total prerequisites: ${stats.totalPrereqs}`);
      console.log(`  Average prerequisites per course: ${(stats.totalPrereqs / stats.totalCourses).toFixed(2)}`);
    });
    
    console.log('\nVerification complete!');
  } catch (error) {
    console.error('Error verifying prerequisites:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
