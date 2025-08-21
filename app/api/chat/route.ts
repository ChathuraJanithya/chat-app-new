import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { chatId, message, conversationId } = await request.json();

    if (!chatId || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
        }
      );
    }

    const apiUrl = process.env.NEXT_PUBLIC_CHAT_API_URL;
    const apiKey = process.env.CHAT_API_KEY;

    if (!apiUrl || !apiKey) {
      return new Response(
        JSON.stringify({ error: "API configuration missing" }),
        {
          status: 500,
        }
      );
    }

    const requestBody = {
      inputs: {},
      query: message,
      response_mode: "streaming",
      user: `user-${chatId}`,
      files: [],
      ...(conversationId && { conversation_id: conversationId }),
    };

    const response = await fetch(`${apiUrl}/chat-messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({ error: errorText }), {
        status: response.status,
      });
    }

    console.log("Response from route :", response);

    // ✅ Read SSE stream
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let fullAnswer = "";

    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      console.log("Chunk received:", buffer);

      const parts = buffer.split("\n\n"); // SSE chunks separated by \n\n
      buffer = parts.pop() || ""; // Keep the incomplete chunk for next loop

      for (const part of parts) {
        if (part.startsWith("data:")) {
          const jsonString = part.replace(/^data:\s*/, "");
          try {
            const parsed = JSON.parse(jsonString);
            if (parsed.answer) {
              fullAnswer += parsed.answer;
            }
          } catch (e) {
            console.error("Failed to parse SSE chunk:", jsonString);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        message: fullAnswer || "I'm sorry, I couldn't process your request.",
        conversationId: conversationId,
        success: true,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in chat API route:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}
