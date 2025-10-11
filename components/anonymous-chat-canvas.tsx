"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";

import { useRouter, useSearchParams, useParams } from "next/navigation";

import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/context/auth-context";
import { useAnonymousChat } from "@/context/anonymous-chat-context";

import { ChatMessageItem } from "@/components/chat-message";
import { ScrollToBottom } from "@/components/scroll-to-bottom";
import { TypingAnimation } from "@/components/typing-animation";
import { MobileChatInput } from "@/components/mobile-chat-input";
import { MessageLimitBanner } from "@/components/message-limit-banner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { generateChatId } from "@/data/chat-data";

export function AnonymousChatCanvas() {
  const searchParams = useSearchParams();
  const [inputValue, setInputValue] = useState("");
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const desktopInputRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();
  const router = useRouter();
  const { user } = useAuth();
  const [hasProcessedQuery, setHasProcessedQuery] = useState(false);

  // Get URL parameters
  const qParam = searchParams.get("q");
  const { anonymousId } = useParams();

  const {
    anonymousChat,
    isTyping,
    canSendMessage,
    messageCount,
    maxMessages,
    hasReachedLimit,
    startAnonymousChat,
    sendMessage,
    currentChat,
    loadChatsFromLocalStorage,
    setCurrentChat,
    setAnonymousChat,
  } = useAnonymousChat();

  // Handle URL parameter on mount - only process once
  const processedRef = useRef(false);
  useEffect(() => {
    if (processedRef.current) return;
    if (qParam && !user) {
      processedRef.current = true; // ✅ lock

      console.log("Processing query parameter:", qParam);

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

  // Scroll to bottom when messages change or when typing starts/stops
  /*   useEffect(() => {
    scrollToBottom();
  }, [anonymousChat?.messages, isTyping]); */

  // Load existing chat if anonymousId is present and no query param
  useEffect(() => {
    if (qParam) return; // Already handled in the other useEffect
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

  // Auto-focus input when bot finishes typing (only if can still send messages)
  useEffect(() => {
    if (!isTyping && canSendMessage && desktopInputRef.current && !isMobile) {
      setTimeout(() => {
        desktopInputRef.current?.focus();
      }, 100);
    }
  }, [isTyping, canSendMessage, isMobile]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  const suggestions = [
    {
      title: "Best places to visit in Sri Lanka?",
      description: "Explore top tourist destinations island-wide",
    },
    {
      title: "Tell me about Sri Lankan food",
      description: "Learn about traditional dishes and flavors",
    },
    {
      title: "How is the weather in Sri Lanka now?",
      description: "Get current climate info by region",
    },
    {
      title: "Is Sri Lanka safe for tourists?",
      description: "Understand safety tips and travel advice",
    },
    {
      title: "What are must-visit historical sites?",
      description: "Discover ancient cities and cultural heritage",
    },
    {
      title: "How do I get around Sri Lanka?",
      description: "Transport options: train, bus, tuk-tuk & more",
    },
  ];

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !canSendMessage) return;
    // Use the unified sendMessage function
    await sendMessage(content);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
      setInputValue("");
    }
  };

  const handleSuggestionMessage = (suggestion: string) => {
    const tempId = generateChatId();
    router.replace(
      `/anonymous-chat/${tempId}?q=${encodeURIComponent(suggestion)}`
    );
  };

  // Show welcome screen if no chat exists
  if (anonymousChat.length === 0) {
    return (
      <div className="flex flex-1 flex-col hide-scrollbar h-[calc(100vh-3.5rem)] relative">
        <div className="flex-1 overflow-auto hide-scrollbar p-4 md:px-8 pb-2 scroll-smooth">
          <div className="flex flex-col items-center justify-center h-full min-h-[50vh] text-center">
            <h2 className="text-2xl font-semibold">
              Welcome to Anonymous Chat
            </h2>
            <p className="text-muted-foreground mt-2 mb-1">
              Try our AI assistant
            </p>

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 w-full max-w-2xl">
              {suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto justify-start p-4 text-left bg-transparent"
                  onClick={() => handleSuggestionMessage(suggestion.title)}
                >
                  <div>
                    <p className="font-medium">{suggestion.title}</p>
                    <p className="text-muted-foreground text-sm">
                      {suggestion.description}
                    </p>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col  hide-scrollbar h-[calc(100vh-3.5rem)] relative">
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-auto hide-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [::-webkit-scrollbar]:hidden p-4 md:px-8 pb-2 scroll-smooth"
      >
        <MessageLimitBanner />

        <div className="mx-auto max-w-3xl space-y-4 mb-4">
          {currentChat?.messages.map((message, index) => (
            <ChatMessageItem
              key={index}
              message={message}
              isLastMessage={index === currentChat?.messages.length - 1}
            />
          ))}

          {isTyping && (
            <div className="flex w-full items-start gap-4 animate-in fade-in-0 slide-in-from-bottom-3 duration-300">
              <div className="flex max-w-[80%] flex-col gap-2 rounded-lg px-4 py-3 bg-muted rounded-tl-none">
                <TypingAnimation />
              </div>
            </div>
          )}
        </div>
      </div>

      <ScrollToBottom containerRef={messagesContainerRef} />

      {isMobile ? (
        <MobileChatInput
          onSendMessage={handleSendMessage}
          disabled={isTyping || !canSendMessage}
          placeholder={
            canSendMessage
              ? "Message..."
              : "Message limit reached - please log in"
          }
        />
      ) : (
        <div className="p-4 bg-background/80 backdrop-blur-sm">
          <div className="mx-auto max-w-3xl">
            <div className="relative rounded-lg shadow-sm border dark:border-gray-700 transition-colors duration-200">
              <Textarea
                ref={desktopInputRef}
                placeholder={
                  canSendMessage
                    ? "Message..."
                    : "Message limit reached - please log in"
                }
                className="min-h-12 resize-none pr-12 py-3 rounded-lg border-0 focus-visible:ring-1 bg-card transition-colors duration-200"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                disabled={isTyping || !canSendMessage}
              />
              <div className="absolute bottom-1 right-1 flex items-center gap-2">
                <Button
                  size="icon"
                  className="h-9 w-9 rounded-full"
                  onClick={() => {
                    handleSendMessage(inputValue);
                    setInputValue("");
                  }}
                  disabled={!inputValue.trim() || isTyping || !canSendMessage}
                >
                  <span className="sr-only">Send message</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="M22 2L11 13" />
                    <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                  </svg>
                </Button>
              </div>
            </div>
            {hasReachedLimit && (
              <div className="text-center mt-2">
                <p className="text-sm text-muted-foreground">
                  Message limit reached ({messageCount}/{maxMessages})
                  <Button
                    variant="link"
                    className="p-0 h-auto text-sm ml-1"
                    asChild
                  >
                    <a href="/login">Log in to continue</a>
                  </Button>
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
