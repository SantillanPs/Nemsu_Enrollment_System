import { prisma } from "./client";
import { SafeUser, UserWithProfile } from "@/types";

export function excludePassword(user: UserWithProfile): SafeUser {
  const { password, ...safeUser } = user;
  return safeUser;
}

export async function getUserById(id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });
    if (!user) return null;
    return excludePassword(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

export async function getUserByEmail(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });
    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}
