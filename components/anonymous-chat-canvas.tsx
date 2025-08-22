"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChatMessageItem } from "@/components/chat-message";
import { TypingAnimation } from "@/components/typing-animation";
import { MobileChatInput } from "@/components/mobile-chat-input";
import { ScrollToBottom } from "@/components/scroll-to-bottom";
import { MessageLimitBanner } from "@/components/message-limit-banner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAnonymousChat } from "@/context/anonymous-chat-context";
import { useAuth } from "@/context/auth-context";
import { useRouter, useSearchParams } from "next/navigation";

export function AnonymousChatCanvas() {
  const [inputValue, setInputValue] = useState("");
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const desktopInputRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [hasProcessedQuery, setHasProcessedQuery] = useState(false);

  const {
    anonymousChat,
    isTyping,
    canSendMessage,
    messageCount,
    maxMessages,
    hasReachedLimit,
    startAnonymousChat,
    sendMessage,
  } = useAnonymousChat();

  // Handle URL parameter on mount - only process once
  useEffect(() => {
    const qParam = searchParams.get("q");
    if (qParam && !anonymousChat && !user && !hasProcessedQuery) {
      console.log("Processing query parameter:", qParam);
      setHasProcessedQuery(true);

      // Use the startAnonymousChat function which handles the initial message properly
      startAnonymousChat(qParam)
        .then(() => {
          console.log("Anonymous chat started with query parameter");
        })
        .catch((error) => {
          console.error("Error starting anonymous chat:", error);
        });

      // Clean up URL parameter
      const url = new URL(window.location.href);
      url.searchParams.delete("q");
      window.history.replaceState({}, "", url.toString());
    }
  }, [
    searchParams,
    anonymousChat,
    user,
    startAnonymousChat,
    hasProcessedQuery,
  ]);

  // Redirect logged-in users to main chat (conversion will be handled by context)
  useEffect(() => {
    if (user) {
      // Small delay to allow conversion to complete
      setTimeout(() => {
        router.push("/");
      }, 1000);
    }
  }, [user, router]);

  // Scroll to bottom when messages change or when typing starts/stops
  useEffect(() => {
    scrollToBottom();
  }, [anonymousChat?.messages, isTyping]);

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

    console.log("handleSendMessage called with:", content);

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

  // Show welcome screen if no chat exists
  if (!anonymousChat) {
    return (
      <div className="flex flex-1 flex-col h-[calc(100vh-3.5rem)] relative">
        <div className="flex-1 overflow-auto p-4 md:px-8 pb-2 scroll-smooth">
          <div className="flex flex-col items-center justify-center h-full min-h-[50vh] text-center">
            <h2 className="text-2xl font-semibold">
              Welcome to Anonymous Chat
            </h2>
            <p className="text-muted-foreground mt-2 mb-1">
              Try our AI assistant with up to {maxMessages} messages
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              No login required • Chat saved locally •
              <Button variant="link" className="p-0 h-auto text-sm" asChild>
                <a href="/login"> Sign in to save permanently</a>
              </Button>
            </p>

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 w-full max-w-2xl">
              {suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto justify-start p-4 text-left bg-transparent"
                  onClick={() => handleSendMessage(suggestion.title)}
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
    <div className="flex flex-1 flex-col h-[calc(100vh-3.5rem)] relative">
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-auto p-4 md:px-8 pb-2 scroll-smooth"
      >
        <MessageLimitBanner />

        <div className="mx-auto max-w-3xl space-y-4 mb-4">
          {anonymousChat.messages.map((message) => (
            <ChatMessageItem key={message.id} message={message} />
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
