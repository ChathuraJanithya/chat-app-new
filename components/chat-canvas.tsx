"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChatMessageItem } from "@/components/chat-message";
import { TypingAnimation } from "@/components/typing-animation";
import { ScrollToBottom } from "@/components/scroll-to-bottom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useChat } from "@/context/chat-context";
import { useRouter } from "next/navigation";
import Image from "next/image";

export function ChatCanvas() {
  const [inputValue, setInputValue] = useState("");
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const desktopInputRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const prevTypingRef = useRef(false);
  const router = useRouter();

  const {
    currentChat,
    isTyping,
    addMessageToChat,
    generateBotResponse,
    createNewChat,
  } = useChat();

  // Scroll to bottom when messages change or when typing starts/stops
  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages, isTyping]);

  // Auto-focus input when bot finishes typing
  useEffect(() => {
    // Check if typing state changed from true to false (bot finished typing)
    if (prevTypingRef.current === true && isTyping === false) {
      // Small delay to ensure UI has updated
      setTimeout(() => {
        if (desktopInputRef.current && !isMobile) {
          desktopInputRef.current.focus();
        }
      }, 100);
    }

    // Update previous typing state
    prevTypingRef.current = isTyping;
  }, [isTyping, isMobile]);

  // Function to scroll to bottom
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
      title: "What are the advantages",
      description: "of using Next.js?",
    },
    {
      title: "Write code to",
      description: "demonstrate dijkstra's algorithm",
    },
    {
      title: "Help me write an essay",
      description: "about silicon valley",
    },
    {
      title: "What is the weather",
      description: "in San Francisco?",
    },
  ];

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !currentChat) {
      // If no current chat, create one and redirect
      if (!currentChat) {
        const newChat = createNewChat();
        //@ts-ignore
        router.push(`/chat/${newChat.id}`);
        return;
      }
      return;
    }

    // Don't allow sending if already typing
    if (isTyping) {
      return;
    }

    console.log("Sending message:", content);

    // Add user message immediately to the UI
    await addMessageToChat(currentChat.id, {
      content,
      role: "user",
    });

    // Force scroll to bottom after adding user message
    setTimeout(() => {
      scrollToBottom();
    }, 50);

    // Generate bot response after a small delay to ensure user message is rendered
    setTimeout(async () => {
      await generateBotResponse(currentChat.id, content);
    }, 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
      setInputValue("");
    }
  };

  return (
    <div className="flex flex-1 flex-col h-[calc(100vh-3.5rem)] relative">
      {currentChat?.messages.length === 0 && !isTyping && (
        <div className="flex flex-col items-center justify-center mb-16 px-4 md:px-0 h-full text-center">
          <Image
            src="/visitSriLanka.png"
            alt="Visit Sri Lanka"
            width={100}
            height={100}
          />
          <h2 className="text-2xl mt-3 font-semibold mb-2">
            Start a New Conversation
          </h2>
          <p className="text-muted-foreground mb-8  max-w-md">
            You don't have any chats yet. Send a message below to create your
            first chat and start the conversation.
          </p>
          <div className="mx-auto w-full max-w-3xl">
            <div className="relative rounded-3xl shadow-sm border dark:border-gray-700 transition-colors duration-200">
              <Textarea
                ref={desktopInputRef}
                placeholder="Message..."
                className="min-h-12 resize-none pr-12 py-3 rounded-3xl border-0 focus-visible:ring-1 bg-card transition-colors duration-200"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                disabled={isTyping}
              />
              <div className="absolute bottom-1.5 right-1 flex items-center gap-2">
                <Button
                  size="icon"
                  className="h-9 w-9 rounded-full"
                  onClick={() => {
                    handleSendMessage(inputValue);
                    setInputValue("");
                  }}
                  disabled={!inputValue.trim() || isTyping}
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
          </div>
        </div>
      )}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-auto p-4 md:px-8 pb-2 scroll-smooth"
      >
        <div className="mx-auto max-w-3xl space-y-4 mb-4">
          {currentChat?.messages.map((message) => (
            <ChatMessageItem key={message.id} message={message} />
          ))}

          {isTyping && (
            <div className="flex w-full items-start gap-4 animate-in fade-in-0 slide-in-from-bottom-3 duration-300">
              <div className="flex max-w-[80%] flex-col gap-2 rounded-2xl px-4 py-3 bg-muted rounded-tl-none">
                <TypingAnimation />
              </div>
            </div>
          )}
        </div>
      </div>

      <ScrollToBottom containerRef={messagesContainerRef} />

      {/*  {isMobile && (
        <MobileChatInput
          onSendMessage={handleSendMessage}
          disabled={isTyping}
          autoFocus={!isTyping}
        />
      )} */}

      {/* @ts-ignore */}
      {currentChat?.messages.length > 0 && !isTyping && (
        <div className="p-4 bg-background/80 backdrop-blur-sm">
          <div className="mx-auto max-w-3xl">
            <div className="relative rounded-3xl shadow-sm border dark:border-gray-700 transition-colors duration-200">
              <Textarea
                ref={desktopInputRef}
                placeholder="Message..."
                className="min-h-12 resize-none pr-12 py-3 rounded-3xl border-0 focus-visible:ring-1 bg-card transition-colors duration-200"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                disabled={isTyping}
              />
              <div className="absolute bottom-1.5 right-1 flex items-center gap-2">
                <Button
                  size="icon"
                  className="h-9 w-9 rounded-full"
                  onClick={() => {
                    handleSendMessage(inputValue);
                    setInputValue("");
                  }}
                  disabled={!inputValue.trim() || isTyping}
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
          </div>
        </div>
      )}
    </div>
  );
}
