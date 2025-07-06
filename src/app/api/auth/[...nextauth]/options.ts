import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import Credentials from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
    
providers: [
    Credentials({
    id: "credentials",
    name: "Credentials",
    credentials: {
        email: { label: "Email" },
        password: { label: "Password", type: "password" },
    },

    async authorize(credentials: any): Promise<any> {
       await dbConnect();
        try {
        const user = await UserModel.findOne({
            $or: [{ email: credentials.identifier }, { username: credentials.identifier }],
        });
        if (!user) {
            throw new Error("User with this credential not found");
        }
        if (!user.isVerified) {
            throw new Error("Please verify your account before logging in");
        }
        const isPasswordCorrect = await user.isPasswordCorrect(credentials.password);
        if (isPasswordCorrect) {
            return user;
        } else {
            throw new Error("Please login using correct credentials");
        }
        } catch (error: any) {
        throw new Error(error.message);
        }
    },
    }),
],

callbacks: {
    async jwt({ token, user }) {
    if (user) {
        token._id = user._id?.toString();
        token.isVerified = user.isVerified;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.email = user.email;
        token.Phone = user.Phone;
        token.company = user.company;
    }
    return token;
},
async session({ session, token }) {
    if (token) {
        session.user._id = token._id;
        session.user.isVerified = token.isVerified;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.email = token.email;
        session.user.Phone = token.Phone;
        session.user.company = token.company;
    }
    return session;
    },
},
session: {
    strategy: "jwt",
},
secret: process.env.NEXTAUTH_SECRET,
pages: {
    signIn: "/sign-in",
},
};
