"use client";

import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";

import { LogIn } from "lucide-react";
import { useAnonymousChat } from "@/context/anonymous-chat-context";
import { CONST_VARIABLES } from "@/data/chat-data";

interface AnonymousChatHeaderProps {
  showMessageLimit?: boolean;
}

export function AnonymousChatHeader({
  showMessageLimit = false,
}: AnonymousChatHeaderProps) {
  const { getCurrentMessageCount } = useAnonymousChat();

  const current = getCurrentMessageCount();
  const max = CONST_VARIABLES.MAX_MESSAGE_COUNT;
  const pct = Math.min(100, Math.round((current / max) * 100));

  return (
    <header className="flex h-14 items-center justify-between border-b px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
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
          <span className="hidden md:block">Visit Sri Lanka</span>
        </Link>
        {/* limit message length */}
        {showMessageLimit && (
          <div className="flex items-center gap-3 md:ml-3">
            <div className="w-40">
              <div className="relative h-2 rounded-full bg-muted/30">
                <div
                  className="absolute left-0 top-0 h-2 rounded-full bg-primary"
                  style={{ width: `${pct}%` }}
                  role="progressbar"
                  aria-valuenow={current}
                  aria-valuemin={0}
                  aria-valuemax={max}
                  aria-label="Message limit"
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Messages</span>
                <span
                  className={
                    current > max
                      ? "text-destructive font-medium"
                      : "font-medium"
                  }
                >
                  {current}/{max}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button variant="outline" size="sm" asChild>
          <Link href="/login">
            <LogIn className="mr-2 h-4 w-4" />
            <span>Login</span>
          </Link>
        </Button>
      </div>
    </header>
  );
}
