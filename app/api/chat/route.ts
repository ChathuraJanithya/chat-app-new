import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { chatId, message, conversationId } = await request.json()

    console.log("Processing chat message:", { chatId, userMessage: message, conversationId })

    // Validate required fields
    if (!chatId || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get API configuration from environment
    const apiUrl = process.env.NEXT_PUBLIC_CHAT_API_URL
    const apiKey = process.env.CHAT_API_KEY

    if (!apiUrl || !apiKey) {
      console.error("Missing API configuration")
      return NextResponse.json({ error: "API configuration missing" }, { status: 500 })
    }

    // Prepare API request body
    const requestBody = {
      inputs: {},
      query: message,
      response_mode: "blocking",
      user: `user-${chatId}`,
      files: [],
      ...(conversationId && { conversation_id: conversationId }),
    }

    console.log("Sending API request:", {
      url: `${apiUrl}/chat-messages`,
      body: requestBody,
    })

    // Make request to external API
    const response = await fetch(`${apiUrl}/chat-messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("API request failed:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      })
      return NextResponse.json(
        { error: `API request failed: ${response.status} ${response.statusText}` },
        { status: response.status },
      )
    }

    const apiResponse = await response.json()
    console.log("API response received:", apiResponse)

    // Extract the response content and conversation ID
    const botMessage = apiResponse.answer || apiResponse.message || "I'm sorry, I couldn't process your request."
    const newConversationId = apiResponse.conversation_id || conversationId

    return NextResponse.json({
      message: botMessage,
      conversationId: newConversationId,
      success: true,
    })
  } catch (error) {
    console.error("Error in chat API route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
