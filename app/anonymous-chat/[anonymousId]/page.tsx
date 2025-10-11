"use client";

import { AnonymousChatProvider } from "@/context/anonymous-chat-context";
import { AnonymousChatHeader } from "@/components/anonymous-chat-header";
import { AnonymousChatCanvas } from "@/components/anonymous-chat-canvas";

function AnonymousChatPage() {
  return (
    <div className="flex h-dvh w-full hide-scrollbar overflow-hidden bg-gradient-to-b from-background to-background/95 flex-col">
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
