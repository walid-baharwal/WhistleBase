"use client";

import { LoginForm } from "@/components/auth/login-form";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { signInSchema } from "@/schemas/signIn.schema";

const SignIn = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (data: z.infer<typeof signInSchema>) => {
    setIsSubmitting(true);
    try {
      const result = await signIn("credentials", {
        redirect: false,
        identifier: data.identifier,
        password: data.password,
      });

      if (result?.error) {
        toast.error("Login Failed:", {
          description: result.error,
        });
        return;
      }

      if (result?.url) {
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
      <LoginForm 
        onSubmit={handleSubmit} 
        isSubmitting={isSubmitting}
        className="w-full max-w-md"
      />
    </div>
  );
};

export default SignIn;
