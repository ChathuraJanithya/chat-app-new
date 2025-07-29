"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ChatSidebar } from "@/components/chat-sidebar"
import { ChatHeader } from "@/components/chat-header"
import { ChatCanvas } from "@/components/chat-canvas"
import { DatabaseSetup } from "@/components/database-setup"
import { SidebarProvider, useSidebarContext } from "@/components/ui/sidebar"
import { MobileOverlay } from "@/components/mobile-overlay"
import { useSwipe } from "@/hooks/use-swipe"
import { useIsMobile } from "@/hooks/use-mobile"
import { useChat } from "@/context/chat-context"
import { useAuth } from "@/context/auth-context"
import { useAnonymousChat } from "@/context/anonymous-chat-context"
import { DebugInfo } from "@/components/debug-info"

function ChatApp() {
  const { isOpen, setIsOpen } = useSidebarContext()
  const isMobile = useIsMobile()
  const { currentChat, chats, loading: chatsLoading } = useChat()
  const { user, loading: authLoading, databaseReady } = useAuth()
  const { anonymousChat } = useAnonymousChat()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Check for anonymous chat parameter
  useEffect(() => {
    const qParam = searchParams.get("q")
    if (qParam && !user) {
      // Redirect to anonymous chat with the query parameter
      router.push(`/anonymous-chat?q=${encodeURIComponent(qParam)}`)
      return
    }
  }, [searchParams, user, router])

  // Handle routing after authentication and chats are loaded
  useEffect(() => {
    if (!authLoading && !chatsLoading && user) {
      if (chats.length === 0) {
        // No chats available, redirect to /chat
        router.push("/chat")
      } else if (!currentChat) {
        // Has chats but no current chat selected, redirect to the first chat
        router.push(`/chat/${chats[0].id}`)
      }
    }
  }, [chats, currentChat, router, user, authLoading, chatsLoading])

  // Redirect to anonymous chat if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      const qParam = searchParams.get("q")
      if (qParam) {
        router.push(`/anonymous-chat?q=${encodeURIComponent(qParam)}`)
      } else {
        router.push("/anonymous-chat")
      }
    }
  }, [user, authLoading, router, searchParams])

  // Add swipe gestures for mobile
  const { handlers } = useSwipe({
    onSwipeRight: () => {
      if (isMobile && !isOpen) {
        setIsOpen(true)
      }
    },
    onSwipeLeft: () => {
      if (isMobile && isOpen) {
        setIsOpen(false)
      }
    },
  })

  if (authLoading || chatsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Show database setup if database is not ready
  if (!databaseReady) {
    return <DatabaseSetup />
  }

  return (
    <div
      className="flex h-screen w-full overflow-hidden bg-gradient-to-b from-background to-background/95"
      {...handlers}
    >
      <ChatSidebar />
      <MobileOverlay />
      <div className="flex flex-1 flex-col">
        <ChatHeader />
        <ChatCanvas />
      </div>
      <DebugInfo />
    </div>
  )
}

export default function Home() {
  return (
    <SidebarProvider defaultIsOpen={false}>
      <ChatApp />
    </SidebarProvider>
  )
}
