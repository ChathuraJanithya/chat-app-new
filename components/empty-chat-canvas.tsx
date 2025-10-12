"use client";

import type React from "react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MobileChatInput } from "@/components/mobile-chat-input";
import { useIsMobile } from "@/hooks/use-mobile";
import { MessageSquare, Lightbulb } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EmptyChatCanvasProps {
  onSendMessage: (message: string) => void;
}

export function EmptyChatCanvas({ onSendMessage }: EmptyChatCanvasProps) {
  const [inputValue, setInputValue] = useState("");
  const desktopInputRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();

  const suggestions = [
    {
      title: "Explain quantum computing",
      description: "Learn about quantum computing basics",
    },
    {
      title: "Write a Python function",
      description: "Help me code a specific function",
    },
    {
      title: "Plan a trip to Japan",
      description: "Get travel recommendations",
    },
    {
      title: "Explain machine learning",
      description: "Understand ML fundamentals",
    },
  ];

  const handleSendMessage = (content: string) => {
    if (!content.trim()) return;
    onSendMessage(content.trim());
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
      <div className="flex-1 overflow-auto p-4 md:px-8 pb-2 scroll-smooth">
        <div className="flex flex-col items-center justify-center h-full min-h-[50vh] text-center">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-primary/10 p-4">
              <MessageSquare className="h-12 w-12 text-primary" />
            </div>
          </div>

          <h2 className="text-2xl font-semibold mb-2">
            Start a New Conversation
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md">
            You don't have any chats yet. Send a message below to create your
            first chat and start the conversation.
          </p>

          <div className="grid hidden grid-cols-1 gap-3 sm:grid-cols-2 w-full max-w-2xl mb-8">
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto justify-start p-4 text-left bg-transparent hover:bg-accent/50"
                onClick={() => handleSendMessage(suggestion.title)}
              >
                <div className="flex items-start gap-3">
                  <Lightbulb className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{suggestion.title}</p>
                    <p className="text-muted-foreground text-sm">
                      {suggestion.description}
                    </p>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </div>

      <TooltipProvider>
        {isMobile ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <MobileChatInput
                  onSendMessage={handleSendMessage}
                  placeholder="Type your message to start a new chat..."
                  autoFocus={true}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Send a message to create your first chat</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          <div className="p-4 bg-background/80 backdrop-blur-sm">
            <div className="mx-auto max-w-3xl">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative rounded-lg shadow-sm border dark:border-gray-700 transition-colors duration-200">
                    <Textarea
                      ref={desktopInputRef}
                      placeholder="Type your message to start a new chat..."
                      className="min-h-12 resize-none pr-12 py-3 rounded-lg border-0 focus-visible:ring-1 bg-card transition-colors duration-200"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      rows={1}
                      autoFocus
                    />
                    <div className="absolute bottom-1 right-1 flex items-center gap-2">
                      <Button
                        size="icon"
                        className="h-9 w-9 rounded-full"
                        onClick={() => {
                          handleSendMessage(inputValue);
                          setInputValue("");
                        }}
                        disabled={!inputValue.trim()}
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
                </TooltipTrigger>
                <TooltipContent>
                  <p>Send a message to create your first chat</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        )}
      </TooltipProvider>
    </div>
  );
}
