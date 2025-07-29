"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import type { ChatMessage, ChatSession } from "@/types/chat";
import { useAuth } from "@/context/auth-context";
import { useChat } from "@/context/chat-context";
import { ChatService } from "@/lib/chat-service";

interface AnonymousChatContextProps {
  anonymousChat: ChatSession | null;
  isTyping: boolean;
  messageCount: number;
  maxMessages: number;
  canSendMessage: boolean;
  hasReachedLimit: boolean;
  startAnonymousChat: (initialMessage?: string) => Promise<void>;
  addMessageToAnonymousChat: (
    message: Omit<ChatMessage, "id" | "timestamp">
  ) => void;
  generateBotResponse: (userMessage: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  clearAnonymousChat: () => void;
  convertToUserChat: () => Promise<ChatSession | null>;
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => ChatSession | null;
}

const AnonymousChatContext = createContext<
  AnonymousChatContextProps | undefined
>(undefined);

const ANONYMOUS_CHAT_KEY = process.env.NEXT_PUBLIC_ANONYMOUS_CHAT_KEY;

export function AnonymousChatProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [anonymousChat, setAnonymousChat] = useState<ChatSession | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [hasReachedLimit, setHasReachedLimit] = useState(false);
  const maxMessages = 5;
  const { user } = useAuth();
  const { createNewChat, addMessageToChat } = useChat();
  const chatService = ChatService.getInstance();

  const canSendMessage = messageCount < maxMessages;

  // Load from localStorage on mount
  useEffect(() => {
    if (!user) {
      const savedChat = loadFromLocalStorage();
      if (savedChat) {
        setAnonymousChat(savedChat);
        setMessageCount(savedChat.messages.length);
        setHasReachedLimit(savedChat.messages.length >= maxMessages);
      }
    }
  }, []);

  // Auto-convert when user logs in
  useEffect(() => {
    if (user && anonymousChat && anonymousChat.messages.length > 0) {
      console.log("User logged in with existing anonymous chat, converting...");
      convertToUserChat();
    }
  }, [user, anonymousChat]);

  // Save to localStorage whenever chat changes
  useEffect(() => {
    if (anonymousChat && !user) {
      saveToLocalStorage();
    }
  }, [anonymousChat, user]);

  const saveToLocalStorage = () => {
    if (anonymousChat) {
      try {
        const chatData = {
          ...anonymousChat,
          savedAt: new Date().toISOString(),
        };
        localStorage.setItem(
          ANONYMOUS_CHAT_KEY as string,
          JSON.stringify(chatData)
        );
        console.log("Anonymous chat saved to localStorage");
      } catch (error) {
        console.error("Error saving to localStorage:", error);
      }
    }
  };

  const loadFromLocalStorage = (): ChatSession | null => {
    try {
      const saved = localStorage.getItem(ANONYMOUS_CHAT_KEY as string);
      if (saved) {
        const chatData = JSON.parse(saved);
        console.log("Loaded anonymous chat from localStorage:", chatData);

        // Convert date strings back to Date objects
        return {
          ...chatData,
          createdAt: new Date(chatData.createdAt),
          messages: chatData.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
        };
      }
    } catch (error) {
      console.error("Error loading from localStorage:", error);
    }
    return null;
  };

