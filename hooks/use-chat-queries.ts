"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/context/auth-context";
import type { ChatSession, ChatMessage } from "@/types/chat";
import { ChatService } from "@/lib/chat-service";

// Query keys
export const chatKeys = {
  all: ["chats"] as const,
  lists: () => [...chatKeys.all, "list"] as const,
  list: (userId: string) => [...chatKeys.lists(), userId] as const,
  details: () => [...chatKeys.all, "detail"] as const,
  detail: (id: string) => [...chatKeys.details(), id] as const,
};

// Fetch all chats for a user
async function fetchChats(userId: string): Promise<ChatSession[]> {
  if (!userId || !isSupabaseConfigured) {
    return [];
  }

  console.log("Fetching chats for user:", userId);

  // First, fetch all chats for the user
  const { data: chatsData, error: chatsError } = await supabase
    .from("chats")
    .select("id, title, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (chatsError) {
    console.error("Error fetching chats:", chatsError);
    throw chatsError;
  }

  if (!chatsData || chatsData.length === 0) {
    return [];
  }

  // Then, fetch messages for each chat
  const chatsWithMessages: ChatSession[] = [];

  for (const chat of chatsData) {
    const { data: messagesData, error: messagesError } = await supabase
      .from("messages")
      .select("id, content, role, created_at")
      .eq("chat_id", chat.id)
      .order("created_at", { ascending: true });

    if (messagesError) {
      console.error("Error fetching messages for chat", chat.id, messagesError);
      continue;
    }

    const formattedChat: ChatSession = {
      id: chat.id,
      title: chat.title,
      createdAt: new Date(chat.created_at),
      messages: (messagesData || []).map((msg) => ({
        id: msg.id,
        content: msg.content,
        role: msg.role as "user" | "assistant",
        timestamp: new Date(msg.created_at),
      })),
    };

    chatsWithMessages.push(formattedChat);
  }

  return chatsWithMessages;
}

// Fetch a single chat by ID
async function fetchChatById(
  chatId: string,
  userId: string
): Promise<ChatSession | null> {
  if (!chatId || !userId || !isSupabaseConfigured) {
    return null;
  }

  console.log("Fetching chat by ID:", chatId);

  // First, fetch the chat
  const { data: chatData, error: chatError } = await supabase
    .from("chats")
    .select("id, title, created_at")
    .eq("id", chatId)
    .eq("user_id", userId)
    .maybeSingle();

  if (chatError) {
    console.error("Error fetching chat:", chatError);
    throw chatError;
  }

  if (!chatData) {
    return null;
  }

  // Then, fetch messages for the chat
  const { data: messagesData, error: messagesError } = await supabase
    .from("messages")
    .select("id, content, role, created_at")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });

  if (messagesError) {
    console.error("Error fetching messages:", messagesError);
    throw messagesError;
  }

  const chat: ChatSession = {
    id: chatData.id,
    title: chatData.title,
    createdAt: new Date(chatData.created_at),
    messages: (messagesData || []).map((msg) => ({
      id: msg.id,
      content: msg.content,
      role: msg.role as "user" | "assistant",
      timestamp: new Date(msg.created_at),
    })),
  };

  return chat;
}

