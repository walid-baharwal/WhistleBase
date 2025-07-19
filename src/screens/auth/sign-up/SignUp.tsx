"use client";

import { SignupWizard } from "@/components/auth/SignUpWizard";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { encryptAndSaveToIndexedDB } from "@/utils/index-db/indexed-db-keys";
import { SignInResponseWithKeys } from "../sign-in/SignIn";

const SignUp = () => {
  const router = useRouter();

  const handleSignupSuccess = async ({
    email,
    password,
    privateKey,
  }: {
    email: string;
    password: string;
    privateKey: Uint8Array<ArrayBufferLike>;
  }) => {
    try {
      const result = (await signIn("credentials", {
        redirect: false,
        identifier: email,
        password: password,
      })) as SignInResponseWithKeys;
      if (result?.url || result?.ok) {
        await encryptAndSaveToIndexedDB({ privateKey });

        router.replace("/dashboard");
      } else {
        router.push("/auth/sign-in");
      }
    } catch (error: unknown) {
      console.error("Auto-login error:", {
        description: (error as Error)?.message || "An unexpected error occurred.",
      });

      router.push("/auth/sign-in");
    }
  };

  return <SignupWizard onSignupSuccess={handleSignupSuccess} />;
};

export default SignUp;
