import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import { verifyAspNetIdentityV3Hash } from "./password-hasher";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        emailOrUsername: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.emailOrUsername || !credentials?.password) {
          return null;
        }

        const input = credentials.emailOrUsername.trim();
        const normalizedInput = input.toUpperCase();

        const user = await prisma.users.findFirst({
          where: {
            OR: [
              { NormalizedEmail: normalizedInput },
              { NormalizedUserName: normalizedInput },
            ],
            IsActive: true,
          },
          include: {
            UserRoles: {
              include: {
                Roles: true,
              },
            },
            Tenants: true,
          },
        });

        if (!user || !user.PasswordHash) {
          return null;
        }

        // Check lockout
        if (user.LockoutEnabled && user.LockoutEnd) {
          const lockoutEnd = new Date(user.LockoutEnd);
          if (lockoutEnd > new Date()) {
            return null;
          }
        }

        // Verify password using ASP.NET Identity V3 hash
        const isValid = verifyAspNetIdentityV3Hash(credentials.password, user.PasswordHash);

        if (!isValid) {
          // Increment failed count
          await prisma.users.update({
            where: { Id: user.Id },
            data: {
              AccessFailedCount: user.AccessFailedCount + 1,
              ...(user.AccessFailedCount + 1 >= 5
                ? {
                    LockoutEnd: new Date(Date.now() + 5 * 60 * 1000), // 5 min lockout
                  }
                : {}),
            },
          });
          return null;
        }

        // Reset failed count on success
        if (user.AccessFailedCount > 0) {
          await prisma.users.update({
            where: { Id: user.Id },
            data: { AccessFailedCount: 0, LockoutEnd: null },
          });
        }

        const roles = user.UserRoles.map((ur) => ur.Roles.Name).filter(Boolean) as string[];

        return {
          id: String(user.Id),
          userId: user.Id,
          tenantId: user.TenantId,
          email: user.Email || "",
          name: user.Name,
          surname: user.Surname,
          roles,
          profilePicturePath: user.ProfilePicturePath,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = (user as any).userId;
        token.tenantId = (user as any).tenantId;
        token.roles = (user as any).roles;
        token.surname = (user as any).surname;
        token.profilePicturePath = (user as any).profilePicturePath;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).userId = token.userId;
        (session.user as any).tenantId = token.tenantId;
        (session.user as any).roles = token.roles;
        (session.user as any).surname = token.surname;
        (session.user as any).profilePicturePath = token.profilePicturePath;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
