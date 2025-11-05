"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { registerUser } from "@/app/actions/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords don't match");
        setIsLoading(false);
        return;
      }

      const result = await registerUser(formData);

      if (result.success) {
        toast.success("Account created successfully! Please sign in.");
        router.push("/auth/login");
      } else {
        toast.error(result.error || "Something went wrong");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("google", {
        callbackUrl: "/dashboard",
      });
    } catch (error) {
      toast.error("Failed to sign in with Google");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-teal-50 via-white to-teal-50/30">
      {/* Back to Home Link - Fixed Header */}
      <div className="w-full p-4 sm:p-6">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-teal-700 hover:text-teal-800 transition-colors"
        >
          <Image src="/logo.png" alt="Duely Logo" width={24} height={24} className="h-5 w-5 sm:h-6 sm:w-6" />
          <span className="font-semibold text-sm sm:text-base">Duely</span>
        </Link>
      </div>

      {/* Card Container - Centered */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <Card className="w-full max-w-md shadow-xl border-teal-100">
        <CardHeader className="space-y-3 pb-6">
          {/* Logo */}
          <div className="flex justify-center mb-2">
            <div className="rounded-full bg-gradient-to-br from-teal-100 to-teal-50 p-3">
              <Image src="/logo.png" alt="Duely Logo" width={32} height={32} className="h-8 w-8" />
            </div>
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-bold text-center">
            Create an <span className="text-teal-600">Account</span>
          </CardTitle>
          <CardDescription className="text-center text-base">
            Enter your information to get started with Duely
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                disabled={isLoading}
                className="h-11 focus-visible:ring-teal-500"
              />
              <p className="text-xs text-muted-foreground">Use alphabets and numbers only</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="johndoe"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                disabled={isLoading}
                className="h-11 focus-visible:ring-teal-500"
              />
              <p className="text-xs text-muted-foreground">3-30 characters, letters, numbers, underscore, and hyphen only</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={isLoading}
                className="h-11 focus-visible:ring-teal-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={isLoading}
                minLength={6}
                className="h-11 focus-visible:ring-teal-500"
              />
              <p className="text-xs text-muted-foreground">At least 6 characters with letters and numbers</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                disabled={isLoading}
                minLength={6}
                className="h-11 focus-visible:ring-teal-500"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow hover:from-teal-600 hover:to-teal-700 hover:shadow-lg h-11 px-8"
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 disabled:pointer-events-none disabled:opacity-50 bg-white text-gray-700 border border-gray-300 shadow-sm hover:bg-gray-50 hover:shadow h-11 px-8"
            >
              <Mail className="h-4 w-4" />
              {isLoading ? "Signing in..." : "Sign up with Google"}
            </button>

            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-teal-600 hover:text-teal-700 font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
      </div>
    </div>
  );
}
