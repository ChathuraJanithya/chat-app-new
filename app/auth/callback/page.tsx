"use client";

import { useEffect } from "react";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

import { TypingAnimation } from "@/components/typing-animation";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth callback error:", error);
          router.push("/login?error=auth_callback_error");
          return;
        }

        if (data.session) {
          //("OAuth login successful:", data.session.user.email);
          router.push("/");
        } else {
          // console.log("No session found, redirecting to login");
          router.push("/login");
        }
      } catch (error) {
        // console.error("Unexpected error in auth callback:", error);
        router.push("/login?error=unexpected_error");
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <TypingAnimation />
    </div>
  );
}
