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
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    console.log("response from service", response.body);

    if (!response.body) {
      throw new Error("No response body");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n\n");
      buffer = parts.pop() || "";

      for (const part of parts) {
        if (part.startsWith("data:")) {
          const jsonString = part.replace(/^data:\s*/, "");
          if (jsonString === "[DONE]") continue;

          try {
            const eventData = JSON.parse(jsonString);
            if (eventData.answer) {
              const newText = eventData.answer;
              fullText += newText + " ";
              onChunk(newText); // send partial text to UI
            }
          } catch (e) {
            console.error("Error parsing SSE chunk:", e);
          }
        }
      }
    }

    return fullText.trim();
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
