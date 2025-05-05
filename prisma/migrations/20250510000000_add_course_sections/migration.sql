-- CreateTable
CREATE TABLE "CourseSection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sectionCode" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "schedule" TEXT NOT NULL,
    "room" TEXT NOT NULL,
    "maxStudents" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- AlterTable
ALTER TABLE "Enrollment" ADD COLUMN "sectionId" TEXT REFERENCES "CourseSection" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE UNIQUE INDEX "CourseSection_courseId_sectionCode_key" ON "CourseSection"("courseId", "sectionCode");

-- CreateIndex
CREATE INDEX "CourseSection_courseId_idx" ON "CourseSection"("courseId");

-- CreateIndex
CREATE INDEX "Enrollment_sectionId_idx" ON "Enrollment"("sectionId");
