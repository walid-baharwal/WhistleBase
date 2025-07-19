"use client";

import { LoginForm } from "@/components/auth/LoginForm";
import { getSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

  const handleSubmit = async (data: z.infer<typeof signInSchema>) => {
    setIsSubmitting(true);
    try {
      const result = (await signIn("credentials", {
        redirect: false,
        identifier: data.identifier,
        password: data.password,
      })) as SignInResponseWithKeys;

      if (result?.error) {
        toast.error("Login Failed:", {
          description: result.error,
        });
        return;
      }

      if (result?.url) {
        const session = await getSession();
        if (!session?.user) return;
        const privateKey = await decryptPrivateKeyFromPassword(
          data.password,
          session?.user?.encryptedPrivateKey || "",
          session?.user?.salt || "",
          session?.user?.nonce || ""
        );

        await encryptAndSaveToIndexedDB({ privateKey });

        router.replace("/dashboard");
      } else {
        toast.error("Unexpected error occurred. Please try again.");
      }
    } catch (error: unknown) {
      toast.error("Sign In Failed:", {
        description: (error as Error)?.message || "An unexpected error occurred.",
      });
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
