"use client";

import { useEffect } from "react";

import { useSwipe } from "@/hooks/use-swipe";
import { useIsMobile } from "@/hooks/use-mobile";

import { useRouter, useSearchParams } from "next/navigation";

import { ChatHeader } from "@/components/chat-header";
import { ChatCanvas } from "@/components/chat-canvas";
import { ChatSidebar } from "@/components/chat-sidebar";
import { DatabaseSetup } from "@/components/database-setup";
import { SidebarProvider, useSidebarContext } from "@/components/ui/sidebar";

import { useChat } from "@/context/chat-context";
import { useAuth } from "@/context/auth-context";

import { DebugInfo } from "@/components/debug-info";
import { TypingAnimation } from "@/components/typing-animation";

function ChatApp() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const { isOpen, setIsOpen } = useSidebarContext();
  const { currentChat, chats, loading: chatsLoading } = useChat();
  const { user, loading: authLoading, databaseReady } = useAuth();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Don't do anything while authentication is loading
    if (authLoading) return;

    const qParam = searchParams.get("q");

    // Priority 1: Handle query parameter (anonymous chat)
    if (qParam && !user) {
      router.push(`/anonymous-chat?q=${encodeURIComponent(qParam)}`);
      return;
    }

    // Priority 2: Handle authenticated user routing
    if (user && !chatsLoading) {
      if (chats.length === 0) {
        router.push("/chat");
        return;
      } else if (!currentChat) {
        router.push(`/chat/${chats[0].id}`);
        return;
      }
    }

    // Priority 3: Redirect to login (only if no query param and not authenticated)
    if (!user && !qParam) {
      router.push("/login");
    }
  }, [
    authLoading,
    searchParams,
    user,
    chatsLoading,
    chats,
    currentChat,
    router,
  ]);

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

  if (authLoading || chatsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <TypingAnimation />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Show database setup if database is not ready
  if (!databaseReady) {
    return <DatabaseSetup />;
  }

  return (
    <div
      className="flex h-screen w-full overflow-hidden bg-gradient-to-b from-background to-background/95"
      {...handlers}
    >
      <ChatSidebar />
      {/*       <MobileOverlay /> */}
      <div className="flex flex-1 flex-col">
        <ChatHeader />
        <ChatCanvas />
      </div>
      <DebugInfo />
    </div>
  );
}

export default function Home() {
  return (
    <SidebarProvider defaultIsOpen={false}>
      <ChatApp />
    </SidebarProvider>
  );
}
