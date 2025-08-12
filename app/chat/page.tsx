"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChatSidebar } from "@/components/chat-sidebar";
import { ChatHeader } from "@/components/chat-header";
import { EmptyChatCanvas } from "@/components/empty-chat-canvas";
import { SidebarProvider, useSidebarContext } from "@/components/ui/sidebar";
import { MobileOverlay } from "@/components/mobile-overlay";
import { useSwipe } from "@/hooks/use-swipe";
import { useIsMobile } from "@/hooks/use-mobile";
import { useChat } from "@/context/chat-context";
import { useAuth } from "@/context/auth-context";
import { TypingAnimation } from "@/components/typing-animation";

function ChatPage() {
  const { isOpen, setIsOpen } = useSidebarContext();
  const isMobile = useIsMobile();
  const {
    chats,
    loading: chatsLoading,
    createNewChat,
    setCurrentChat,
    addMessageToChat,
    generateBotResponse,
  } = useChat();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Clear current chat when on /chat page
  useEffect(() => {
    setCurrentChat(null);
  }, [setCurrentChat]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/anonymous-chat");
    }
  }, [user, authLoading, router]);

  // If user has chats, redirect to the first one
  useEffect(() => {
    if (!chatsLoading && chats.length > 0) {
      router.push(`/chat/${chats[0].id}`);
    }
  }, [chats, chatsLoading, router]);

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

  // Handle creating new chat and sending message
  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    try {
      const newChat = await createNewChat();
      if (newChat) {
        // Redirect to the new chat and pass the message to send
        const messageContent = content.trim();
        // Add user message first
        await addMessageToChat(newChat.id, {
          content: messageContent,
          role: "user",
        });
        // Then generate bot response
        await generateBotResponse(newChat.id, messageContent);
        // Redirect to the new chat
        router.push(`/chat/${newChat.id}`);
      }
    } catch (error) {
      console.error("Error creating new chat:", error);
    }
  };

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

  return (
    <div
      className="flex h-screen w-full overflow-hidden bg-gradient-to-b from-background to-background/95"
      {...handlers}
    >
      <ChatSidebar />
      {/*  <MobileOverlay /> */}
      <div className="flex flex-1 flex-col">
        <ChatHeader />
        <EmptyChatCanvas onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}

export default function ChatPageWithSidebar() {
  return (
    <SidebarProvider defaultIsOpen={false}>
      <ChatPage />
    </SidebarProvider>
  );
}
