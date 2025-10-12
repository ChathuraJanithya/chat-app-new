"use client";

import type React from "react";

import { createContext, useContext, useState, useEffect } from "react";

import { useAuth } from "@/context/auth-context";
import { useChat } from "@/context/chat-context";
import type { ChatMessage, ChatSession } from "@/types/chat";

import { ChatService } from "@/lib/chat-service";

interface AnonymousChatContextProps {
  anonymousChat: ChatSession[];

  isTyping: boolean;
  messageCount: number;
  maxMessages: number;
  canSendMessage: boolean;
  hasReachedLimit: boolean;
  startAnonymousChat: (
    initialMessage?: string,
    tempId?: string
  ) => Promise<void>;
  addMessageToAnonymousChat: (
    message: Omit<ChatMessage, "id" | "timestamp">
  ) => void;
  generateBotResponse: (userMessage: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  clearAnonymousChat: () => void;
  convertToUserChat: () => Promise<ChatSession | null>;
  //new states
  isLoadingChats: boolean;
  setIsLoadingChats: React.Dispatch<React.SetStateAction<boolean>>;
  loadChatsFromLocalStorage: () => ChatSession[] | null;
  isUserCanSendMessage: (existingChats: ChatSession[]) => boolean;
  currentChat: ChatSession | null;
  setCurrentChat: (chat: ChatSession | null) => void;
  setAnonymousChat: (chats: ChatSession[]) => void;
}

const AnonymousChatContext = createContext<
  AnonymousChatContextProps | undefined
>(undefined);

const ANONYMOUS_CHAT_KEY = process.env.NEXT_PUBLIC_ANONYMOUS_CHAT_KEY;

const maxChats = 5;
const maxMessages = 10;

export function AnonymousChatProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [anonymousChat, setAnonymousChat] = useState<ChatSession[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingChats, setIsLoadingChats] = useState<boolean>(false);
  const [messageCount, setMessageCount] = useState(0);
  const [hasReachedLimit, setHasReachedLimit] = useState(false);

  const { user } = useAuth();
  const { createNewChat, addMessageToChat } = useChat();
  const chatService = ChatService.getInstance();
  const [anonymousChatId, setAnonymousChatId] = useState<string | null>(null);
  const [currentChat, setCurrentChat] = useState<ChatSession | null>(null);

  const canSendMessage = messageCount < maxMessages;

  // Load from localStorage on mount
  /*   useEffect(() => {
    if (!user) {
      const savedChat = loadFromLocalStorage();
      if (savedChat) {
        setAnonymousChat([savedChat]);
        const userMessages = savedChat.messages.filter(
          (msg) => msg.role === "user"
        );
        setMessageCount(userMessages.length);
        setHasReachedLimit(userMessages.length >= maxMessages);
      }
    }
  }, []); */

  //load chats from localStorage function
  const loadChatsFromLocalStorage = () => {
    const savedChats = localStorage.getItem(ANONYMOUS_CHAT_KEY as string);
    return savedChats ? JSON.parse(savedChats) : null;
  };

  //newChat validation
  const isUserCanSendMessage = (existingChats: ChatSession[]) => {
    return existingChats.length < maxChats;
  };

  // Auto-convert when user logs in
  /*   useEffect(() => {
    if (user && anonymousChat && anonymousChat.messages.length > 0) {
      //    console.log("User logged in with existing anonymous chat, converting...");
      convertToUserChat();
    }
  }, [user, anonymousChat]); */

  const updateLocalStorage = (chat: ChatSession | null) => {
    try {
      console.log("Updating anonymous chat in localStorage...");
      console.log("Chat data:", chat);
      const currentChatId = chat ? chat.id : anonymousChatId;
      if (!currentChatId) return;

      const existingChats = loadChatsFromLocalStorage() || [];
      const otherChats = existingChats.filter(
        (c: ChatSession) => c.id !== currentChatId
      );

      const chatData = {
        ...chat,
        savedAt: new Date().toISOString(),
      };

      const updatedChats = [...otherChats, chatData];

      localStorage.setItem(
        ANONYMOUS_CHAT_KEY as string,
        JSON.stringify(updatedChats)
      );
      // console.log("Anonymous chat updated in localStorage");
    } catch (error) {
      console.error("Error updating localStorage:", error);
    }
  };

  const startAnonymousChat = async (
    initialMessage?: string,
    tempId?: string
  ) => {
    setAnonymousChatId(tempId as string);

    const newChat: ChatSession = {
      id: tempId as string,
      title: initialMessage
        ? initialMessage.substring(0, 30) +
          (initialMessage.length > 30 ? "..." : "")
        : "Anonymous Chat",
      createdAt: new Date(),
      messages: [],
    };

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      content: initialMessage || "",
      role: "user",
      timestamp: new Date(),
    };

    newChat.messages = [userMessage];

    // Set the chat state first
    setAnonymousChat((prev) => [...prev, newChat]);
    setCurrentChat(newChat);
    // setMessageCount(newChat.messages.length);
    // setHasReachedLimit(false);

