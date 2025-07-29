interface ChatRequest {
  chatId: string
  message: string
  conversationId?: string
}

interface ChatResponse {
  message: string
  conversationId?: string
  success: boolean
  error?: string
}

export class ChatService {
  private static instance: ChatService
  private conversationMap = new Map<string, string>() // chatId -> conversationId

  static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService()
    }
    return ChatService.instance
  }

  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    try {
      // Get existing conversation ID for this chat
      const existingConversationId = this.conversationMap.get(request.chatId)

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId: request.chatId,
          message: request.message,
          conversationId: existingConversationId || request.conversationId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data: ChatResponse = await response.json()

      // Store conversation ID for future messages in this chat
      if (data.conversationId) {
        this.conversationMap.set(request.chatId, data.conversationId)
      }

      return data
    } catch (error) {
      console.error("Chat service error:", error)
      return {
        message: "I'm sorry, I'm having trouble connecting right now. Please try again.",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  // Clear conversation for a specific chat (useful when starting a new conversation)
  clearConversation(chatId: string): void {
    this.conversationMap.delete(chatId)
  }

  // Get conversation ID for a chat
  getConversationId(chatId: string): string | undefined {
    return this.conversationMap.get(chatId)
  }
}
