interface ChatRequest {
  chatId: string;
  message: string;
  conversationId?: string;
}

interface ChatResponse {
  message: string;
  conversationId?: string;
  success: boolean;
  error?: string;
}

export class ChatService {
  private static instance: ChatService;
  private conversationMap = new Map<string, string>(); // chatId -> conversationId

  static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  async sendMessage(
    request: ChatRequest,
    onChunk: (text: string) => void
  ): Promise<string> {
    const existingConversationId = this.conversationMap.get(request.chatId);

    // ✅ Create AbortController (optional, for cancel support later)
    const controller = new AbortController();

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
      signal: controller.signal, // ✅ allows abort
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    if (!response.body) {
      throw new Error("No response body");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";
    let fullText = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // ✅ Decode current chunk
        buffer += decoder.decode(value, { stream: true });

        // ✅ Split by SSE delimiter
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          if (part.startsWith("data:")) {
            const jsonString = part.replace(/^data:\s*/, "").trim();
            if (!jsonString || jsonString === "[DONE]") continue;

            try {
              const eventData = JSON.parse(jsonString);

              // ✅ Handle incremental answer
              if (eventData.answer) {
                const newText = eventData.answer;
                fullText += newText;
                onChunk(newText); // ✅ Update UI immediately
              }
            } catch (e) {
              console.error(
                "Error parsing SSE chunk:",
                e,
                "Chunk:",
                jsonString
              );
            }
          }
        }
      }

      // ✅ If conversationId is returned in the SSE stream, you can store it
      // Example: if (eventData.conversation_id) this.conversationMap.set(request.chatId, eventData.conversation_id);

      return fullText.trim();
    } finally {
      reader.releaseLock(); // ✅ Ensure reader is released
    }
  }

  // Clear conversation for a specific chat (useful when starting a new conversation)
  clearConversation(chatId: string): void {
    this.conversationMap.delete(chatId);
  }

  // Get conversation ID for a chat
  getConversationId(chatId: string): string | undefined {
    return this.conversationMap.get(chatId);
  }
}
