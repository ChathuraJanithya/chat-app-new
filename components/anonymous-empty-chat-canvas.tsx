"use client";

import type React from "react";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { generateChatId } from "@/data/chat-data";

import { Chatsuggestions } from "@/data/chat-data";

import { AnimatePresence, motion } from "framer-motion";
export function EmptyAnonymousChatCanvas() {
  const router = useRouter();

  const handleSuggestionMessage = (suggestion: string) => {
    const tempId = generateChatId();
    router.replace(
      `/anonymous-chat/${tempId}?q=${encodeURIComponent(suggestion)}`
    );
  };

  return (
    <div className="flex flex-1 flex-col h-[calc(100vh-3.5rem)] relative">
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center justify-center h-full min-h-[50vh] text-center"
        >
          <h2 className="text-2xl font-semibold">Welcome to Anonymous Chat</h2>
          <p className="text-muted-foreground mt-2 mb-1">
            Try our AI assistant
          </p>

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 w-full max-w-2xl">
            {Chatsuggestions.map((suggestion, index) => (
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
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
