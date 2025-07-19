"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InputPassword } from "@/components/input-password";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormLabel,
} from "@/components/ui/form";
import { toast } from "sonner";
import {
  personalStepSchema,
  organizationStepSchema,
  verificationCodeSchema,
  type PersonalStepData,
  type OrganizationStepData,
  type VerificationCodeData,
} from "@/schemas/signUp.schema";
import { Loader2, Check, ArrowRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { countries } from "@/utils/constants";
import { ScrollArea } from "../ui/scroll-area";
import { initSodium } from "@/lib/sodium";
import { encryptPrivateKeyWithPassword } from "@/utils/sodium/encrypt-p-key-with-password";

interface SignupWizardProps {
  onSignupSuccess?: (data: {
    email: string;
    password: string;
    privateKey: Uint8Array<ArrayBufferLike>;
  }) => Promise<void>;
}

export function SignupWizard({ onSignupSuccess }: SignupWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [privateKey, setPrivateKey] = useState<Uint8Array<ArrayBufferLike> | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    confirm_password: "",
    organization_name: "",
    country: "",
    verification_code: "",
  });

  const personalForm = useForm<PersonalStepData>({
    resolver: zodResolver(personalStepSchema),
    defaultValues: {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      password: formData.password,
      confirm_password: formData.confirm_password,
    },
  });

  const verificationForm = useForm<VerificationCodeData>({
    resolver: zodResolver(verificationCodeSchema),
    defaultValues: { verification_code: "" },
  });

  const organizationForm = useForm<OrganizationStepData>({
    resolver: zodResolver(organizationStepSchema),
    defaultValues: {
      organization_name: formData.organization_name,
      country: formData.country,
    },
  });

  const sendEmailMutation = trpc.auth.sendVerificationEmail.useMutation({
    onSuccess: (data: { message: string }) => {
      toast.success(data.message);
      setCurrentStep(2);
      setIsSubmitting(false);
    },
    onError: (error: { message: string }) => {
      toast.error(error.message);
      setIsSubmitting(false);
    },
  });

  const verifyEmailMutation = trpc.auth.verifyCode.useMutation({
    onSuccess: (data: { message: string }) => {
      toast.success(data.message);
      setCurrentStep(3);
      setIsSubmitting(false);
    },
    onError: (error: { message: string }) => {
      toast.error(error.message);
      setIsSubmitting(false);
    },
  });

  const signupMutation = trpc.auth.completeSignup.useMutation({
    onSuccess: async (data) => {
      toast.success(data.message);
      try {
        await onSignupSuccess?.({
          email: formData.email,
          password: formData.password,
          privateKey: privateKey!,
        });
      } catch (error) {
        console.error("Auto-login failed:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
    onError: (error: { message: string }) => {
      toast.error(error.message);
      setIsSubmitting(false);
    },
  });

  const onPersonalSubmit = (data: PersonalStepData) => {
    setIsSubmitting(true);
    setFormData({
      ...formData,
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      password: data.password,
      confirm_password: data.confirm_password,
    });

    sendEmailMutation.mutate({
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      password: data.password,
    });
  };

  const onVerificationSubmit = (data: VerificationCodeData) => {
    setIsSubmitting(true);
    setFormData({ ...formData, verification_code: data.verification_code });
    verifyEmailMutation.mutate({
      email: formData.email,
      verification_code: data.verification_code,
    });
  };

  const onOrganizationSubmit = async (data: OrganizationStepData) => {
    setIsSubmitting(true);
    const sodium = await initSodium();
    const { publicKey, privateKey } = sodium.crypto_box_keypair();
    const { encryptedPrivateKey, salt, nonce } = await encryptPrivateKeyWithPassword(
      formData.password,
      privateKey
    );
    setPrivateKey(privateKey);
    const completeData = {
      email: formData.email,
      organization_name: data.organization_name,
      country: data.country,
      verification_code: formData.verification_code,
      encryptedPrivateKey,
      salt,
      nonce,
      publicKey,
    };
    signupMutation.mutate(completeData);
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Tell us about yourself";
      case 2:
        return "Check your email";
      case 3:
        return "Organization details";
      default:
        return "";
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 1:
        return "Let's get you set up with your personal information";
      case 2:
        return `We sent a verification code to ${formData.email}`;
      case 3:
        return "Almost done! Tell us about your organization";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-5xl flex flex-col lg:flex-row gap-0 overflow-hidden">
        <Card className="w-full lg:w-1/2 rounded-b-none lg:rounded-b-lg lg:rounded-r-none">
          <CardHeader className="border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex space-x-2">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`w-3 h-3 rounded-full ${
                      step <= currentStep ? "bg-primary" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">Step {currentStep} of 3</span>
            </div>
            <CardTitle className="text-2xl font-bold text-foreground mb-1">
              {getStepTitle()}
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              {getStepDescription()}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 min-h-[500px] flex flex-col justify-center">
            {currentStep === 1 && (
              <Form {...personalForm}>
                <form onSubmit={personalForm.handleSubmit(onPersonalSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={personalForm.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="First name"
                              className="bg-background border-input"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-destructive" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={personalForm.control}
                      name="last_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Last name"
                              className="bg-background border-input"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-destructive" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={personalForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your email address"
                            type="email"
                            className="bg-background border-input"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-destructive" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={personalForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <InputPassword
                            placeholder="Create a strong password"
                            className="bg-background border-input"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-destructive" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={personalForm.control}
                    name="confirm_password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm password</FormLabel>
                        <FormControl>
                          <InputPassword
                            placeholder="Confirm your password"
                            className="bg-background border-input"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-destructive" />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending code...
                      </>
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            )}

            {currentStep === 2 && (
              <Form {...verificationForm}>
                <form
                  onSubmit={verificationForm.handleSubmit(onVerificationSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={verificationForm.control}
                    name="verification_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Verification code</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter 6-digit code"
                            maxLength={6}
                            className="bg-background border-input text-center text-lg tracking-widest"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-destructive" />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        Verify
                        <Check className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            )}

            {currentStep === 3 && (
              <Form {...organizationForm}>
                <form
                  onSubmit={organizationForm.handleSubmit(onOrganizationSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={organizationForm.control}
                    name="organization_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your organization name"
                            className="bg-background border-input"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-destructive" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={organizationForm.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background border-input w-full">
                              <SelectValue placeholder="Select your country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <ScrollArea className="max-h-60">
                              {countries?.map((country) => (
                                <SelectItem key={country.value} value={country.value}>
                                  {country.label}
                                </SelectItem>
                              ))}
                            </ScrollArea>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-destructive" />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {currentStep === 3
                          ? "Creating account & signing in..."
                          : "Creating account..."}
                      </>
                    ) : (
                      "Start your free trial"
                    )}
                  </Button>
                </form>
              </Form>
            )}
            <div className="mt-6 text-center text-sm">
              Already have an account?{" "}
              <Link href="/auth/sign-in" className="underline underline-offset-4">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:hidden w-full rounded-t-none border-t-0">
          <CardContent className="p-6 bg-primary/5">
            <div className="text-center">
              <h4 className="font-semibold text-foreground mb-4">Why choose WhistleBase?</h4>
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="flex items-center justify-center space-x-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-foreground">All features, free for 14 days</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-foreground">Secure case management</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hidden lg:flex lg:w-1/2 rounded-l-none border-l-0">
          <CardContent className="p-8 bg-primary/5 flex flex-col justify-center">
            <div className="max-w-md mx-auto">
              <h3 className="text-2xl font-bold text-foreground mb-2">Try WhistleBase for free</h3>
              <p className="text-muted-foreground mb-8">
                Complete whistleblowing platform with no credit card required
              </p>

              <div className="space-y-6 mb-8">
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <p className="text-foreground font-medium">All features, free for 14 days</p>
                    <p className="text-muted-foreground text-sm">
                      Full access to case management, reporting tools, and analytics
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <p className="text-foreground font-medium">Secure case submission portal</p>
                    <p className="text-muted-foreground text-sm">
                      Anonymous reporting with end-to-end encryption
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <p className="text-foreground font-medium">24/7 admin dashboard</p>
                    <p className="text-muted-foreground text-sm">
                      Real-time notifications and comprehensive case tracking
                    </p>
                  </div>
                </div>
              </div>

              <Card className="bg-card rounded-lg border border-border">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">TB</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Taylor Brown</h4>
                      <p className="text-sm text-muted-foreground">Manager of People Operations</p>
                    </div>
                  </div>

                  <div className="flex space-x-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-4 h-4 text-yellow-400">
                        ⭐
                      </div>
                    ))}
                  </div>

                  <p className="text-foreground text-sm italic">
                    &ldquo;The entire process to set up was seamless, their customer service was
                    fantastic. The UX is great and it&rsquo;s very user-friendly.&rdquo;
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
