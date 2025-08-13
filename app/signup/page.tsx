"use client";

import type React from "react";

import { useState, useEffect } from "react";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { Eye, EyeOff, CheckCircle } from "lucide-react";

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);
  const router = useRouter();
  const { signUp, signInWithGoogle, signInWithFacebook, user, loading } =
    useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push("/");
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess(false);
    setNeedsEmailConfirmation(false);

    try {
      const fullName = `${firstName} ${lastName}`.trim();
      //  console.log("Attempting signup with:", { email, fullName });

      const { error, data } = await signUp(email, password, fullName);

      if (error) {
        console.error("Signup error:", error);
        setError(error.message);
        setIsLoading(false);
        return;
      }

      // console.log("Signup response:", data);

      if (data?.user && !data?.session) {
        // console.log("Email confirmation required");
        setNeedsEmailConfirmation(true);
        setSuccess(true);
      } else if (data?.user && data?.session) {
        console.log("User signed up and logged in immediately");
        setSuccess(true);
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else {
        setSuccess(true);
      }

      setIsLoading(false);
    } catch (err) {
      console.error("Unexpected error during signup:", err);
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setSocialLoading("google");
    setError("");

    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setError("Failed to sign up with Google. Please try again.");
        setSocialLoading(null);
      }
    } catch (err) {
      console.error("Unexpected error during Google signup:", err);
      setError("An unexpected error occurred. Please try again.");
      setSocialLoading(null);
    }
  };

  const handleFacebookSignUp = async () => {
    setSocialLoading("facebook");
    setError("");

    try {
      const { error } = await signInWithFacebook();
      if (error) {
        setError("Failed to sign up with Facebook. Please try again.");
        setSocialLoading(null);
      }
    } catch (err) {
      console.error("Unexpected error during Facebook signup:", err);
      setError("An unexpected error occurred. Please try again.");
      setSocialLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-background/95">
      <header className="flex h-14 items-center justify-between border-b px-4 lg:px-6">
        <Link
          href="https://visitsrilanka.ai/"
          className="flex items-center gap-2 font-semibold"
          target="_blank"
        >
          <Image
            src="/visitSriLanka.png"
            alt="Visit Sri Lanka"
            width={32}
            height={32}
          />
          <span>Visit Sri Lanka</span>
        </Link>
        <ThemeToggle />
      </header>
      <main className="flex flex-1 items-center justify-center p-4 md:p-8">
        <div className="mx-auto w-full max-w-md space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Create an account</h1>
            <p className="text-muted-foreground">
              Get started with your AI chat assistant
            </p>
          </div>
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  {needsEmailConfirmation ? (
                    <>
                      Account created successfully! Please check your email and
                      click the confirmation link to verify your account before
                      signing in.
                    </>
                  ) : (
                    <>
                      Account created successfully! Redirecting to your
                      dashboard...
                    </>
                  )}
                </AlertDescription>
              </Alert>
            )}
            {!success && (
              <>
                {/* Social Signup Buttons */}
                <div className="grid grid-cols-1 gap-4">
                  <Button
                    variant="outline"
                    onClick={handleGoogleSignUp}
                    disabled={socialLoading !== null || isLoading}
                    className="w-full"
                  >
                    {socialLoading === "google" ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                    ) : (
                      <Image
                        src="/googleIcon.png"
                        alt="Google"
                        width={16}
                        height={16}
                      />
                    )}
                    <span className="ml-2">Google</span>
                  </Button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with email
                    </span>
                  </div>
                </div>

                {/* Email/Password Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first-name">First name</Label>
                      <Input
                        id="first-name"
                        placeholder="John"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        disabled={isLoading || socialLoading !== null}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last-name">Last name</Label>
                      <Input
                        id="last-name"
                        placeholder="Doe"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        disabled={isLoading || socialLoading !== null}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      placeholder="name@example.com"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading || socialLoading !== null}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        disabled={isLoading || socialLoading !== null}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading || socialLoading !== null}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="sr-only">
                          {showPassword ? "Hide password" : "Show password"}
                        </span>
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Password must be at least 6 characters long
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      required
                      disabled={isLoading || socialLoading !== null}
                    />
                    <label
                      htmlFor="terms"
                      className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I agree to the{" "}
                      <Link
                        href="/terms"
                        className="text-primary underline-offset-4 hover:underline"
                      >
                        terms of service
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="/privacy"
                        className="text-primary underline-offset-4 hover:underline"
                      >
                        privacy policy
                      </Link>
                    </label>
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || socialLoading !== null}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                        Creating account...
                      </>
                    ) : (
                      "Create account"
                    )}
                  </Button>
                </form>
              </>
            )}
            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
