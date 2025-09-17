"use client";
import type React from "react";
import { useState } from "react";

import clsx from "clsx";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

import { useChat } from "@/context/chat-context";
import { useAuth } from "@/context/auth-context";
import { useIsMobile } from "@/hooks/use-mobile";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebarContext,
} from "@/components/ui/sidebar";
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

import {
  ChevronDown,
  Plus,
  MessageSquare,
  Trash2,
  AlertCircle,
} from "lucide-react";

export function ChatSidebar() {
  const { chats, currentChat, createNewChat, deleteChat, loading } = useChat();
  const { user } = useAuth();
  const router = useRouter();
  const { setIsOpen, isOpen } = useSidebarContext();
  const isMobile = useIsMobile();
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelectChat = (chatId: string) => {
    router.push(`/chat/${chatId}`);

    // Close sidebar on mobile after selection
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const handleNewChat = async () => {
    if (isCreating) return;

    setIsCreating(true);
    setError(null);

    try {
      //  console.log("Starting new chat creation...");
      const newChat = await createNewChat();

      if (newChat) {
        // console.log("New chat created successfully:", newChat.id);
        router.push(`/chat/${newChat.id}`);

        // Close sidebar on mobile after creating new chat
        if (isMobile) {
          setIsOpen(false);
        }
      } else {
        console.error("Failed to create new chat - no chat returned");
        setError("Failed to create new chat. Please try again.");
      }
    } catch (err) {
      console.error("Error in handleNewChat:", err);
      setError(
        "Failed to create new chat. Please check your connection and try again."
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteClick = (
    chat: { id: string; title: string },
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    setChatToDelete(chat);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!chatToDelete || isDeleting) return;

    setIsDeleting(chatToDelete.id);
    setError(null);

    try {
      //console.log("Deleting chat:", chatToDelete.id);
      const result = await deleteChat(chatToDelete.id);

      // Handle navigation based on deletion result
      if (result === null) {
        // No other chats available, go to home
        // console.log("No other chats available, redirecting to home");
        router.push("/");
      } else if (typeof result === "string" && result !== "no-change") {
        // Switch to another chat
        //  console.log("Switching to chat:", result);
        router.push(`/chat/${result}`);
      }
      // If result is "no-change", stay on current page

      console.log("Chat deleted successfully");
    } catch (err) {
      console.error("Error deleting chat:", err);
      setError("Failed to delete chat. Please try again.");
    } finally {
      setIsDeleting(null);
      setDeleteDialogOpen(false);
      setChatToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setChatToDelete(null);
  };

  if (!user) {
    return (
      <Sidebar>
        <SidebarHeader className="p-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Please sign in to access your chats
            </p>
            <Button variant="outline" className="mt-2 bg-transparent" asChild>
              <a href="/login">Sign In</a>
            </Button>
          </div>
        </SidebarHeader>
      </Sidebar>
    );
  }

  return (
    <>
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
              disabled={isCreating}
            >
              <Plus className="h-4 w-4" />
              <span>{isCreating ? "Creating..." : "New chat"}</span>
            </Button>
          )}
        </SidebarHeader>
        <SidebarContent>
          <div className="px-2 py-2">
            <h3 className="px-2 text-sm font-medium text-muted-foreground">
              Recent chats
            </h3>
          </div>
          {loading ? (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-4 text-center">
              <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No chats yet</p>
              <p className="text-xs text-muted-foreground">
                Create your first chat to get started
              </p>
            </div>
          ) : (
            <SidebarMenu>
              {chats.map((chat) => (
                <SidebarMenuItem key={chat.id} className="relative group">
                  <SidebarMenuButton
                    asChild
                    isActive={currentChat?.id === chat.id}
                    onClick={() => handleSelectChat(chat.id)}
                  >
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
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-3 top-1/2 -translate-y-1/2 hover:bg-transparent h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) =>
                      handleDeleteClick({ id: chat.id, title: chat.title }, e)
                    }
                    disabled={isDeleting === chat.id}
                  >
                    {isDeleting === chat.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    <span className="sr-only">Delete chat</span>
                  </Button>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          )}
        </SidebarContent>
        <SidebarFooter className="p-4 hidden bg-sidebar-accent/50 backdrop-blur-sm transition-colors duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-purple-600 text-white">
                  {user.email?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-medium text-sm truncate max-w-[120px]">
                  {user.user_metadata?.full_name || user.email}
                </span>
                <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                  {user.email}
                </span>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chat</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{chatToDelete?.title}"? This
              action cannot be undone and all messages in this chat will be
              permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting !== null}
            >
              {isDeleting ? "Deleting..." : "Delete Chat"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
