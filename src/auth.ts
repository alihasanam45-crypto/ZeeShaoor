import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import User from "@/models/User";
import connectToDatabase from "@/lib/mongodb";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectToDatabase();
        if (!credentials?.email || !credentials?.password) return null;
        return null; // Login logic hum next step mein denge
      },
    }),
  ],
  secret: process.env.BETTER_AUTH_SECRET,
  session: { strategy: "jwt" },
});