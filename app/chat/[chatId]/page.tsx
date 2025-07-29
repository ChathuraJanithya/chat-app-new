"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ChatSidebar } from "@/components/chat-sidebar";
import { ChatHeader } from "@/components/chat-header";
import { ChatCanvas } from "@/components/chat-canvas";
import { SidebarProvider, useSidebarContext } from "@/components/ui/sidebar";
import { MobileOverlay } from "@/components/mobile-overlay";
import { useSwipe } from "@/hooks/use-swipe";
import { useIsMobile } from "@/hooks/use-mobile";
import { useChat } from "@/context/chat-context";
import { useAuth } from "@/context/auth-context";

function ChatPage() {
  const { chatId } = useParams();
  const {
    setCurrentChat,
    getChatById,
    chats,
    addMessageToChat,
    generateBotResponse,
    currentChat,
    createNewChat,
    loading: chatsLoading,
  } = useChat();
  const { user, loading } = useAuth();
  const router = useRouter();
  const { isOpen, setIsOpen } = useSidebarContext();
  const isMobile = useIsMobile();
  const [chatLoading, setChatLoading] = useState(true);
  const [chatNotFound, setChatNotFound] = useState(false);
  const [messageToSend, setMessageToSend] = useState<string | null>(null);
  const [messageSent, setMessageSent] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const loadChatAndSendMessage = async () => {
      if (!user || !chatId) return;

      setChatLoading(true);
      setChatNotFound(false);

      try {
        // First check if chat is already in our context
        let targetChat = chats.find((c) => c.id === chatId);

        if (targetChat) {
          console.log("Found chat in context:", targetChat.id);
          setCurrentChat(targetChat);
        } else {
          // If not in context, fetch from database

          const chat = await getChatById(chatId as string);

          if (chat) {
            setCurrentChat(chat);
            targetChat = chat;
          } else {
            setChatNotFound(true);

            // Handle chat not found professionally
            if (chats.length > 0) {
              // Redirect to the most recent chat
              // console.log("Redirecting to most recent chat:", chats[0].id)
              // router.replace(`/chat/${chats[0].id}`)
              return;
            } else {
              router.replace("/chat");
              return;
            }
          }
        }

        // Send message if we have one and haven't sent it yet
        if (messageToSend && targetChat && !messageSent) {
          setMessageSent(true);

          // Add user message first
          await addMessageToChat(targetChat.id, {
            content: messageToSend,
            role: "user",
          });
          // Then generate bot response
          await generateBotResponse(targetChat.id, messageToSend);
          setMessageToSend(null);
        }
      } catch (error) {
        console.error("Error loading chat:", error);
        setChatNotFound(true);

        // Handle error gracefully
        if (chats.length > 0) {
          router.replace(`/chat/${chats[0].id}`);
        } else {
          router.replace("/chat");
        }
      } finally {
        setChatLoading(false);
      }
    };

    loadChatAndSendMessage();
  }, [
    chatId,
    user,
    chats,
    setCurrentChat,
    getChatById,
    router,
    messageToSend,
    messageSent,
    addMessageToChat,
    generateBotResponse,
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

  if (loading || chatLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">
            {loading
              ? "Loading..."
              : chatNotFound
              ? "Chat not found, redirecting..."
              : "Loading chat..."}
          </p>
        </div>
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
      <MobileOverlay />
      <div className="flex flex-1 flex-col">
        <ChatHeader />
        <ChatCanvas />
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
