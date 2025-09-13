"use client";

import { LoginForm } from "@/components/auth/LoginForm";
import { getSession, signIn } from "next-auth/react";
import React, { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { signInSchema } from "@/schemas/signIn.schema";
import { decryptPrivateKeyFromPassword } from "@/utils/sodium/decrypt-p-key-with-password";
import { SignInResponse } from "next-auth/react";
import { encryptAndSaveToIndexedDB } from "@/utils/index-db/indexed-db-keys";

export interface SignInResponseWithKeys extends SignInResponse {
  encryptedPrivateKey: string;
  salt: string;
  nonce: string;
}

const SignIn = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: z.infer<typeof signInSchema>) => {
    setIsSubmitting(true);

    try {
      const result = (await signIn("credentials", {
        redirect: false,
        identifier: data.identifier,
        password: data.password,
      })) as SignInResponseWithKeys;

      if (result?.error) {
        throw new Error(
          result.error === "CredentialsSignin"
            ? "Invalid credentials. Please check your email/username and password."
            : result.error
        );
      }

      if (!result?.url) {
        throw new Error("Login process incomplete. Please try again.");
      }

      let session = await getSession();
      if (!session?.user) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        session = await getSession();
      }

      if (!session?.user) {
        throw new Error("User session not found. Please try logging in again.");
      }

      const { encryptedPrivateKey, salt, nonce } = session.user;

      if (!encryptedPrivateKey || !salt || !nonce) {
        throw new Error("Your account is missing required security data. Please contact support.");
      }

      const privateKey = await decryptPrivateKeyFromPassword(
        data.password,
        encryptedPrivateKey,
        salt,
        nonce
      );

      if (!privateKey) {
        throw new Error(
          "Unable to decrypt your private key. Please verify your password is correct."
        );
      }

      await encryptAndSaveToIndexedDB({ privateKey });

      toast.success("Login successful");

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 100);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      console.error("Sign in error:", error);
      if (errorMessage.includes(" not found")) {
        toast.error("User not found", {
          description: "Please check your email/username and try again.",
        });
      } else if (errorMessage.includes("Invalid credentials")) {
        toast.error("Invalid credentials", {
          description: "Please check your email/username and password and try again.",
        });
      } else if (errorMessage.includes("verify your account")) {
        toast.error("Please verify your account before logging in", {
          description: "You have to re sign up with same email",
          duration: 6000,
        });
      } else {
        toast.error("An unexpected error occurred", {
          description: "Please try again later.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoginForm onSubmit={handleSubmit} isSubmitting={isSubmitting} className="w-full max-w-md" />
    </div>
  );
};

export default SignIn;
