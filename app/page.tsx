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

  // Check for anonymous chat parameter
  useEffect(() => {
    const qParam = searchParams.get("q");
    if (qParam && !user) {
      // Redirect to anonymous chat with the query parameter
      router.push(`/anonymous-chat?q=${encodeURIComponent(qParam)}`);
      return;
    }
  }, [searchParams, user, router]);

  // Handle routing after authentication and chats are loaded
  useEffect(() => {
    if (!authLoading && !chatsLoading && user) {
      if (chats.length === 0) {
        // No chats available, redirect to /chat
        router.push("/chat");
      } else if (!currentChat) {
        // Has chats but no current chat selected, redirect to the first chat
        router.push(`/chat/${chats[0].id}`);
      }
    }
  }, [chats, currentChat, router, user, authLoading, chatsLoading]);

  // Redirect to anonymous chat if not authenticated only having query parameter else to login
  useEffect(() => {
    if (!authLoading && !user) {
      const qParam = searchParams.get("q");
      if (qParam) {
        router.push(`/anonymous-chat?q=${encodeURIComponent(qParam)}`);
      } else {
        router.push("/login");
      }
    }
  }, [user, authLoading, router, searchParams]);

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
