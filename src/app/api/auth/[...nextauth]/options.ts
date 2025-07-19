import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import Credentials from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";
import OrganizationMemberModel from "@/models/organization_member.model";
import OrganizationModel from "@/models/organization.model";
import { generateSessionKey } from "@/utils/session/generate-session";

export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      id: "credentials",
      name: "Credentials",
      credentials: {
        identifier: { label: "Email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials: Record<string, string> | undefined) {
        await dbConnect();
        try {
          const user = await UserModel.findOne({
            email: credentials?.identifier,
          });

          if (!user) {
            throw new Error("User with this credential not found");
          }
          if (!user.email_verified_at) {
            throw new Error("Please verify your account before logging in");
          }

          const isPasswordCorrect = await user.isPasswordCorrect(credentials?.password || "");
          if (isPasswordCorrect) {
            const orgMember = await OrganizationMemberModel.findOne({ user_id: user._id });
            const organization = await OrganizationModel.findOne({
              _id: orgMember?.organization_id,
            });

            return {
              id: (user._id as string).toString(),
              _id: (user._id as string).toString(),
              email: user.email,
              first_name: user.first_name,
              last_name: user.last_name,
              email_verified_at: user.email_verified_at,
              organization_id: organization?._id?.toString(),
              organization_name: organization?.name,
              owner: organization?.owner?.toString(),
              country: organization?.country,
              encryptedPrivateKey: orgMember?.private_key,
              salt: orgMember?.salt,
              nonce: orgMember?.nonce,
              publicKey: organization?.public_key,
            };
          } else {
            throw new Error("Please login using correct credentials");
          }
        } catch (error: unknown) {
          throw new Error((error as Error).message);
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        console.log("user", user);
        token._id = user._id?.toString();
        token.email_verified_at = user.email_verified_at;
        token.first_name = user.first_name;
        token.last_name = user.last_name;
        token.email = user.email;
        token.organization_id = user.organization_id;
        token.organization_name = user.organization_name;
        token.owner = user.owner;
        token.country = user.country;
        token.encryptedPrivateKey = user.encryptedPrivateKey;
        token.salt = user.salt;
        token.nonce = user.nonce;
        token.publicKey = user.publicKey;

        if (!token.aesKey) {
          token.aesKey = await generateSessionKey();
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.email_verified_at = token.email_verified_at;
        session.user.first_name = token.first_name;
        session.user.last_name = token.last_name;
        session.user.email = token.email;
        session.user.organization_id = token.organization_id;
        session.user.organization_name = token.organization_name;
        session.user.owner = token.owner;
        session.user.country = token.country;
        session.user.aesKey = token.aesKey;
        session.user.encryptedPrivateKey = token.encryptedPrivateKey;
        session.user.salt = token.salt;
        session.user.nonce = token.nonce;
        session.user.publicKey = token.publicKey;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/sign-in",
    signOut: "/auth/sign-in",
  },
};
