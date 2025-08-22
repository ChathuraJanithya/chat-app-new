import { NextRequest } from "next/server";

export const runtime = "edge"; // ✅ Edge runtime supports streaming well

export async function POST(request: NextRequest) {
  try {
    const { chatId, message, conversationId } = await request.json();

    if (!chatId || !message) {
      return new Response("Missing required fields", { status: 400 });
    }

    const apiUrl = process.env.NEXT_PUBLIC_CHAT_API_URL;
    const apiKey = process.env.CHAT_API_KEY;

    if (!apiUrl || !apiKey) {
      return new Response("API configuration missing", { status: 500 });
    }

    const requestBody = {
      inputs: {},
      query: message,
      response_mode: "streaming",
      user: `user-${chatId}`,
      files: [],
      ...(conversationId && { conversation_id: conversationId }),
    };

    const upstreamResponse = await fetch(`${apiUrl}/chat-messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!upstreamResponse.ok) {
      return new Response(
        `Error from LLM API: ${upstreamResponse.statusText}`,
        {
          status: upstreamResponse.status,
        }
      );
    }

    // ✅ Stream upstream SSE directly to client
    return new Response(upstreamResponse.body, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in chat API route:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
