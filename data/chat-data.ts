import type { ChatSession } from "@/types/chat"

export const mockChats: ChatSession[] = [
  {
    id: "chat-1",
    title: "Next.js Help",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    messages: [
      {
        id: "msg-1-1",
        content: "What are the advantages of using Next.js?",
        role: "user",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      },
      {
        id: "msg-1-2",
        content:
          "Next.js offers several advantages:\n\n1. **Server-side Rendering (SSR)** - Improves performance and SEO\n2. **Static Site Generation (SSG)** - Fast page loads and reduced server load\n3. **API Routes** - Build API endpoints as part of your Next.js app\n4. **File-based Routing** - Simplified routing based on file structure\n5. **Built-in Image Optimization** - Automatically optimizes images for better performance\n6. **Zero Config** - Works out of the box with sensible defaults\n7. **TypeScript Support** - First-class TypeScript support\n8. **Fast Refresh** - Instant feedback during development",
        role: "assistant",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 30), // 2 hours ago + 30 seconds
      },
    ],
  },
  {
    id: "chat-2",
    title: "Good luck wishes",
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    messages: [
      {
        id: "msg-2-1",
        content: "I have an important presentation tomorrow. Can you wish me luck?",
        role: "user",
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      },
      {
        id: "msg-2-2",
        content:
          "Good luck with your presentation tomorrow! Remember that you've prepared well and have all the knowledge you need. Take a deep breath before you start, speak clearly and confidently, and remember that a bit of nervousness is just your body getting ready to perform at its best. You're going to do great!",
        role: "assistant",
        timestamp: new Date(Date.now() - 1000 * 60 * 30 + 1000 * 20), // 30 minutes ago + 20 seconds
      },
    ],
  },
  {
    id: "chat-3",
    title: "Recipe ideas",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    messages: [
      {
        id: "msg-3-1",
        content: "I need some vegetarian dinner ideas that are quick to make.",
        role: "user",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      },
      {
        id: "msg-3-2",
        content:
          "Here are some quick vegetarian dinner ideas:\n\n1. **Veggie Stir-Fry** - Sauté mixed vegetables with tofu and serve over rice\n2. **Pasta Primavera** - Pasta with seasonal vegetables and a light sauce\n3. **Chickpea Curry** - Quick curry with canned chickpeas, coconut milk, and spices\n4. **Bean Burritos** - Wrap beans, cheese, and vegetables in tortillas\n5. **Caprese Sandwich** - Tomato, mozzarella, and basil on crusty bread\n6. **Shakshuka** - Eggs poached in spiced tomato sauce\n7. **Vegetable Quesadillas** - Cheese and vegetable-filled tortillas\n8. **Greek Salad** - With feta, olives, and a hearty dressing",
        role: "assistant",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 + 1000 * 45), // 1 day ago + 45 seconds
      },
    ],
  },
]

// Function to generate a unique chat ID
export function generateChatId(): string {
  return `chat-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// Function to get a chat by ID
export function getChatById(id: string): ChatSession | undefined {
  return mockChats.find((chat) => chat.id === id)
}
