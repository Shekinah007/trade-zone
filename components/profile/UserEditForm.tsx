"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Loader2,
  User,
  Phone,
  Mail,
  Camera,
  ImagePlus,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
});

interface UserEditFormProps {
  initialData: {
    name: string;
    email: string;
    phone?: string;
    image?: string;
  };
}

export function UserEditForm({ initialData }: UserEditFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData.name || "",
      phone: initialData.phone || "",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setIsSuccess(false);

    try {
      const formData = new FormData();
      formData.append("name", values.name);
      if (values.phone) formData.append("phone", values.phone);
      if (imageFile) formData.append("image", imageFile);

      const res = await fetch("/api/user/profile", {
        method: "PUT",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to update profile");

      setIsSuccess(true);
      toast.success("Profile updated successfully!", {
        icon: <CheckCircle className="h-4 w-4 text-green-500" />,
        style: {
          background: "linear-gradient(135deg, #10b981, #059669)",
          color: "white",
          border: "none",
        },
      });

      setTimeout(() => setIsSuccess(false), 3000);
      router.refresh();
    } catch (error) {
      toast.error("Failed to update profile", {
        style: {
          background: "linear-gradient(135deg, #ef4444, #dc2626)",
          color: "white",
          border: "none",
        },
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-2 bg-gradient-to-r from-red-50 to-green-50 dark:from-red-950/30 dark:to-green-950/30 rounded-2xl mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-green-500 rounded-full blur-xl opacity-20" />
            <Avatar className="h-24 w-24 ring-4 ring-white dark:ring-gray-950 shadow-xl">
              <AvatarImage src={imagePreview || initialData.image || ""} />
              <AvatarFallback className="bg-gradient-to-br from-red-500 to-red-600 text-white text-2xl font-bold">
                {initialData.name?.charAt(0) ||
                  initialData.email?.charAt(0)?.toUpperCase() ||
                  "U"}
              </AvatarFallback>
            </Avatar>

            {/* Hidden gallery input */}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageChange}
            />

            {/* Hidden camera input */}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              ref={cameraInputRef}
              onChange={handleImageChange}
            />

            {/* Dropdown trigger on the camera button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="absolute bottom-0 right-0 p-1.5 rounded-full bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg hover:shadow-red-500/50 transition-all duration-200 hover:scale-110"
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem
                  onClick={() => cameraInputRef.current?.click()}
                  className="gap-2 cursor-pointer"
                >
                  <Camera className="h-4 w-4 text-red-500" />
                  Take Photo
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2 cursor-pointer"
                >
                  <ImagePlus className="h-4 w-4 text-green-500" />
                  Choose from Gallery
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <h2 className="text-2xl font-bold bg-gradient-to-r from-red-700 to-red-600 dark:from-red-400 dark:to-red-300 bg-clip-text text-transparent">
          Edit Profile
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Update your personal information
        </p>
      </div>

      {/* Form Card */}
      <div className="relative">
        {/* Decorative elements */}
        <div className="absolute -top-4 -left-4 w-20 h-20 bg-red-500/10 rounded-full" />
        <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-green-500/10 rounded-full" />

        <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          {/* Gradient top bar */}
          <div className="h-1.5 bg-gradient-to-r from-red-500 via-red-500 to-green-500" />

          {/* Email display - read only field */}
          <div className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50">
              <div className="p-2 rounded-lg bg-gradient-to-br from-red-100 to-red-50 dark:from-red-950/30 dark:to-red-900/20">
                <Mail className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Email Address
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {initialData.email}
                </p>
              </div>
              <div className="px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium">
                Verified
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="p-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        <User className="h-4 w-4 text-red-500" />
                        Full Name
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Input
                            placeholder="Enter your full name"
                            className="pl-10 h-11 rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-red-500 focus:ring-red-500 transition-all duration-200"
                            {...field}
                          />
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-red-500 transition-colors duration-200" />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs mt-1" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        <Phone className="h-4 w-4 text-green-500" />
                        Phone Number
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Input
                            placeholder="Enter your phone number"
                            className="pl-10 h-11 rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-green-500 focus:ring-green-500 transition-all duration-200"
                            {...field}
                          />
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-green-500 transition-colors duration-200" />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs mt-1" />
                    </FormItem>
                  )}
                />

                {/* Success Message */}
                {isSuccess && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800 animate-in slide-in-from-top-1 duration-200">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                      Profile updated successfully!
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex-1 h-11 rounded-xl border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 transition-all duration-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 h-11 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold shadow-md shadow-red-500/25 hover:shadow-red-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>

      {/* Help text */}
      <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-6">
        Your email address cannot be changed. Contact support if you need
        assistance. Changes will be reflected in your profile next time you
        login.
      </p>
    </div>
  );
}
