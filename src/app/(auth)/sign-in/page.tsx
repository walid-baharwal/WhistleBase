"use client";

import { Button } from '@/components/ui/button'
import { Form,FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { signInSchema } from '@/schemas/signIn.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const SignIn = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
  
    const form = useForm<z.infer<typeof signInSchema>>({
      resolver: zodResolver(signInSchema),
      defaultValues: {
        identifier: "",
        password: "",
      },
    });
  
    const submit = async (data: z.infer<typeof signInSchema>) => {
      setIsSubmitting(true);
      try {
          console.log("data::",data)
        const result = await signIn("credentials", {
          redirect: false,
          identifier: data.identifier,
          password: data.password,
        });
  
        console.log("results ",result);
        if (result?.error) {
    
            toast.error("Login Failed: ", {
                description: result.error,
            });
        }
  
        if (result?.url) {
          console.log("called")
          router.replace("/dashboard");
        } else {
          toast.error("Unexpected error occurred. Please try again.");
        }
  
      } catch (error: any) {
  
        toast.error("Sign In Failed: ", {
            description: error?.message || "An unexpected error occurred.",
        });
  
      } finally {
        setIsSubmitting(false);
      }
  
    };
  return (
    <>
      <div className="flex items-center justify-center min-h-screen ">
        <div className="p-8 max-w-xs md:max-w-lg w-full shadow-[0_20px_80px_-25px_rgba(255,200,255,0.15)] rounded-xl border   ">
          <div className="text-center">
            <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl mb-6">
            Welcome Back 
            </h1>
            <p className="mb-4">Sign in to your administration</p>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(submit)} className="space-y-6 mt-10">
              <FormField
                control={form.control}
                name="identifier"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Email" {...field} />
                    </FormControl>
                    <FormMessage className="text-red-700" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input type="password" placeholder="Password" {...field} />
                    </FormControl>
                    <FormMessage className="text-red-700" />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting} className='w-full'>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait{" "}
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </Form>
          <div className="text-center mt-5">
            <p>
              Don&apos;t have an account?{" "}
              <Link href="/sign-up" className="text-blue-700/80 hover:text-blue-900">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default SignIn
