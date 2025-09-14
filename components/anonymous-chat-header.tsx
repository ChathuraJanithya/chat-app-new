"use client";

import Link from "next/link";
import Image from "next/image";
import { LogIn, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAnonymousChat } from "@/context/anonymous-chat-context";

export function AnonymousChatHeader() {
  const { anonymousChat, messageCount, maxMessages, hasReachedLimit } =
    useAnonymousChat();

  return (
    <header className="flex h-14 items-center justify-between border-b px-4">
      <div className="flex items-center gap-2">
        <Link
          href="https://visitsrilanka.ai/"
          className="flex items-center gap-2 font-semibold"
          target="_blank"
        >
          <Image
            src="/visitSriLanka.png"
            alt="Visit Sri Lanka"
            width={32}
            height={32}
          />
          <span>Visit Sri Lanka</span>
        </Link>
        {anonymousChat && (
          <div className="flex items-center gap-2">
            <span
              className={`text-sm px-2 py-1 rounded-full ${
                hasReachedLimit
                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  : messageCount >= maxMessages - 2
                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
              }`}
            >
              {messageCount}/{maxMessages} messages
            </span>
            {/*  {anonymousChat.messages.length > 0 && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Save className="h-3 w-3" />
                Saved locally
              </span>
            )} */}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button variant="outline" size="sm" asChild>
          <Link href="/login">
            <LogIn className="mr-2 h-4 w-4" />
            <span>Login to Save</span>
          </Link>
        </Button>
      </div>
    </header>
  );
}
