"use client";

import { useEffect } from "react";
import {
  AnonymousChatProvider,
  useAnonymousChat,
} from "@/context/anonymous-chat-context";
import { AnonymousChatHeader } from "@/components/anonymous-chat-header";
import { AnonymousChatCanvas } from "@/components/anonymous-chat-canvas";
import { useAuth } from "@/context/auth-context";
import { useRouter, useSearchParams } from "next/navigation";

import { generateChatId } from "@/data/chat-data";

function AnonymousChatPage() {
  return (
    <div className="flex h-dvh w-full hide-scrollbar overflow-hidden bg-gradient-to-b from-background to-background/95 flex-col">
      <AnonymousChatHeader />
      <AnonymousChatCanvas />
    </div>
  );
}

export default function AnonymousChatPageWithProvider() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { loadChatsFromLocalStorage, isUserCanSendMessage } =
    useAnonymousChat();

  useEffect(() => {
    if (!user) {
      const existingChats = loadChatsFromLocalStorage();
      const qParam = searchParams.get("q");
      const validated = isUserCanSendMessage(existingChats || []);
      if (!validated) {
        alert(
          "You have reached the maximum number of anonymous chats allowed. Please log in to continue."
        );
        router.replace(`/login`);
        return;
      }
      if (qParam && validated) {
        const tempId = generateChatId();
        router.replace(
          `/anonymous-chat/${tempId}?q=${encodeURIComponent(qParam)}`
        );
      }
    }
  }, [user]);
  return (
    <AnonymousChatProvider>
      <AnonymousChatPage />
    </AnonymousChatProvider>
  );
}
