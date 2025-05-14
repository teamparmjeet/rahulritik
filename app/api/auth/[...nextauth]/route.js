import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/dbConnect";
import AdminModel from "@/model/Admin";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {},

      async authorize(credentials) {
        const { email, password } = credentials;
        try {
          await dbConnect();
          const admin = await AdminModel.findOne({ email });

          if (!admin) {
            return null;
          }

          const passwordMatch = await bcrypt.compare(password, admin.password);

          if (!passwordMatch)  {
            return null;
          }

          return {
            id: admin._id,
            email: admin.email,
            name: admin.name,
            usertype: admin.usertype,
          };

        } catch (error) {
          console.log("Error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.usertype = user.usertype;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.usertype = token.usertype;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/signin",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
