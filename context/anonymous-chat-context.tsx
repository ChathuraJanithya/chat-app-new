"use client";

import type React from "react";

import { createContext, useContext, useState } from "react";

import type { ChatMessage, ChatSession } from "@/types/chat";

import { ChatService } from "@/lib/chat-service";
import { CONST_VARIABLES, generateChatId } from "@/data/chat-data";

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
  /*   clearAnonymousChat: () => void;
  convertToUserChat: () => Promise<ChatSession | null>; */
  //new states
  isLoadingChats: boolean;
  setIsLoadingChats: React.Dispatch<React.SetStateAction<boolean>>;
  loadChatsFromLocalStorage: () => ChatSession[] | null;
  isUserCanCreateNewChat: (existingChats: ChatSession[]) => boolean;
  currentChat: ChatSession | null;
  setCurrentChat: (chat: ChatSession | null) => void;
  setAnonymousChat: (chats: ChatSession[]) => void;
  createNewAnonymousChat: (chatId?: string) => ChatSession | undefined;
  chatLimitExceeded: boolean;
  setChatLimitExceeded: React.Dispatch<React.SetStateAction<boolean>>;
  getCurrentMessageCount: () => number;
  limitAlertDialog: boolean;
  setLimitAlertDialog: React.Dispatch<React.SetStateAction<boolean>>;
}

const AnonymousChatContext = createContext<
  AnonymousChatContextProps | undefined
>(undefined);

const ANONYMOUS_CHAT_KEY = process.env.NEXT_PUBLIC_ANONYMOUS_CHAT_KEY;

const MAX_MESSAGE_COUNT = CONST_VARIABLES.MAX_MESSAGE_COUNT;

const MAXCHATS = CONST_VARIABLES.MAXCHATS;

export function AnonymousChatProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isTyping, setIsTyping] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [anonymousChat, setAnonymousChat] = useState<ChatSession[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState<boolean>(false);
  const [hasReachedLimit, setHasReachedLimit] = useState(false);

  const chatService = ChatService.getInstance();
  const [currentChat, setCurrentChat] = useState<ChatSession | null>(null);
  const [chatLimitExceeded, setChatLimitExceeded] = useState(false);

  const [limitAlertDialog, setLimitAlertDialog] = useState(false);

  const canSendMessage = anonymousChat.length < MAX_MESSAGE_COUNT;

  //load chats from localStorage function
  const loadChatsFromLocalStorage = () => {
    const savedChats = localStorage.getItem(ANONYMOUS_CHAT_KEY as string);
    return savedChats ? JSON.parse(savedChats) : null;
  };

  //newChat validation
  const isUserCanCreateNewChat = (existingChats: ChatSession[]) => {
    return existingChats.length < MAXCHATS;
  };

  const updateLocalStorage = (chat: ChatSession | null) => {
    try {
      console.log("FUNCTION CALLED UPDATE LOCAL STORAGE FOR THE CHAT", chat);
      const currentChatId = chat ? chat.id : currentChat?.id;
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

  const createNewAnonymousChat = (chatId?: string) => {
    if (!isUserCanCreateNewChat(anonymousChat)) {
      setChatLimitExceeded(true);
      return;
    }
    const newId = generateChatId();
    const newChat: ChatSession = {
      id: chatId ? chatId : newId,
      title: "New Chat",
      createdAt: new Date(),
      messages: [],
    };
    const updatedChats = [...anonymousChat, newChat];
    updateLocalStorage(newChat);
    setAnonymousChat(updatedChats);
    setCurrentChat(newChat);
    return newChat;
  };

  const startAnonymousChat = async (
    initialMessage?: string,
    tempId?: string
  ) => {
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
    updateLocalStorage(newChat);

    addMessageToAnonymousChat({
      content: initialMessage || "",
      role: "user",
    });
    // setMessageCount(newChat.messages.length);
    // setHasReachedLimit(false);

    // Generate bot response with a small delay to ensure state is updated
    setTimeout(async () => {
      await generateBotResponseInternal(initialMessage || "", newChat, 1);
    }, 100);
  };

  const getCurrentMessageCount = () => {
    const usersMessages = currentChat?.messages.filter(
      (msg) => msg.role === "user"
    );
    return usersMessages ? usersMessages.length : 0;
  };

  const updateTitle = (newTitle: string): string => {
    const trimmed = (newTitle || "").trim();
    const title =
      trimmed.length === 0
        ? "New Chat"
        : trimmed.length > 30
        ? trimmed.substring(0, 30) + "..."
        : trimmed;

    return title;
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

    //is the fist message in the chat - set the chat title
    const currentMsgCount = getCurrentMessageCount();
    const isFirstMessage = currentMsgCount === 0;

    let updatedChat: ChatSession | null = null;
    setCurrentChat((prev) => {
      if (!prev) return null;
      updatedChat = {
        ...prev,
        title: isFirstMessage ? updateTitle(message.content) : prev.title,
        messages: [...prev.messages, newMessage],
      };
      return updatedChat;
    });

    if (updatedChat) {
      //update Anonymous chat list
      setAnonymousChat((prevChats) => {
        const otherChats = prevChats.filter(
          (chat) => chat.id !== updatedChat!.id
        );
        return [...otherChats, updatedChat as ChatSession];
      });
      updateLocalStorage(updatedChat);
    }
  };

  // Internal function that doesn't depend on state
  const generateBotResponseInternal = async (
    userMessage: string,
    currentChat: ChatSession,
    currentMessageCount: number
  ) => {
    let updatedChat: ChatSession | null = null;
    if (currentChat.messages.length >= MAX_MESSAGE_COUNT - 1) {
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
            const chat = { ...prev, messages: updatedMessages };
            updatedChat = chat;
            return chat;
          });
        }
      );
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

  return (
    <AnonymousChatContext.Provider
      value={{
        anonymousChat,
        isTyping,
        messageCount,
        maxMessages: MAX_MESSAGE_COUNT,
        canSendMessage,
        hasReachedLimit,
        startAnonymousChat,
        addMessageToAnonymousChat,
        generateBotResponse,
        sendMessage,
        /*    clearAnonymousChat,
        convertToUserChat, */
        isLoadingChats,
        setIsLoadingChats,
        loadChatsFromLocalStorage,
        isUserCanCreateNewChat,
        currentChat,
        setCurrentChat,
        setAnonymousChat,
        createNewAnonymousChat,
        chatLimitExceeded,
        setChatLimitExceeded,
        getCurrentMessageCount,
        limitAlertDialog,
        setLimitAlertDialog,
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
