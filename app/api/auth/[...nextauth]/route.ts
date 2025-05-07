import NextAuth, { DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { isSystemSuperAdmin } from "@/lib/utils/system-admin";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      role?: string;
      isSystemUser?: boolean;
      isVerified?: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role?: string;
    isSystemUser?: boolean;
    isVerified?: boolean;
  }
}

const prisma = new PrismaClient();

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            profile: true,
          },
        });

        if (!user || !user.profile) {
          throw new Error("No user found");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          isSystemUser: user.isSystemUser,
          isVerified: user.profile.isVerified,
          name: `${user.profile.firstName} ${user.profile.lastName}`,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.isSystemUser = user.isSystemUser;
        token.isVerified = user.isVerified;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.isSystemUser = token.isSystemUser as boolean;
        session.user.isVerified = token.isVerified as boolean;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
