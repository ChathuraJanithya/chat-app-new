"use client";

import { useEffect } from "react";
import { isSupabaseConfigured } from "@/lib/supabase";

import { AnonymousChatProvider } from "@/context/anonymous-chat-context";
import { AnonymousChatHeader } from "@/components/anonymous-chat-header";
import { AnonymousChatCanvas } from "@/components/anonymous-chat-canvas";

function AnonymousChatPage() {
  useEffect(() => {
    if (!isSupabaseConfigured) {
      //console.log("Running anonymous chat without Supabase authentication");
    }
  }, []);

  return (
    <div className="flex h-screen w-full hide-scrollbar overflow-hidden bg-gradient-to-b from-background to-background/95 flex-col">
      <AnonymousChatHeader />
      <AnonymousChatCanvas />
    </div>
  );
}

export default function AnonymousChatPageWithProvider() {
  return (
    <AnonymousChatProvider>
      <AnonymousChatPage />
    </AnonymousChatProvider>
  );
}
