"use client";
import type React from "react";
import { useState } from "react";

import clsx from "clsx";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

import { useIsMobile } from "@/hooks/use-mobile";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Sidebar,
  SidebarMenu,
  SidebarHeader,
  SidebarContent,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebarContext,
} from "@/components/ui/sidebar";

import { Plus, AlertCircle, MessageSquare } from "lucide-react";
import { useAnonymousChat } from "@/context/anonymous-chat-context";
import { Router } from "next/router";

export function AnonymousChatSidebar() {
  const {
    anonymousChat,
    currentChat,
    createNewAnonymousChat,
    chatLimitExceeded,
  } = useAnonymousChat();
  const router = useRouter();
  const { setIsOpen, isOpen } = useSidebarContext();
  const isMobile = useIsMobile();
  const [isCreating, setIsCreating] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const handleSelectChat = (chatId: string) => {
    router.replace(`/anonymous-chat/${chatId}`);
    // Close sidebar on mobile after selection
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const handleNewChat = async () => {
    setError(null);
    if (chatLimitExceeded) {
      setError("Chat limit exceeded. Please Login to create more chats.");
      return;
    }
    const newChat = createNewAnonymousChat();
    if (newChat) {
      router.push(`/anonymous-chat/${newChat.id}`);
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-2">
        {error && (
          <Alert variant="destructive" className="mb-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}
        {isOpen && (
          <Button
            variant="outline"
            className="w-full justify-start gap-2 shadow-sm bg-transparent"
            onClick={handleNewChat}
            disabled={chatLimitExceeded}
          >
            <Plus className="h-4 w-4" />
            <span>{isCreating ? "Creating..." : "New chat"}</span>
          </Button>
        )}
      </SidebarHeader>
      <SidebarContent>
        <div className="px-2 py-2">
          <h3 className="px-2 text-sm font-medium text-muted-foreground ">
            Recent chats
          </h3>
        </div>

        <SidebarMenu>
          {anonymousChat.map((chat) => (
            <SidebarMenuItem
              key={chat.id}
              className="relative group"
              onClick={() => handleSelectChat(chat.id)}
            >
              <SidebarMenuButton asChild isActive={currentChat?.id === chat.id}>
                <Button
                  variant="ghost"
                  className={clsx(
                    "w-full justify-start text-sm my-0.5 font-normal gap-2 h-auto  py-3",
                    currentChat?.id === chat.id
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  <MessageSquare className="h-4 w-4 shrink-0" />
                  <div className="flex flex-col items-start text-start overflow-hidden">
                    <span className="truncate w-full">{chat.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(chat.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </Button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
