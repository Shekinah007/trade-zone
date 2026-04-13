import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      role?: string;
      status?: string;
      registrationLimit?: number;
      unlimitedRegistrations?: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
    status?: string;
    registrationLimit?: number;
    unlimitedRegistrations?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    status?: string;
    registrationLimit?: number;
    unlimitedRegistrations?: boolean;
  }
}
