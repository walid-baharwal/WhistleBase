"use client";

import { SignupWizard } from "@/components/auth/SignupWizard";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const SignUp = () => {
  const router = useRouter();

  const handleSignupSuccess = async ({ email, password }: { email: string; password: string }) => {
    try {
      const result = await signIn("credentials", {
        redirect: false,
        identifier: email,
        password: password,
      });

      if (result?.error) {
        console.error("Auto-login failed:", result.error);

        router.push("/sign-in");
      } else if (result?.url || result?.ok) {
        router.replace("/dashboard");
      } else {
        router.push("/sign-in");
      }
    } catch (error: unknown) {
      console.error("Auto-login error:", {
        description: (error as Error)?.message || "An unexpected error occurred.",
      });

      router.push("/sign-in");
    }
  };

  return <SignupWizard onSignupSuccess={handleSignupSuccess} />;
};

export default SignUp;
