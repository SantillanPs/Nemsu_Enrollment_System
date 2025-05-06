-- CreateTable
CREATE TABLE "FacultyInvitation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "FacultyInvitation_email_key" ON "FacultyInvitation"("email");

-- CreateIndex
CREATE UNIQUE INDEX "FacultyInvitation_token_key" ON "FacultyInvitation"("token");