  const startAnonymousChat = async (initialMessage?: string) => {
    console.log("startAnonymousChat called with:", initialMessage);

    // Check if there's an existing chat in localStorage first
    const existingChat = loadFromLocalStorage();
    if (existingChat && existingChat.messages.length > 0) {
      console.log("Found existing chat, loading it");
      setAnonymousChat(existingChat);
      setMessageCount(existingChat.messages.length);
      setHasReachedLimit(existingChat.messages.length >= maxMessages);
      return;
    }

    const newChat: ChatSession = {
      id: `anonymous-${Date.now()}`,
      title: initialMessage
        ? initialMessage.substring(0, 30) +
          (initialMessage.length > 30 ? "..." : "")
        : "Anonymous Chat",
      createdAt: new Date(),
      messages: [],
    };

    console.log("Creating new anonymous chat:", newChat);

    // If we have an initial message, add it and generate response
    if (initialMessage) {
      const userMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        content: initialMessage,
        role: "user",
        timestamp: new Date(),
      };

      newChat.messages = [userMessage];

      // Set the chat state first
      setAnonymousChat(newChat);
      setMessageCount(1);
      setHasReachedLimit(false);

      console.log(
        "Chat created with initial message, generating bot response..."
      );

      // Generate bot response with a small delay to ensure state is updated
      setTimeout(async () => {
        await generateBotResponseInternal(initialMessage, newChat, 1);
      }, 100);
    } else {
      setAnonymousChat(newChat);
      setMessageCount(0);
      setHasReachedLimit(false);
    }
  };

  const addMessageToAnonymousChat = (
    message: Omit<ChatMessage, "id" | "timestamp">
  ) => {
    if (!anonymousChat) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      content: message.content,
      role: message.role,
      timestamp: new Date(),
    };

    setAnonymousChat((prev) => {
      if (!prev) return null;
      const updatedChat = {
        ...prev,
        messages: [...prev.messages, newMessage],
      };
      return updatedChat;
    });

    const newCount = messageCount + 1;
    setMessageCount(newCount);

    if (newCount >= maxMessages) {
      setHasReachedLimit(true);
    }
  };

  // Internal function that doesn't depend on state
  const generateBotResponseInternal = async (
    userMessage: string,
    currentChat: ChatSession,
    currentMessageCount: number
  ) => {
    console.log("generateBotResponseInternal called with:", {
      userMessage,
      currentMessageCount,
    });

    if (currentMessageCount >= maxMessages - 1) {
      console.log("Message limit reached, not generating response");
      setHasReachedLimit(true);
      return;
    }

    setIsTyping(true);

    try {
      console.log("Calling chat service for:", userMessage);

      // Call the real API for anonymous chat
      const response = await chatService.sendMessage({
        chatId: currentChat.id,
        message: userMessage,
      });

      let botMessage = response.message;

      // Add context about remaining messages
      const remainingMessages = maxMessages - currentMessageCount - 1;
      if (response.success && remainingMessages > 0) {
        botMessage += `\n\n*Anonymous chat: ${remainingMessages} message${
          remainingMessages !== 1 ? "s" : ""
        } remaining. [Sign up](/signup) for unlimited chatting.*`;
      } else if (response.success && remainingMessages <= 0) {
        botMessage += `\n\n*You've reached the message limit for anonymous chat. [Sign up](/signup) or [log in](/login) to continue this conversation.*`;
      }

      const botResponse: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        content: botMessage,
        role: "assistant",
        timestamp: new Date(),
      };

      console.log("Adding bot response:", botResponse);

      // Update the chat state directly instead of using addMessageToAnonymousChat
      setAnonymousChat((prev) => {
        if (!prev) return null;
        const updatedChat = {
          ...prev,
          messages: [...prev.messages, botResponse],
        };
        console.log("Updated chat with bot response:", updatedChat);
        return updatedChat;
      });

      const newCount = currentMessageCount + 1;
      setMessageCount(newCount);

      if (newCount >= maxMessages) {
        setHasReachedLimit(true);
      }
    } catch (error) {
      console.error("Error generating anonymous bot response:", error);

      const errorResponse: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        content:
          "I'm sorry, I'm having trouble connecting right now. This is an anonymous chat session with limited messages. Please log in for unlimited chatting.",
        role: "assistant",
        timestamp: new Date(),
      };

      setAnonymousChat((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          messages: [...prev.messages, errorResponse],
        };
      });

      const newCount = currentMessageCount + 1;
      setMessageCount(newCount);
    } finally {
      setIsTyping(false);
    }
  };

  const generateBotResponse = async (userMessage: string) => {
    if (!anonymousChat) return;
    await generateBotResponseInternal(userMessage, anonymousChat, messageCount);
  };

  // New unified send message function
  const sendMessage = async (content: string) => {
    if (!content.trim() || !canSendMessage) return;

    console.log("sendMessage called with:", content);

    // Start chat if it doesn't exist
    if (!anonymousChat) {
      console.log("No existing chat, starting new one with message");
      await startAnonymousChat(content);
      return;
    }

    // Add user message immediately
    console.log("Adding user message to existing chat");
    const userMessage: Omit<ChatMessage, "id" | "timestamp"> = {
      content,
      role: "user",
    };

    addMessageToAnonymousChat(userMessage);

    // Generate bot response if we haven't hit the limit
    const newMessageCount = messageCount + 1;
    if (newMessageCount < maxMessages) {
      console.log("Generating bot response for user message");
      // Use setTimeout to ensure the user message is rendered first
      setTimeout(() => {
        generateBotResponse(content);
      }, 100);
    } else {
      console.log("Message limit reached, not generating response");
      setHasReachedLimit(true);
    }
  };

  const clearAnonymousChat = () => {
    if (anonymousChat) {
      chatService.clearConversation(anonymousChat.id);
    }
    setAnonymousChat(null);
    setMessageCount(0);
    setHasReachedLimit(false);

    // Clear from localStorage
    try {
      localStorage.removeItem(ANONYMOUS_CHAT_KEY as string);
      console.log("Anonymous chat cleared from localStorage");
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  };

  const convertToUserChat = async (): Promise<ChatSession | null> => {
    if (!user || !anonymousChat || anonymousChat.messages.length === 0) {
      return null;
    }

    try {
      console.log("Converting anonymous chat to user chat...");

      // Create a new chat in the database
      const newChat = await createNewChat();
      if (!newChat) {
        console.error("Failed to create new chat for conversion");
        return null;
      }

      // Add all messages from anonymous chat to the new chat
      for (const message of anonymousChat.messages) {
        await addMessageToChat(newChat.id, {
          content: message.content,
          role: message.role,
        });
      }

      console.log(
        "Anonymous chat successfully converted to user chat:",
        newChat.id
      );

      // Clear the anonymous chat
      clearAnonymousChat();

      return newChat;
    } catch (error) {
      console.error("Error converting anonymous chat:", error);
      return null;
    }
  };

  return (
    <AnonymousChatContext.Provider
      value={{
        anonymousChat,
        isTyping,
        messageCount,
        maxMessages,
        canSendMessage,
        hasReachedLimit,
        startAnonymousChat,
        addMessageToAnonymousChat,
        generateBotResponse,
        sendMessage,
        clearAnonymousChat,
        convertToUserChat,
        saveToLocalStorage,
        loadFromLocalStorage,
      }}
    >
      {children}
    </AnonymousChatContext.Provider>
  );
}

export function useAnonymousChat() {
  const context = useContext(AnonymousChatContext);
  if (context === undefined) {
    throw new Error(
      "useAnonymousChat must be used within an AnonymousChatProvider"
    );
  }
  return context;
}
