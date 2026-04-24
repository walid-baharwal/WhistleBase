"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputPassword } from "@/components/input-password";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { requestPasswordResetSchema, verifyResetCodeSchema, resetPasswordSchema } from "@/schemas/passwordReset.schema";

type Step = "request" | "verify" | "reset" | "success";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");

  const requestResetMutation = trpc.auth.requestPasswordReset.useMutation();
  const verifyCodeMutation = trpc.auth.verifyResetCode.useMutation();
  const resetPasswordMutation = trpc.auth.resetPassword.useMutation();

  const requestForm = useForm<z.infer<typeof requestPasswordResetSchema>>({
    resolver: zodResolver(requestPasswordResetSchema),
    defaultValues: { email: "" },
  });

  const verifyForm = useForm<z.infer<typeof verifyResetCodeSchema>>({
    resolver: zodResolver(verifyResetCodeSchema),
    defaultValues: { email: "", reset_code: "" },
  });

  const resetForm = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: "", reset_code: "", new_password: "", confirm_password: "" },
  });

  const handleRequestReset = async (data: z.infer<typeof requestPasswordResetSchema>) => {
    try {
      await requestResetMutation.mutateAsync(data);
      setEmail(data.email);
      verifyForm.setValue("email", data.email);
      setStep("verify");
    } catch (error: unknown) {
      const err = error as { message?: string };
      requestForm.setError("email", {
        message: err.message || "Failed to send reset code",
      });
    }
  };

  const handleVerifyCode = async (data: z.infer<typeof verifyResetCodeSchema>) => {
    try {
      await verifyCodeMutation.mutateAsync(data);
      resetForm.setValue("email", data.email);
      resetForm.setValue("reset_code", data.reset_code);
      setStep("reset");
    } catch (error: unknown) {
      const err = error as { message?: string };
      verifyForm.setError("reset_code", {
        message: err.message || "Invalid reset code",
      });
    }
  };

  const handleResetPassword = async (data: z.infer<typeof resetPasswordSchema>) => {
    try {
      await resetPasswordMutation.mutateAsync(data);
      setStep("success");
    } catch (error: unknown) {
      const err = error as { message?: string };
      resetForm.setError("new_password", {
        message: err.message || "Failed to reset password",
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-extrabold tracking-tight md:text-3xl">
              {step === "request" && "Reset Password"}
              {step === "verify" && "Verify Code"}
              {step === "reset" && "New Password"}
              {step === "success" && "Success!"}
            </CardTitle>
            <CardDescription>
              {step === "request" && "Enter your email to receive a reset code"}
              {step === "verify" && "Enter the 6-digit code sent to your email"}
              {step === "reset" && "Create a new password for your account"}
              {step === "success" && "Your password has been reset successfully"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === "request" && (
              <form onSubmit={requestForm.handleSubmit(handleRequestReset)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    {...requestForm.register("email")}
                  />
                  {requestForm.formState.errors.email && (
                    <p className="text-sm text-destructive">
                      {requestForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={requestResetMutation.isPending}
                >
                  {requestResetMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Reset Code"
                  )}
                </Button>
              </form>
            )}

            {step === "verify" && (
              <form onSubmit={verifyForm.handleSubmit(handleVerifyCode)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset_code">Reset Code</Label>
                  <Input
                    id="reset_code"
                    type="text"
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    {...verifyForm.register("reset_code")}
                  />
                  {verifyForm.formState.errors.reset_code && (
                    <p className="text-sm text-destructive">
                      {verifyForm.formState.errors.reset_code.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Code sent to {email}
                  </p>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={verifyCodeMutation.isPending}
                >
                  {verifyCodeMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify Code"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setStep("request")}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </form>
            )}

            {step === "reset" && (
              <form onSubmit={resetForm.handleSubmit(handleResetPassword)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new_password">New Password</Label>
                  <InputPassword
                    id="new_password"
                    placeholder="Enter new password"
                    {...resetForm.register("new_password")}
                  />
                  {resetForm.formState.errors.new_password && (
                    <p className="text-sm text-destructive">
                      {resetForm.formState.errors.new_password.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Confirm Password</Label>
                  <InputPassword
                    id="confirm_password"
                    placeholder="Confirm new password"
                    {...resetForm.register("confirm_password")}
                  />
                  {resetForm.formState.errors.confirm_password && (
                    <p className="text-sm text-destructive">
                      {resetForm.formState.errors.confirm_password.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={resetPasswordMutation.isPending}
                >
                  {resetPasswordMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </form>
            )}

            {step === "success" && (
              <div className="space-y-4 text-center">
                <div className="flex justify-center">
                  <CheckCircle2 className="h-16 w-16 text-green-500" />
                </div>
                <p className="text-muted-foreground">
                  You can now sign in with your new password.
                </p>
                <Button
                  className="w-full"
                  onClick={() => router.push("/auth/sign-in")}
                >
                  Go to Sign In
                </Button>
              </div>
            )}

            {step !== "success" && (
              <div className="mt-6 text-center text-sm">
                Remember your password?{" "}
                <Link href="/auth/sign-in" className="underline underline-offset-4">
                  Sign in
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
