"use client";

import { useEffect, useRef } from "react";

import { useRouter, useSearchParams, useParams } from "next/navigation";

import { useAuth } from "@/context/auth-context";
import { useAnonymousChat } from "@/context/anonymous-chat-context";

import { AnonymousChatProvider } from "@/context/anonymous-chat-context";
import { AnonymousChatHeader } from "@/components/anonymous-chat-header";
import { AnonymousChatCanvas } from "@/components/anonymous-chat-canvas";
import { SidebarProvider } from "@/components/ui/sidebar";

function AnonymousChatPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { anonymousId } = useParams();
  const searchParams = useSearchParams();

  const qParam = searchParams.get("q");

  const {
    setCurrentChat,
    setAnonymousChat,
    startAnonymousChat,
    loadChatsFromLocalStorage,
  } = useAnonymousChat();

  // Handle URL parameter on mount - only process once
  const processedRef = useRef(false);
  useEffect(() => {
    if (processedRef.current) return;
    if (qParam && !user) {
      processedRef.current = true; // ✅ lock

      startAnonymousChat(qParam, anonymousId as string)
        .then(() => console.log("Anonymous chat started with query parameter"))
        .catch((error) =>
          console.error("Error starting anonymous chat:", error)
        );

      // Clean up URL parameter
      const url = new URL(window.location.href);
      url.searchParams.delete("q");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams, user, startAnonymousChat]);

  // Load existing chat if anonymousId is present and no query param
  useEffect(() => {
    if (qParam) {
      console.log("Query param present, skipping load of existing chat");
      return;
    }
    if (!qParam && !user && anonymousId) {
      // Load existing chats from local storage
      const existingChats = loadChatsFromLocalStorage();
      const current = existingChats?.find((chat) => chat.id === anonymousId);
      console.log("Loading existing current chat:", current);
      if (!current) {
        router.replace("/anonymous-chat");
        return;
      }
      setAnonymousChat(existingChats || []);
      setCurrentChat(current);
    }
  }, [anonymousId, qParam, user]);

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
      <SidebarProvider defaultIsOpen={false}>
        <AnonymousChatPage />
      </SidebarProvider>
    </AnonymousChatProvider>
  );
}
