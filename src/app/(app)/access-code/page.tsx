"use client";

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { accessCodeSchema } from '@/schemas/accessCode.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Shield } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const AccessCode = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof accessCodeSchema>>({
    resolver: zodResolver(accessCodeSchema),
    defaultValues: {
      accessCode: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof accessCodeSchema>) => {
    setIsSubmitting(true);
    try {
      // Here you would handle the access code verification
      console.log("Access code submitted:", data.accessCode);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // If successful, redirect to submit report page
      router.push('/submit-report');
      toast.success("Access code verified");
      
    } catch (error: unknown) {
      toast.error("Verification Failed", {
        description: (error as Error).message || "Could not verify access code",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      {/* Logo */}
      <div className="mb-20">
        {/* <Image 
          src="/WhistleBase logo.png" 
          alt="WhistleBase logo" 
          width={180} 
          height={40} 
          className="mx-auto"
        /> */}
      </div>

      <div className="w-full max-w-[40rem] -mt-20">
        <h1 className="text-3xl font-semibold mb-6 text-center" >Thank you for speaking up</h1>
        
        <div className="mt-4 mb-6 w-full ">
          <p className="text-gray-500 font-semibold text-[12px]">Access code</p>
          <div className="flex flex-col items-center justify-center" >

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-2 w-full flex flex-col items-center justify-center">
              <FormField
           
                control={form.control}
                name="accessCode"
                render={({ field }) => (
                  <FormItem    className="w-full">
                    <FormControl>
                      <Input 
                        placeholder="Enter access code" 
                        className=" w-full rounded-xl placeholder:text-gray-400 placeholder:text-sm" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-red-600" />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-24 cursor-pointer rounded-xl py-5"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" /> 
                ) : (
                  "Continue"
                )}
              </Button>
            </form>
          </Form>
          
          <div className="mt-4">
            <button 
              className="text-primary/70 hover:text-orange-600 text-sm font-medium cursor-pointer "
              onClick={() => toast.info("QR scanning feature coming soon")}
              >
              Scan QR Code
            </button>
                </div>
          </div>
        </div>

        {/* Security message */}
      </div>
        <div className="-mb-68 mt-68  max-w-md mx-auto">
          <div className="bg-green-50 rounded-md p-3 flex items-center gap-2 justify-center">
            <Shield className="h-5 w-5 text-green-500" />
            <p className="text-sm text-gray-700">
              All communication is anonymous and encrypted. 
              <Link href="/anonymity" className="text-green-500 ml-1 hover:underline">
                Learn more about anonymity
              </Link>
            </p>
          </div>
        </div>
    </div>
  );
};

export default AccessCode;