// Hook to get all chats
export function useChats() {
  const { user, databaseReady } = useAuth();

  return useQuery({
    queryKey: chatKeys.list(user?.id || ""),
    queryFn: () => fetchChats(user!.id),
    enabled: !!user && databaseReady && isSupabaseConfigured,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Hook to get a single chat
export function useChat(chatId: string) {
  const { user, databaseReady } = useAuth();

  return useQuery({
    queryKey: chatKeys.detail(chatId),
    queryFn: () => fetchChatById(chatId, user!.id),
    enabled: !!chatId && !!user && databaseReady && isSupabaseConfigured,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to create a new chat
export function useCreateChat() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<ChatSession> => {
      if (!user || !isSupabaseConfigured) {
        throw new Error("User not authenticated or database not configured");
      }

      console.log("Creating new chat for user:", user.id);

      const { data: chatData, error: chatError } = await supabase
        .from("chats")
        .insert({
          user_id: user.id,
          title: "New Chat",
        })
        .select("id, title, created_at")
        .single();

      if (chatError) {
        console.error("Error creating chat:", chatError);
        throw new Error(`Failed to create chat: ${chatError.message}`);
      }

      const newChat: ChatSession = {
        id: chatData.id,
        title: chatData.title,
        createdAt: new Date(chatData.created_at),
        messages: [],
      };

      return newChat;
    },
    onSuccess: (newChat) => {
      // Update the chats list cache
      queryClient.setQueryData(
        chatKeys.list(user!.id),
        (oldChats: ChatSession[] = []) => [newChat, ...oldChats]
      );

      // Set the new chat in cache
      queryClient.setQueryData(chatKeys.detail(newChat.id), newChat);
    },
  });
}

// Hook to add a message to a chat
export function useAddMessage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      chatId,
      message,
    }: {
      chatId: string;
      message: Omit<ChatMessage, "id" | "timestamp">;
    }): Promise<ChatMessage> => {
      if (!user || !isSupabaseConfigured) {
        throw new Error("User not authenticated or database not configured");
      }

      const { data: messageData, error } = await supabase
        .from("messages")
        .insert({
          chat_id: chatId,
          content: message.content,
          role: message.role,
        })
        .select("id, content, role, created_at")
        .single();

      if (error) {
        console.error("Error adding message:", error);
        throw error;
      }

      const newMessage: ChatMessage = {
        id: messageData.id,
        content: messageData.content,
        role: messageData.role as "user" | "assistant",
        timestamp: new Date(messageData.created_at),
      };

      return newMessage;
    },
    onMutate: async ({ chatId, message }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: chatKeys.detail(chatId) });

      // Snapshot the previous value
      const previousChat = queryClient.getQueryData<ChatSession>(
        chatKeys.detail(chatId)
      );

      // Optimistically update the cache
      if (previousChat) {
        const optimisticMessage: ChatMessage = {
          id: `temp-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 9)}`,
          content: message.content,
          role: message.role,
          timestamp: new Date(),
        };

        const updatedChat = {
          ...previousChat,
          messages: [...previousChat.messages, optimisticMessage],
          title:
            previousChat.title === "New Chat" && message.role === "user"
              ? message.content.substring(0, 30) +
                (message.content.length > 30 ? "..." : "")
              : previousChat.title,
        };

        queryClient.setQueryData(chatKeys.detail(chatId), updatedChat);

        // Also update the chats list
        queryClient.setQueryData(
          chatKeys.list(user!.id),
          (oldChats: ChatSession[] = []) =>
            oldChats.map((chat) => (chat.id === chatId ? updatedChat : chat))
        );
      }

      return { previousChat };
    },
    onError: (err, { chatId }, context) => {
      // Rollback on error
      if (context?.previousChat) {
        queryClient.setQueryData(chatKeys.detail(chatId), context.previousChat);
      }
    },
    onSuccess: (newMessage, { chatId, message }) => {
      // Update with real message data
      queryClient.setQueryData(
        chatKeys.detail(chatId),
        (oldChat: ChatSession | undefined) => {
          if (!oldChat) return oldChat;

          const updatedMessages = oldChat.messages.map((msg) =>
            msg.id.startsWith("temp-") &&
            msg.content === message.content &&
            msg.role === message.role
              ? newMessage
              : msg
          );

          // If no temp message was found, add the new message
          if (!updatedMessages.some((msg) => msg.id === newMessage.id)) {
            updatedMessages.push(newMessage);
          }

          const updatedChat = {
            ...oldChat,
            messages: updatedMessages,
            title:
              oldChat.title === "New Chat" && message.role === "user"
                ? message.content.substring(0, 30) +
                  (message.content.length > 30 ? "..." : "")
                : oldChat.title,
          };

          // Update chat title in database if needed
          if (oldChat.title === "New Chat" && message.role === "user") {
            const title =
              message.content.substring(0, 30) +
              (message.content.length > 30 ? "..." : "");
            supabase
              .from("chats")
              .update({ title })
              .eq("id", chatId)
              .then(() => console.log("Chat title updated"))
              .catch((err) => console.error("Error updating chat title:", err));
          }

          return updatedChat;
        }
      );

      // Also update the chats list
      queryClient.setQueryData(
        chatKeys.list(user!.id),
        (oldChats: ChatSession[] = []) => {
          const updatedChat = queryClient.getQueryData<ChatSession>(
            chatKeys.detail(chatId)
          );
          return oldChats.map((chat) =>
            chat.id === chatId && updatedChat ? updatedChat : chat
          );
        }
      );
    },
  });
}

// Hook to delete a chat
export function useDeleteChat() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const chatService = ChatService.getInstance();

  return useMutation({
    mutationFn: async (chatId: string): Promise<void> => {
      if (!user || !isSupabaseConfigured) {
        throw new Error("User not authenticated or database not configured");
      }

      const { error } = await supabase
        .from("chats")
        .delete()
        .eq("id", chatId)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error deleting chat:", error);
        throw error;
      }

      // Clear conversation from chat service
      chatService.clearConversation(chatId);
    },
    onSuccess: (_, chatId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: chatKeys.detail(chatId) });

      // Update chats list
      queryClient.setQueryData(
        chatKeys.list(user!.id),
        (oldChats: ChatSession[] = []) =>
          oldChats.filter((chat) => chat.id !== chatId)
      );
    },
  });
}

// Hook to generate bot response
export function useGenerateBotResponse() {
  const queryClient = useQueryClient();
  const chatService = ChatService.getInstance();

  return useMutation({
    mutationFn: async ({
      chatId,
      userMessage,
    }: {
      chatId: string;
      userMessage: string;
    }): Promise<string> => {
      console.log("Generating bot response for:", { chatId, userMessage });

      const response = await chatService.sendMessage({
        chatId,
        message: userMessage,
      });

      if (!response.success) {
        throw new Error(response.error || "Failed to generate response");
      }

      return response.message;
    },
    onMutate: async ({ chatId }) => {
      // Set typing state
      queryClient.setQueryData(["typing", chatId], true);
    },
    onSettled: (_, __, { chatId }) => {
      // Clear typing state
      queryClient.setQueryData(["typing", chatId], false);
    },
  });
}

// Hook to get typing state
export function useTypingState(chatId: string) {
  const queryClient = useQueryClient();

  return (queryClient.getQueryData(["typing", chatId]) as boolean) || false;
}
