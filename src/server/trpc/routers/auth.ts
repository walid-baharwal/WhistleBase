import { z } from "zod";
import { publicProcedure, createTRPCRouter, protectedProcedure } from "../context";
import { organizationSettingsSchema, userSettingsSchema, passwordSettingsSchema } from "@/schemas/settings.schema";
import UserModel from "@/models/user.model";
import OrganizationModel from "@/models/organization.model";
import EmailVerificationModel from "@/models/email_verification.model";

import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { verificationCodeSchema, organizationStepSchema } from "@/schemas/signUp.schema";
import OrganizationMemberModel from "@/models/organization_member.model";
import { initSodiumServer } from "@/lib/sodium-server";

const personalInfoSchema = z.object({
  email: z.string().email(),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  password: z.string().min(8),
});

export const authRouter = createTRPCRouter({
  sendVerificationEmail: publicProcedure.input(personalInfoSchema).mutation(async ({ input }) => {
    const { email, first_name, last_name, password } = input;

    const existingUser = await UserModel.findOne({ email });
    if (existingUser && existingUser.email_verified_at) {
      throw new Error("User with this email already exists");
    }

    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 3600000);

    await EmailVerificationModel.deleteMany({
      user_id: existingUser?._id || null,
    });

    if (existingUser) {
      existingUser.first_name = first_name;
      existingUser.last_name = last_name;
      existingUser.password = password;
      await existingUser.save();

      const newVerification = new EmailVerificationModel({
        user_id: existingUser._id,
        token: verificationToken,
        expires_at: expiresAt,
      });
      await newVerification.save();
    } else {
      const newUser = new UserModel({
        email,
        password,
        first_name,
        last_name,
        email_verified_at: null,
      });
      await newUser.save();

      const newVerification = new EmailVerificationModel({
        user_id: newUser._id,
        token: verificationToken,
        expires_at: expiresAt,
      });
      await newVerification.save();
    }

    const emailResponse = await sendVerificationEmail(email, first_name, verificationToken);
    if (!emailResponse.success) {
      throw new Error(emailResponse.message);
    }

    return {
      success: true,
      message: "Verification code sent to your email",
      email,
    };
  }),

  verifyCode: publicProcedure
    .input(verificationCodeSchema.extend({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const { email, verification_code } = input;

      const verification = await EmailVerificationModel.findOne({
        token: verification_code,
      });

      if (!verification) {
        throw new Error("Invalid verification code");
      }

      if (verification.expires_at < new Date()) {
        throw new Error("Verification code has expired");
      }

      return {
        success: true,
        message: "Email verified successfully",
        email,
      };
    }),

  completeSignup: publicProcedure
    .input(
      organizationStepSchema.extend({
        email: z.string().email(),
        verification_code: z.string(),
        encryptedPrivateKey: z.string(),
        salt: z.string(),
        nonce: z.string(),
        publicKey: z.instanceof(Uint8Array<ArrayBufferLike>),
      })
    )
    .mutation(async ({ input }) => {
      const {
        email,
        organization_name,
        country,
        verification_code,
        encryptedPrivateKey,
        salt,
        nonce,
        publicKey,
      } = input;

      const verification = await EmailVerificationModel.findOne({
        token: verification_code,
      });

      if (!verification || verification.expires_at < new Date()) {
        throw new Error("Invalid or expired verification code");
      }

      const user = await UserModel.findOne({ email });

      if (!user) {
        throw new Error("User not found. Please restart the signup process.");
      }

      if (user.email_verified_at) {
        throw new Error("User with this email already exists");
      }

      user.email_verified_at = new Date();

      const sodium = await initSodiumServer();

      const convertedPublicKey = sodium.to_base64(publicKey);

      const newOrganization = new OrganizationModel({
        name: organization_name,
        owner: user._id,
        country,
        public_key: convertedPublicKey,
      });

      const orgMember = new OrganizationMemberModel({
        user_id: user._id,
        organization_id: newOrganization._id,
        role: "ADMIN",
        private_key: encryptedPrivateKey,
        salt,
        nonce,
      });

      await Promise.all([
        user.save(),
        newOrganization.save(),
        orgMember.save(),
        EmailVerificationModel.deleteOne({ _id: verification._id }),
      ]);

      return {
        success: true,
        message: "Account created successfully!",
        user: {
          _id: user._id?.toString() || "",
          email_verified_at: user.email_verified_at,
          first_name: user.first_name,
          last_name: user.last_name,
        },
      };
    }),

  updateOrganization: protectedProcedure
    .input(organizationSettingsSchema)
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user._id;

      const organization = await OrganizationModel.findOne({ owner: userId });
      if (!organization) {
        throw new Error("Organization not found");
      }

      organization.name = input.name;
      await organization.save();

      return {
        success: true,
        message: "Organization updated successfully",
      };
    }),

  updateUserProfile: protectedProcedure
    .input(userSettingsSchema)
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user._id;

      const user = await UserModel.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      user.first_name = input.first_name;
      user.last_name = input.last_name;
      await user.save();

      return {
        success: true,
        message: "Profile updated successfully",
      };
    }),

  updatePassword: protectedProcedure
    .input(passwordSettingsSchema)
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user._id;

      const user = await UserModel.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      const isPasswordCorrect = await user.isPasswordCorrect(input.current_password);
      if (!isPasswordCorrect) {
        throw new Error("Current password is incorrect");
      }

      user.password = input.new_password;
      await user.save();

      return {
        success: true,
        message: "Password updated successfully",
      };
    }),

  getUserAndOrganization: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user._id;

      const user = await UserModel.findById(userId).select("-password");
      if (!user) {
        throw new Error("User not found");
      }

      const organization = await OrganizationModel.findOne({ owner: userId });
      if (!organization) {
        throw new Error("Organization not found");
      }

      return {
        user: {
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
        },
        organization: {
          name: organization.name,
          country: organization.country,
        },
      };
    }),
});
