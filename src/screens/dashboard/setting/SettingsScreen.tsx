"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { organizationSettingsSchema, userSettingsSchema, passwordSettingsSchema } from "@/schemas/settings.schema";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

const SettingsScreen = () => {
  const { data, isLoading } = trpc.auth.getUserAndOrganization.useQuery();
  const utils = trpc.useUtils();

  const organizationForm = useForm<z.infer<typeof organizationSettingsSchema>>({
    resolver: zodResolver(organizationSettingsSchema),
    defaultValues: {
      name: "",
    },
  });

  const userForm = useForm<z.infer<typeof userSettingsSchema>>({
    resolver: zodResolver(userSettingsSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordSettingsSchema>>({
    resolver: zodResolver(passwordSettingsSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  const updateOrgMutation = trpc.auth.updateOrganization.useMutation({
    onSuccess: () => {
      toast.success("Organization settings updated successfully");
      utils.auth.getUserAndOrganization.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update organization settings");
    },
  });

  const updateUserMutation = trpc.auth.updateUserProfile.useMutation({
    onSuccess: () => {
      toast.success("User profile updated successfully");
      utils.auth.getUserAndOrganization.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update user profile");
    },
  });

  const updatePasswordMutation = trpc.auth.updatePassword.useMutation({
    onSuccess: () => {
      toast.success("Password updated successfully");
      passwordForm.reset({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update password");
    },
  });

  React.useEffect(() => {
    if (data) {
      organizationForm.reset({
        name: data.organization.name,
      });
      
      userForm.reset({
        first_name: data.user.first_name,
        last_name: data.user.last_name,
      });
    }
  }, [data, organizationForm, userForm]);

  const onSubmitOrganization = (values: z.infer<typeof organizationSettingsSchema>) => {
    updateOrgMutation.mutate(values);
  };

  const onSubmitUser = (values: z.infer<typeof userSettingsSchema>) => {
    updateUserMutation.mutate(values);
  };

  const onSubmitPassword = (values: z.infer<typeof passwordSettingsSchema>) => {
    updatePasswordMutation.mutate(values);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account and organization settings
        </p>
      </div>

      <Tabs defaultValue="organization" className="space-y-4">
        <TabsList>
          <TabsTrigger value="organization">Organization</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>

        <TabsContent value="organization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Organization Settings</CardTitle>
              <CardDescription>
                Update your organization details
              </CardDescription>
            </CardHeader>
            <Form {...organizationForm}>
              <form onSubmit={organizationForm.handleSubmit(onSubmitOrganization)}>
                <CardContent className="space-y-4">
                  <FormField
                    control={organizationForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter organization name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    disabled={updateOrgMutation.isPending || !organizationForm.formState.isDirty}
                  >
                    {updateOrgMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Changes
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <Form {...userForm}>
              <form onSubmit={userForm.handleSubmit(onSubmitUser)}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={userForm.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter first name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={userForm.control}
                      name="last_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter last name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {data?.user.email && (
                    <div className="pt-2">
                      <FormLabel>Email</FormLabel>
                      <Input value={data.user.email} disabled />
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    disabled={updateUserMutation.isPending || !userForm.formState.isDirty}
                  >
                    {updateUserMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Changes
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>

        <TabsContent value="password" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your account password
              </CardDescription>
            </CardHeader>
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)}>
                <CardContent className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="current_password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter current password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="new_password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter new password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="confirm_password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Confirm new password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    disabled={updatePasswordMutation.isPending || !passwordForm.formState.isDirty}
                  >
                    {updatePasswordMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Update Password
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsScreen;
