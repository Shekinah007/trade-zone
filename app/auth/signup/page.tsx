"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Loader2,
  Eye,
  EyeOff,
  ShieldCheck,
  Zap,
  Globe,
  ArrowRight,
  Mail,
  Lock,
  User,
  Check,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { signIn } from "next-auth/react";

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

const formSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

function PasswordInput({
  field,
  placeholder,
  show,
  setShow,
}: {
  field: any;
  placeholder: string;
  show: boolean;
  setShow: (show: boolean) => void;
}) {
  return (
    <div className="relative">
      <Input
        type={show ? "text" : "password"}
        placeholder={placeholder}
        className="pr-12 pl-12 bg-zinc-900/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-red-500/50 transition-colors h-12 rounded-xl"
        {...field}
        onChange={(e) => {
          field.onChange(e);
        }}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-4 top-3.5 text-zinc-400 hover:text-red-400 transition-colors"
      >
        {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </div>
  );
}

export default function SignUpPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<
    "google" | "facebook" | null
  >(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
    mode: "onChange", // Enable real-time validation
  });

  const password = form.watch("password");
  const confirmPassword = form.watch("confirmPassword");

  const strength = [
    { label: "6+ characters", met: password.length >= 6 },
    { label: "Uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Number", met: /[0-9]/.test(password) },
  ];

  const strengthScore = strength.filter((s) => s.met).length;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong");
      toast.success("Account created! Please sign in.");
      router.push("/auth/signin");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  const handleOAuth = async (provider: "google" | "facebook") => {
    setOauthLoading(provider);
    await signIn(provider, { callbackUrl: "/" });
    setOauthLoading(null);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-zinc-950 flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-red-950 via-zinc-950 to-emerald-950">
        {/* Ambient glows */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-600/20 rounded-full blur-[120px] animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-red-500/5 to-emerald-500/5 rounded-full blur-[100px]" />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSI+PHBhdGggZD0iTS41IDQwVjBtNDAgNDBWMCIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

        <div className="relative z-10 flex flex-col justify-between w-full p-12 xl:p-16">
          {/* Logo */}
          <Link
            href="/"
            className="text-3xl font-black tracking-tight bg-gradient-to-r from-red-400 via-white to-emerald-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
          >
            FindMaster
          </Link>

          {/* Hero Content */}
          <div className="space-y-8 max-w-md">
            <div>
              <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
                Start your
                <span className="bg-gradient-to-r from-red-400 to-emerald-400 bg-clip-text text-transparent">
                  {" "}
                  safe trading{" "}
                </span>
                journey
              </h2>
              <p className="text-lg text-zinc-400 leading-relaxed">
                Join thousands of verified buyers and sellers in your community.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-5">
              {[
                {
                  icon: Zap,
                  title: "Lightning Fast Listings",
                  desc: "Post items in seconds and reach buyers instantly.",
                  color: "red",
                },
                {
                  icon: ShieldCheck,
                  title: "Verified & Secure",
                  desc: "Every transaction protected with our approval system.",
                  color: "white",
                },
                {
                  icon: Globe,
                  title: "Local Community",
                  desc: "Connect with trusted buyers and sellers near you.",
                  color: "emerald",
                },
              ].map(({ icon: Icon, title, desc, color }) => (
                <div key={title} className="flex items-start gap-4 group">
                  <div
                    className={`p-3 rounded-xl shrink-0 transition-all duration-300 group-hover:scale-110 ${
                      color === "red"
                        ? "bg-red-500/10 border border-red-500/20"
                        : color === "emerald"
                          ? "bg-emerald-500/10 border border-emerald-500/20"
                          : "bg-white/5 border border-white/10"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        color === "red"
                          ? "text-red-400"
                          : color === "emerald"
                            ? "text-emerald-400"
                            : "text-white"
                      }`}
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{title}</p>
                    <p className="text-sm text-zinc-500 mt-1">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6">
            {[
              { value: "50K+", label: "Registered Items" },
              { value: "10K+", label: "Verified Users" },
              { value: "99.9%", label: "Safe Trades" },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="text-2xl font-bold bg-gradient-to-r from-red-400 to-emerald-400 bg-clip-text text-transparent">
                  {value}
                </div>
                <div className="text-xs text-zinc-500 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-zinc-950">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center">
            <Link
              href="/"
              className="text-3xl font-black tracking-tight bg-gradient-to-r from-red-400 via-white to-emerald-400 bg-clip-text text-transparent"
            >
              FindMaster
            </Link>
          </div>

          {/* Header */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-red-500/10 to-emerald-500/10 border border-red-500/20 text-xs font-medium text-red-400 mb-4">
              <Sparkles className="h-3 w-3" />
              Start trading safely
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Create your account
            </h1>
            <p className="text-zinc-400">
              Already have an account?{" "}
              <Link
                href="/auth/signin"
                className="text-red-400 hover:text-red-300 font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Google Button */}
          <Button
            variant="outline"
            onClick={() => handleOAuth("google")}
            disabled={!!oauthLoading}
            className="w-full h-12 rounded-xl bg-zinc-900 border-zinc-700 text-white hover:bg-zinc-800 hover:border-red-500/30 transition-all duration-300"
          >
            {oauthLoading === "google" ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
            <span className="text-sm text-zinc-500">or</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Full Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-4 top-3.5 h-5 w-5 text-zinc-500" />
                        <Input
                          placeholder="John Doe"
                          className="pl-12 bg-zinc-900/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-red-500/50 transition-colors h-12 rounded-xl"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-4 top-3.5 h-5 w-5 text-zinc-500" />
                        <Input
                          placeholder="name@example.com"
                          className="pl-12 bg-zinc-900/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-red-500/50 transition-colors h-12 rounded-xl"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-4 top-3.5 h-5 w-5 text-zinc-500" />
                        <PasswordInput
                          field={field}
                          placeholder="••••••••"
                          show={showPassword}
                          setShow={setShowPassword}
                        />
                      </div>
                    </FormControl>
                    {password.length > 0 && (
                      <div className="space-y-2 mt-3">
                        <div className="flex gap-2">
                          {[1, 2, 3].map((level) => (
                            <div
                              key={level}
                              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                                strengthScore >= level
                                  ? level === 1
                                    ? "bg-red-500"
                                    : level === 2
                                      ? "bg-orange-500"
                                      : "bg-emerald-500"
                                  : "bg-zinc-800"
                              }`}
                            />
                          ))}
                        </div>
                        <div className="flex gap-4 flex-wrap">
                          {strength.map(({ label, met }) => (
                            <span
                              key={label}
                              className={`text-xs flex items-center gap-1.5 ${
                                met ? "text-emerald-400" : "text-zinc-500"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  met ? "bg-emerald-400" : "bg-zinc-600"
                                }`}
                              />
                              {label}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">
                      Confirm Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-4 top-3.5 h-5 w-5 text-zinc-500" />
                        <PasswordInput
                          field={field}
                          placeholder="••••••••"
                          show={showConfirmPassword}
                          setShow={setShowConfirmPassword}
                        />
                      </div>
                    </FormControl>
                    {confirmPassword.length > 0 &&
                      password === confirmPassword && (
                        <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                          <Check className="h-3 w-3" />
                          Passwords match
                        </p>
                      )}
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-12 rounded-xl bg-gradient-to-r from-red-500 via-rose-500 to-red-600 hover:from-red-600 hover:via-rose-600 hover:to-red-700 text-white font-semibold shadow-lg shadow-red-500/20 hover:shadow-red-500/30 transition-all duration-300 border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || !form.formState.isValid}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Check className="mr-2 h-5 w-5" />
                )}
                {isLoading ? "Creating account..." : "Create Account"}
                {!isLoading && <ArrowRight className="ml-2 h-5 w-5" />}
              </Button>
            </form>
          </Form>

          {/* Terms */}
          <p className="text-xs text-center text-zinc-500">
            By signing up, you agree to our{" "}
            <Link
              href="/terms"
              className="text-red-400 hover:text-red-300 underline underline-offset-2 transition-colors"
            >
              Terms
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="text-red-400 hover:text-red-300 underline underline-offset-2 transition-colors"
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
