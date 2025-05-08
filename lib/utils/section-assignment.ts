import { prisma } from "@/lib/prisma";

/**
 * Assigns students to sections for a specific course
 * @param courseId The ID of the course to assign sections for
 * @returns Object containing results and errors
 */
export async function assignSectionsForCourse(courseId: string) {
  try {
    // Get the course
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        sections: true,
      },
    });

    if (!course) {
      throw new Error("Course not found");
    }

    // Get all enrollments for this course that don't have a section assigned
    const enrollments = await prisma.enrollment.findMany({
      where: {
        courseId,
        sectionId: null,
        status: "PENDING", // Only assign pending enrollments
      },
      orderBy: {
        createdAt: "asc", // Process oldest enrollments first
      },
    });

    if (enrollments.length === 0) {
      return {
        success: true,
        assigned: [],
        message: "No enrollments to assign",
      };
    }

    // Get all sections for this course
    let sections = await prisma.courseSection.findMany({
      where: {
        courseId,
      },
      include: {
        enrollments: true,
      },
    });

    // If no sections exist, create the first one
    if (sections.length === 0) {
      const newSection = await prisma.courseSection.create({
        data: {
          courseId,
          sectionCode: "A",
          schedule: "TBD",
          room: "TBD",
          maxStudents: course.capacity,
        },
        include: {
          enrollments: true,
        },
      });
      sections = [newSection];
    }

    // Process each enrollment
    const results = [];
    const errors = [];

    for (const enrollment of enrollments) {
      try {
        // Find a section with available space
        let targetSection = sections.find(
          (section) => section.enrollments.length < section.maxStudents
        );

        // If no section has space, create a new one
        if (!targetSection) {
          // Generate the next section code (A, B, C, ...)
          const lastSectionCode = sections[sections.length - 1].sectionCode;
          const nextSectionCode = String.fromCharCode(
            lastSectionCode.charCodeAt(0) + 1
          );

          targetSection = await prisma.courseSection.create({
            data: {
              courseId,
              sectionCode: nextSectionCode,
              schedule: "TBD",
              room: "TBD",
              maxStudents: course.capacity,
            },
            include: {
              enrollments: true,
            },
          });

          sections.push(targetSection);
        }

        // Assign the enrollment to the section
        const updatedEnrollment = await prisma.enrollment.update({
          where: { id: enrollment.id },
          data: {
            sectionId: targetSection.id,
            status: "APPROVED", // Automatically approve when assigned to a section
          },
          include: {
            student: {
              select: {
                email: true,
                profile: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
            course: {
              select: {
                code: true,
                name: true,
              },
            },
            section: true,
          },
        });

        results.push(updatedEnrollment);

        // Update the section's enrollment count in our local array
        const sectionIndex = sections.findIndex(
          (s) => s.id === targetSection.id
        );
        if (sectionIndex !== -1) {
          sections[sectionIndex].enrollments.push(enrollment);
        }
      } catch (error) {
        console.error(
          `Error assigning enrollment ${enrollment.id} to a section:`,
          error
        );
        errors.push({
          enrollmentId: enrollment.id,
          error: "Failed to assign to a section",
        });
      }
    }

    return {
      success: results.length > 0,
      assigned: results,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully assigned ${results.length} out of ${enrollments.length} enrollments to sections.`,
    };
  } catch (error) {
    console.error("Error assigning students to sections:", error);
    throw error;
  }
}
