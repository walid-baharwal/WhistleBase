import { z } from "zod";
import { publicProcedure, createTRPCRouter } from "../context";
import UserModel from "@/models/user.model";
import OrganizationModel from "@/models/organization.model";
import EmailVerificationModel from "@/models/email_verification.model";

import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { verificationCodeSchema, organizationStepSchema } from "@/schemas/signUp.schema";
import SubscriptionModel from "@/models/subscription.model";
import OrganizationMemberModel from "@/models/organization_member.model";

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
      // Update existing unverified user
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
      })
    )
    .mutation(async ({ input }) => {
      const { email, organization_name, country, verification_code } = input;

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

      const newOrganization = new OrganizationModel({
        name: organization_name,
        owner: user._id,
        country,
      });

      const orgMember = new OrganizationMemberModel({
        user_id: user._id,
        organization_id: newOrganization._id,
        role: "ADMIN",
      });

      const trialSubscription = new SubscriptionModel({
        plan_id: null,
        organization_id: newOrganization._id,
        type: "TRIAL",
        started_at: new Date(),
        ends_at: new Date(new Date().setDate(new Date().getDate() + 14)), // 14 days trial
      });

      await Promise.all([
        user.save(),
        newOrganization.save(),
        orgMember.save(),
        trialSubscription.save(),
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
        }
      };
    }),
});
