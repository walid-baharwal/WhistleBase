"use client";

import { useState, useEffect } from "react";
import LottieLoading from "@/components/LottieLoading";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Share2, Palette, Eye, Save, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { channelSchema, type ChannelData } from "@/schemas/channel.schema";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function FormCreatorScreen() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isClient, setIsClient] = useState(false);
  const [generatedIdentifiers, setGeneratedIdentifiers] = useState<{
    slug: string;
    access_code: string;
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  const editChannelId = searchParams.get("id");
  const isEditMode = !!editChannelId;

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { data: existingChannel, isLoading: isLoadingChannel } = trpc.channel.getById.useQuery(
    { id: editChannelId! },
    { enabled: isEditMode }
  );

  const form = useForm({
    resolver: zodResolver(channelSchema),
    defaultValues: {
      title: "Report an Issue",
      description:
        "Please provide details about the issue you'd like to report. Your submission will be handled confidentially.",
      submission_message:
        "Thank you for your report. We have received your submission and will investigate accordingly.",
      primary_color: "#3b82f6",
      access_code: "",
      slug: "",
      is_active: true,
    },
  });

  const generateIdentifiers = trpc.channel.generateUniqueIdentifiers.useQuery(undefined, {
    enabled: !generatedIdentifiers && !isEditMode,
  });

  useEffect(() => {
    if (existingChannel && isEditMode) {
      form.reset({
        title: existingChannel.title,
        description: existingChannel.description,
        submission_message: existingChannel.submission_message,
        primary_color: existingChannel.primary_color,
        access_code: existingChannel.access_code,
        slug: existingChannel.slug,
        is_active: existingChannel.is_active,
      });
      setIsGenerating(false);
    }
  }, [existingChannel, isEditMode, form]);

  useEffect(() => {
    if (generateIdentifiers.data && !generatedIdentifiers && !isEditMode) {
      setGeneratedIdentifiers(generateIdentifiers.data);
      setIsGenerating(false);

      form.setValue("slug", generateIdentifiers.data.slug);
      form.setValue("access_code", generateIdentifiers.data.access_code);
    }
  }, [generateIdentifiers.data, generatedIdentifiers, form, isEditMode]);

  useEffect(() => {
    if (generateIdentifiers.error) {
      toast.error("Failed to generate unique identifiers: " + generateIdentifiers.error.message);
      setIsGenerating(false);
    }
  }, [generateIdentifiers.error]);

  const createMutation = trpc.channel.create.useMutation({
    onSuccess: () => {
      toast.success("Channel created successfully!");
      router.push(`/dashboard/channels`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create channel");
    },
  });

  const updateMutation = trpc.channel.update.useMutation({
    onSuccess: () => {
      toast.success("Channel updated successfully!");
      router.push(`/dashboard/channels`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update channel");
    },
  });

  const watchedValues = form.watch();

  const onSubmit = (data: ChannelData) => {
    if (isEditMode && editChannelId) {
      updateMutation.mutate({
        id: editChannelId,
        data: data,
      });
    } else {
      if (generatedIdentifiers) {
        const submitData = {
          ...data,
          slug: generatedIdentifiers.slug,
          access_code: generatedIdentifiers.access_code,
        };
        createMutation.mutate(submitData);
      } else {
        toast.error("Please wait for identifiers to be generated");
      }
    }
  };

  const handleCopyLink = () => {
    if (isClient) {
      let slug;
      if (isEditMode && existingChannel) {
        slug = existingChannel.slug;
      } else if (generatedIdentifiers) {
        slug = generatedIdentifiers.slug;
      } else {
        return;
      }

      const link = `${window.location.origin}/report/${slug}`;
      navigator.clipboard.writeText(link);
      toast.success("Form link copied to clipboard!");
    }
  };

  const handleCopyAccessCode = () => {
    let accessCode;
    if (isEditMode && existingChannel) {
      accessCode = existingChannel.access_code;
    } else if (generatedIdentifiers) {
      accessCode = generatedIdentifiers.access_code;
    } else {
      return;
    }

    navigator.clipboard.writeText(accessCode);
    toast.success("Access code copied to clipboard!");
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {isEditMode && isLoadingChannel && (
        <LottieLoading size={64} message="Loading channel data..." variant="primary" />
      )}

      {(!isEditMode || !isLoadingChannel) && (
        <>
          <div className="flex items-center justify-between space-y-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                {isEditMode ? "Edit Channel" : "Create Channel"}
              </h2>
              <p className="text-muted-foreground">
                Set up your reporting channel with custom branding and sharing options
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => form.handleSubmit(onSubmit)()}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                <Save className="mr-2 h-4 w-4" />
                Save Draft
              </Button>
              <Button
                onClick={() => form.handleSubmit(onSubmit)()}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                <Share2 className="mr-2 h-4 w-4" />
                {isEditMode
                  ? updateMutation.isPending
                    ? "Updating..."
                    : "Update Channel"
                  : createMutation.isPending
                  ? "Creating..."
                  : "Publish Channel"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="content">Content</TabsTrigger>
                </TabsList>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <TabsContent value="overview" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Share2 className="h-5 w-5" />
                            Sharing Settings
                          </CardTitle>
                          <CardDescription>
                            Configure how users will access your form
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <FormField
                            control={form.control}
                            name="slug"
                            render={() => (
                              <FormItem>
                                <FormLabel>Form URL</FormLabel>
                                <FormControl>
                                  <div className="space-y-2">
                                    <div className="flex">
                                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                                        {isClient ? window.location.origin : "https://yoursite.com"}
                                        /report/
                                      </span>
                                      <Input
                                        placeholder="Generating..."
                                        className="rounded-l-none bg-muted"
                                        value={
                                          isEditMode && existingChannel
                                            ? existingChannel.slug
                                            : generatedIdentifiers?.slug || ""
                                        }
                                        readOnly
                                      />
                                      <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleCopyLink}
                                        disabled={!generatedIdentifiers?.slug}
                                        className="ml-2"
                                      >
                                        <Copy className="h-4 w-4" />
                                      </Button>
                                    </div>
                                    {/* Generation status */}
                                    <div className="flex items-center gap-2 text-xs">
                                      {isGenerating && (
                                        <span className="text-muted-foreground">
                                          Generating unique URL...
                                        </span>
                                      )}
                                      {generatedIdentifiers && !isEditMode && (
                                        <span className="text-green-600">
                                          ✓ Unique URL generated
                                        </span>
                                      )}

                                      {generateIdentifiers.error && !isEditMode && (
                                        <span className="text-red-600">
                                          ✗ Failed to generate URL
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </FormControl>
                                <FormDescription>
                                  {isEditMode
                                    ? "This is the unique URL for your channel."
                                    : "This unique URL will be automatically generated for your channel."}
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="access_code"
                            render={() => (
                              <FormItem>
                                <FormLabel>Access Code</FormLabel>
                                <FormControl>
                                  <div className="space-y-2">
                                    <div className="flex gap-2">
                                      <Input
                                        placeholder="Generating..."
                                        className="bg-muted"
                                        value={
                                          isEditMode && existingChannel
                                            ? existingChannel.access_code
                                            : generatedIdentifiers?.access_code || ""
                                        }
                                        readOnly
                                      />
                                      <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleCopyAccessCode}
                                        disabled={
                                          !(isEditMode && existingChannel?.access_code) &&
                                          !generatedIdentifiers?.access_code
                                        }
                                      >
                                        <Copy className="h-4 w-4" />
                                      </Button>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs">
                                      {isGenerating && !isEditMode && (
                                        <span className="text-muted-foreground">
                                          Generating access code...
                                        </span>
                                      )}
                                      {generatedIdentifiers && !isEditMode && (
                                        <span className="text-green-600">
                                          ✓ Unique access code generated
                                        </span>
                                      )}

                                      {generateIdentifiers.error && !isEditMode && (
                                        <span className="text-red-600">
                                          ✗ Failed to generate access code
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </FormControl>
                                <FormDescription>
                                  {isEditMode
                                    ? "This is the unique access code for your channel. Users need this code to access the channel."
                                    : "This unique 8-character code will be automatically generated. Users will need it to access the channel."}
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Palette className="h-5 w-5" />
                            Visual Customization
                          </CardTitle>
                          <CardDescription>
                            Customize the look and feel of your channel
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <FormField
                            control={form.control}
                            name="primary_color"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Primary Color</FormLabel>
                                <FormControl>
                                  <div className="flex gap-2">
                                    <Input
                                      type="color"
                                      className="w-12 h-10 p-1 rounded"
                                      {...field}
                                    />
                                    <Input placeholder="#3b82f6" className="flex-1" {...field} />
                                  </div>
                                </FormControl>
                                <FormDescription>
                                  This color will be used for buttons and highlights
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="logo"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Logo URL (Optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://example.com/logo.png" {...field} />
                                </FormControl>
                                <FormDescription>
                                  Add your organization&apos;s logo to the channel header
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="content" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Channel Content</CardTitle>
                          <CardDescription>
                            Configure the text content of your channel
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Channel Title</FormLabel>
                                <FormControl>
                                  <Input placeholder="Report an Issue" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Channel Description</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Please provide details about the issue..."
                                    className="min-h-[100px]"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />{" "}
                          <FormField
                            control={form.control}
                            name="submission_message"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Success Message</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Thank you for your report..."
                                    className="min-h-[80px]"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  This message will be shown after successful submission
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </form>
                </Form>
              </Tabs>
            </div>

            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Live Preview
                  </CardTitle>
                  <CardDescription>See how your channel will look to users</CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className="border rounded-lg p-6 space-y-4 min-h-[400px]"
                    style={
                      {
                        borderColor: watchedValues.primary_color,
                        "--primary-color": watchedValues.primary_color,
                      } as React.CSSProperties
                    }
                  >
                    {watchedValues.logo && (
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto bg-muted rounded flex items-center justify-center">
                          Logo
                        </div>
                      </div>
                    )}

                    <div className="text-center space-y-2">
                      <h3 className="text-xl font-semibold">{watchedValues.title}</h3>
                      <p className="text-sm text-muted-foreground">{watchedValues.description}</p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm">Category</Label>
                        <div className="w-full h-8 bg-muted rounded border"></div>
                      </div>
                      <div>
                        <Label className="text-sm">Description</Label>
                        <div className="w-full h-20 bg-muted rounded border"></div>
                      </div>
                      <Button
                        className="w-full"
                        style={{ backgroundColor: watchedValues.primary_color }}
                      >
                        Submit Report
                      </Button>
                    </div>

                    {generatedIdentifiers?.access_code && (
                      <div className="text-center pt-4 border-t">
                        <p className="text-xs text-muted-foreground">
                          Access Code: {generatedIdentifiers.access_code}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