    // Generate bot response with a small delay to ensure state is updated
    setTimeout(async () => {
      await generateBotResponseInternal(initialMessage || "", newChat, 1);
    }, 100);
  };

  const addMessageToAnonymousChat = (
    message: Omit<ChatMessage, "id" | "timestamp">
  ) => {
    if (!anonymousChat) {
      console.log("Anonymous chat not initialized yet.");
      return;
    }

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      content: message.content,
      role: message.role,
      timestamp: new Date(),
    };

    let updatedChat: ChatSession | null = null;
    setCurrentChat((prev) => {
      if (!prev) return null;
      updatedChat = {
        ...prev,
        messages: [...prev.messages, newMessage],
      };
      return updatedChat;
    });

    if (updatedChat) {
      updateLocalStorage(updatedChat);
    }

    //  const newCount = messageCount + 1;
    //  setMessageCount(newCount);

    /*  if (newCount >= maxMessages) {
      setHasReachedLimit(true);
    } */
  };

  // Internal function that doesn't depend on state
  const generateBotResponseInternal = async (
    userMessage: string,
    currentChat: ChatSession,
    currentMessageCount: number
  ) => {
    let updatedChat: ChatSession | null = null;
    if (currentChat.messages.length >= maxMessages - 1) {
      setHasReachedLimit(true);
      return;
    }

    setIsTyping(true);

    try {
      let botResponse = "";
      let firstChunk = true;

      // ✅ Add placeholder assistant message
      const placeholderId = `temp-assistant-${Date.now()}`;
      const placeholderMessage: ChatMessage = {
        id: placeholderId,
        content: "",
        role: "assistant",
        timestamp: new Date(),
      };

      // ✅ Stream response chunks
      await chatService.sendMessage(
        { chatId: currentChat.id, message: userMessage },
        (chunk) => {
          if (firstChunk) {
            setIsTyping(false); // Hide typing indicator after first chunk
            firstChunk = false;
            setCurrentChat((prev) => {
              if (!prev) return null;
              return {
                ...prev,
                messages: [...prev.messages, placeholderMessage],
              };
            });
          }

          botResponse += chunk;

          // Update placeholder message content as chunks arrive
          setCurrentChat((prev) => {
            if (!prev) return null;
            const updatedMessages = prev.messages.map((msg) =>
              msg.id === placeholderId ? { ...msg, content: botResponse } : msg
            );
            return { ...prev, messages: updatedMessages };
          });
        }
      );

      // ✅ Replace placeholder with final content
      let updatedChat: ChatSession | null = null;
      setCurrentChat((prev) => {
        if (!prev) return null;
        const updatedMessages = prev.messages.map((msg) =>
          msg.id === placeholderId ? { ...msg, content: botResponse } : msg
        );
        updatedChat = { ...prev, messages: updatedMessages };
        return updatedChat;
      });

      if (updatedChat) {
        updateLocalStorage(updatedChat);
      }

      // ✅ Update message count
      /*       const newCount = currentMessageCount + 1;
      setMessageCount(newCount);
      if (newCount >= maxMessages) {
        setHasReachedLimit(true);
      } */
    } catch (error) {
      console.error("Error generating anonymous bot response:", error);

      const errorMessage =
        "I'm sorry, I'm having trouble connecting right now. This is an anonymous chat session with limited messages. Please log in for unlimited chatting.";

      // Replace placeholder with error message
      setCurrentChat((prev) => {
        if (!prev) return null;
        const updatedMessages = prev.messages.map((msg) =>
          msg.role === "assistant" && msg.content === ""
            ? { ...msg, content: errorMessage }
            : msg
        );
        return { ...prev, messages: updatedMessages };
      });

      const newCount = currentMessageCount + 1;
      setMessageCount(newCount);
    } finally {
      if (updatedChat) {
        updateLocalStorage(updatedChat);
      }
      setIsTyping(false);
    }
  };

  const generateBotResponse = async (userMessage: string) => {
    //if (!anonymousChat) return;
    await generateBotResponseInternal(
      userMessage,
      currentChat as ChatSession,
      messageCount
    );
  };

  // New unified send message function
  const sendMessage = async (content: string) => {
    if (!content.trim() || !canSendMessage) return;

    // Add user message immediately
    const userMessage: Omit<ChatMessage, "id" | "timestamp"> = {
      content,
      role: "user",
    };

    addMessageToAnonymousChat(userMessage);

    // Use setTimeout to ensure the user message is rendered first
    setTimeout(() => {
      generateBotResponse(content);
    }, 100);
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
      // console.log("Anonymous chat cleared from localStorage");
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  };

  const convertToUserChat = async (): Promise<ChatSession | null> => {
    if (!user || !anonymousChat || anonymousChat.messages.length === 0) {
      return null;
    }

    try {
      //  console.log("Converting anonymous chat to user chat...");

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
        isLoadingChats,
        setIsLoadingChats,
        loadChatsFromLocalStorage,
        isUserCanSendMessage,
        currentChat,
        setCurrentChat,
        setAnonymousChat,
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
