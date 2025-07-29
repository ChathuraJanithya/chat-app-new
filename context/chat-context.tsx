"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { ChatMessage, ChatSession } from "@/types/chat"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { useAuth } from "@/context/auth-context"
import { ChatService } from "@/lib/chat-service"

interface ChatContextProps {
  chats: ChatSession[]
  currentChat: ChatSession | null
  isTyping: boolean
  loading: boolean
  setCurrentChat: (chat: ChatSession | null) => void
  createNewChat: () => Promise<ChatSession | null>
  addMessageToChat: (chatId: string, message: Omit<ChatMessage, "id" | "timestamp">) => Promise<void>
  generateBotResponse: (chatId: string, userMessage: string) => Promise<void>
  deleteChat: (chatId: string) => Promise<void>
  loadChats: () => Promise<void>
  getChatById: (chatId: string) => Promise<ChatSession | null>
}

const ChatContext = createContext<ChatContextProps | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [chats, setChats] = useState<ChatSession[]>([])
  const [currentChat, setCurrentChat] = useState<ChatSession | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [loading, setLoading] = useState(true)
  const { user, databaseReady } = useAuth()
  const chatService = ChatService.getInstance()

  // Load chats from Supabase
  const loadChats = async () => {
    if (!user || !databaseReady || !isSupabaseConfigured) {
      setChats([])
      setLoading(false)
      return
    }

    try {
      console.log("Loading chats for user:", user.id)
      setLoading(true)

      // First, fetch all chats for the user
      const { data: chatsData, error: chatsError } = await supabase
        .from("chats")
        .select("id, title, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (chatsError) {
        console.error("Error fetching chats:", chatsError)
        throw chatsError
      }

      console.log("Fetched chats:", chatsData)

      if (!chatsData || chatsData.length === 0) {
        setChats([])
        setLoading(false)
        return
      }

      // Then, fetch messages for each chat
      const chatsWithMessages: ChatSession[] = []

      for (const chat of chatsData) {
        const { data: messagesData, error: messagesError } = await supabase
          .from("messages")
          .select("id, content, role, created_at")
          .eq("chat_id", chat.id)
          .order("created_at", { ascending: true })

        if (messagesError) {
          console.error("Error fetching messages for chat", chat.id, messagesError)
          continue
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
        }

        chatsWithMessages.push(formattedChat)
      }

      setChats(chatsWithMessages)
    } catch (error) {
      console.error("Error loading chats:", error)
      setChats([])
    } finally {
      setLoading(false)
    }
  }

  // Get a specific chat by ID
  const getChatById = async (chatId: string): Promise<ChatSession | null> => {
    if (!user || !isSupabaseConfigured) return null

    try {
      console.log("Getting chat by ID:", chatId)

      // First, fetch the chat - use .maybeSingle() to handle no results gracefully
      const { data: chatData, error: chatError } = await supabase
        .from("chats")
        .select("id, title, created_at")
        .eq("id", chatId)
        .eq("user_id", user.id)
        .maybeSingle() // This prevents the "multiple rows" error

      if (chatError) {
        console.error("Error fetching chat:", chatError)
        return null
      }

      if (!chatData) {
        console.log("Chat not found:", chatId)
        return null
      }

      // Then, fetch messages for the chat
      const { data: messagesData, error: messagesError } = await supabase
        .from("messages")
        .select("id, content, role, created_at")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true })

      if (messagesError) {
        console.error("Error fetching messages:", messagesError)
        return null
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
      }

      console.log("Successfully retrieved chat:", chat.id)
      return chat
    } catch (error) {
      console.error("Error getting chat by ID:", error)
      return null
    }
  }

  // Load chats when user changes
  useEffect(() => {
    if (databaseReady) {
      loadChats()
    }
  }, [user, databaseReady])

  // Create a new chat
  const createNewChat = async (): Promise<ChatSession | null> => {
    if (!user || !databaseReady || !isSupabaseConfigured) {
      console.error("Cannot create chat: user not authenticated, database not ready, or Supabase not configured")
      return null
    }

    console.log("Creating new chat for user:", user.id)

    try {
      // Create the chat
      const { data: chatData, error: chatError } = await supabase
        .from("chats")
        .insert({
          user_id: user.id,
          title: "New Chat",
        })
        .select("id, title, created_at")
        .single()

      if (chatError) {
        console.error("Error creating chat:", chatError)
        throw new Error(`Failed to create chat: ${chatError.message}`)
      }

      if (!chatData) {
        console.error("No chat data returned after creation")
        throw new Error("No chat data returned after creation")
      }

      console.log("Chat created successfully:", chatData)

      const newChat: ChatSession = {
        id: chatData.id,
        title: chatData.title,
        createdAt: new Date(chatData.created_at),
        messages: [],
      }

      console.log("New chat object created:", newChat)

      setChats((prevChats) => [newChat, ...prevChats])
      setCurrentChat(newChat)
      return newChat
    } catch (error) {
      console.error("Error creating chat:", error)
      return null
    }
  }

  // Add a message to a chat
  const addMessageToChat = async (chatId: string, message: Omit<ChatMessage, "id" | "timestamp">) => {
    if (!user || !isSupabaseConfigured) return

    try {
      console.log("Adding message to chat:", chatId, message)

      const { data: messageData, error } = await supabase
        .from("messages")
        .insert({
          chat_id: chatId,
          content: message.content,
          role: message.role,
        })
        .select("id, content, role, created_at")
        .single()

      if (error) {
        console.error("Error adding message:", error)
        throw error
      }

      console.log("Message added successfully:", messageData)

      const newMessage: ChatMessage = {
        id: messageData.id,
        content: messageData.content,
        role: messageData.role as "user" | "assistant",
        timestamp: new Date(messageData.created_at),
      }

      // Update local state
      setChats((prevChats) =>
        prevChats.map((chat) => {
          if (chat.id === chatId) {
            // Update chat title if it's the first user message
            let title = chat.title
            if (chat.title === "New Chat" && message.role === "user") {
              title = message.content.substring(0, 30) + (message.content.length > 30 ? "..." : "")

              // Update title in database
              supabase
                .from("chats")
                .update({ title })
                .eq("id", chatId)
                .then(() => console.log("Chat title updated"))
                .catch((err) => console.error("Error updating chat title:", err))
            }

            return {
              ...chat,
              title,
              messages: [...chat.messages, newMessage],
            }
          }
          return chat
        }),
      )

      // Update current chat if it's the active one
      if (currentChat?.id === chatId) {
        setCurrentChat((prev) => {
          if (!prev) return null

          let title = prev.title
          if (prev.title === "New Chat" && message.role === "user") {
            title = message.content.substring(0, 30) + (message.content.length > 30 ? "..." : "")
          }

          return {
            ...prev,
            title,
            messages: [...prev.messages, newMessage],
          }
        })
      }
    } catch (error) {
      console.error("Error adding message:", error)
    }
  }

  // Generate a bot response using the real API
  const generateBotResponse = async (chatId: string, userMessage: string) => {
    setIsTyping(true)

    try {
      console.log("Generating bot response for:", { chatId, userMessage })

      // Call the real API
      const response = await chatService.sendMessage({
        chatId,
        message: userMessage,
      })

      if (response.success && response.message) {
        // Add the bot response to the chat
        await addMessageToChat(chatId, {
          content: response.message,
          role: "assistant",
        })
      } else {
        // Handle API error
        console.error("API response error:", response.error)
        await addMessageToChat(chatId, {
          content: response.message || "I'm sorry, I encountered an error. Please try again.",
          role: "assistant",
        })
      }
    } catch (error) {
      console.error("Error generating bot response:", error)

      // Add error message to chat
      await addMessageToChat(chatId, {
        content: "I'm sorry, I'm having trouble connecting right now. Please try again.",
        role: "assistant",
      })
    } finally {
      setIsTyping(false)
    }
  }

  // Delete a chat
  const deleteChat = async (chatId: string) => {
    if (!user || !isSupabaseConfigured) return

    try {
      console.log("Deleting chat:", chatId)

      const { error } = await supabase.from("chats").delete().eq("id", chatId).eq("user_id", user.id)

      if (error) {
        console.error("Error deleting chat:", error)
        throw error
      }

      console.log("Chat deleted successfully")

      // Clear conversation from chat service
      chatService.clearConversation(chatId)

      // Update local state - remove the deleted chat
      const updatedChats = chats.filter((chat) => chat.id !== chatId)
      setChats(updatedChats)

      // Handle current chat logic professionally
      if (currentChat?.id === chatId) {
        // If there are other chats available, switch to the most recent one
        if (updatedChats.length > 0) {
          const nextChat = updatedChats[0] // Most recent chat (sorted by created_at desc)
          setCurrentChat(nextChat)
          console.log("Switched to next available chat:", nextChat.id)
          return nextChat.id // Return the ID for navigation
        } else {
          // No other chats available, clear current chat
          setCurrentChat(null)
          console.log("No other chats available, cleared current chat")
          return null // Indicate no chat to navigate to
        }
      }

      return "no-change" // Current chat wasn't affected
    } catch (error) {
      console.error("Error deleting chat:", error)
      throw error // Re-throw to handle in component
    }
  }

  const preloadChats = async () => {
    if (!user || !databaseReady || !isSupabaseConfigured) {
      return []
    }

    try {
      console.log("Preloading chats for user:", user.id)

      const { data: chatsData, error: chatsError } = await supabase
        .from("chats")
        .select(`
        id, 
        title, 
        created_at,
        messages (
          id,
          content,
          role,
          created_at
        )
      `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (chatsError) {
        console.error("Error preloading chats:", chatsError)
        return []
      }

      const formattedChats: ChatSession[] = (chatsData || []).map((chat) => ({
        id: chat.id,
        title: chat.title,
        createdAt: new Date(chat.created_at),
        messages: (chat.messages || [])
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
          .map((msg) => ({
            id: msg.id,
            content: msg.content,
            role: msg.role as "user" | "assistant",
            timestamp: new Date(msg.created_at),
          })),
      }))

      return formattedChats
    } catch (error) {
      console.error("Error preloading chats:", error)
      return []
    }
  }

  return (
    <ChatContext.Provider
      value={{
        chats,
        currentChat,
        isTyping,
        loading,
        setCurrentChat,
        createNewChat,
        addMessageToChat,
        generateBotResponse,
        deleteChat,
        loadChats,
        getChatById,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
}
