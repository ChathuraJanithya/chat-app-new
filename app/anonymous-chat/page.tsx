"use client";

import { useEffect } from "react";
import {
  AnonymousChatProvider,
  useAnonymousChat,
} from "@/context/anonymous-chat-context";
import { useAuth } from "@/context/auth-context";
import { SidebarProvider, useSidebarContext } from "@/components/ui/sidebar";

import { useSwipe } from "@/hooks/use-swipe";
import { useIsMobile } from "@/hooks/use-mobile";

import { useRouter, useSearchParams } from "next/navigation";
import { AnonymousChatHeader } from "@/components/anonymous-chat-header";
import { AnonymousChatSidebar } from "@/components/anonymous-chat-sidebar";
import { EmptyAnonymousChatCanvas } from "@/components/anonymous-empty-chat-canvas";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { generateChatId } from "@/data/chat-data";

function AnonymousChatPage() {
  const { user } = useAuth();
  const router = useRouter();
  const isMobile = useIsMobile();
  const { isOpen, setIsOpen } = useSidebarContext();

  const searchParams = useSearchParams();

  const {
    isUserCanCreateNewChat,
    loadChatsFromLocalStorage,
    limitAlertDialog,
    setLimitAlertDialog,
    setAnonymousChat,
  } = useAnonymousChat();

  useEffect(() => {
    if (!user) {
      const existingChats = loadChatsFromLocalStorage();
      if (existingChats) {
        setAnonymousChat(existingChats);
      }
      const qParam = searchParams.get("q");
      const validated = isUserCanCreateNewChat(existingChats || []);
      if (!validated) {
        setLimitAlertDialog(true);
        return;
      }
      if (qParam && validated) {
        const tempId = generateChatId();
        router.replace(
          `/anonymous-chat/${tempId}?q=${encodeURIComponent(qParam)}`
        );
      }
    }
  }, [user]);
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

  return (
    <div
      className="flex h-screen w-full overflow-hidden bg-gradient-to-b from-background to-background/95"
      {...handlers}
    >
      <AnonymousChatSidebar />
      <div className="flex flex-1 flex-col">
        <AnonymousChatHeader />
        <EmptyAnonymousChatCanvas />
      </div>

      <AlertDialog open={limitAlertDialog} onOpenChange={setLimitAlertDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Alert</AlertDialogTitle>
            <AlertDialogDescription>
              You have reached the maximum number of anonymous chats allowed.
              Please login to continue using the anonymous chat feature.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push("/login")}>
              Login
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function AnonymousChatPageWithProvider() {
  return (
    <SidebarProvider defaultIsOpen={false}>
      <AnonymousChatProvider>
        <AnonymousChatPage />
      </AnonymousChatProvider>
    </SidebarProvider>
  );
}
