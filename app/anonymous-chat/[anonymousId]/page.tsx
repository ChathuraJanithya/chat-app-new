"use client";

import { useEffect, useRef } from "react";

import { useSearchParams, useParams } from "next/navigation";

import { useAuth } from "@/context/auth-context";
import { useAnonymousChat } from "@/context/anonymous-chat-context";

import { AnonymousChatProvider } from "@/context/anonymous-chat-context";
import { AnonymousChatHeader } from "@/components/anonymous-chat-header";
import { AnonymousChatCanvas } from "@/components/anonymous-chat-canvas";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useSidebarContext } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSwipe } from "@/hooks/use-swipe";
import { AnonymousChatSidebar } from "@/components/anonymous-chat-sidebar";

import { useRouter } from "next/navigation";

function AnonymousChatPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { anonymousId } = useParams();
  const searchParams = useSearchParams();

  const isMobile = useIsMobile();
  const { isOpen, setIsOpen } = useSidebarContext();

  const qParam = searchParams.get("q");
  //check qParam new is true
  const isNew = searchParams.get("new") === "true";

  const {
    startAnonymousChat,
    anonymousChat,
    loadChatsFromLocalStorage,
    setAnonymousChat,
    setCurrentChat,
  } = useAnonymousChat();

  //load chats from local storage on mount
  useEffect(() => {
    const chats = loadChatsFromLocalStorage();
    if (chats) {
      setAnonymousChat(chats);
      //filter chat with anonymousId and set current chat
      const current = chats.find((chat) => chat.id === anonymousId);
      if (current) {
        setCurrentChat(current);
      }
    }
    if (!chats && anonymousId && !qParam) {
      router.push("/anonymous-chat");
    }
  }, []);

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
  }, [searchParams, user, anonymousId]);

  /*   useEffect(() => {
    if (qParam) {
      return;
    }
    if (isNew) {
      const url = new URL(window.location.href);
      url.searchParams.delete("new");
      window.history.replaceState({}, "", url.toString());
    }
  }, [anonymousId, qParam, isNew]); */

  // Add swipe gestures for mobile
  const { handlers } = useSwipe({
    onSwipeRight: () => {
      if (isMobile && !isOpen) {
        setIsOpen(true);
      }
    },
    onSwipeLeft: () => {
      if (isMobile && isOpen) {
        setIsOpen(false);
      }
    },
  });

  return (
    <div
      className="flex h-screen w-full overflow-hidden bg-gradient-to-b from-background to-background/95"
      {...handlers}
    >
      <AnonymousChatSidebar />
      <div className="flex flex-1 flex-col">
        <AnonymousChatHeader showMessageLimit />
        <AnonymousChatCanvas />
      </div>
    </div>
  );
}

export default function AnonymousChatPageWithProvider() {
  return (
    <SidebarProvider defaultIsOpen={false}>
      <AnonymousChatProvider>
        <AnonymousChatPage />
      </AnonymousChatProvider>
    </SidebarProvider>
  );
}
