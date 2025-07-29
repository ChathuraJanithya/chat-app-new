"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ScrollToBottomProps {
  containerRef: React.RefObject<HTMLElement>
  threshold?: number
  className?: string
}

export function ScrollToBottom({ containerRef, threshold = 100, className }: ScrollToBottomProps) {
  const [showButton, setShowButton] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight
      setShowButton(distanceFromBottom > threshold)
    }

    container.addEventListener("scroll", handleScroll)
    return () => container.removeEventListener("scroll", handleScroll)
  }, [containerRef, threshold])

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  }

  if (!showButton) return null

  return (
    <Button
      variant="secondary"
      size="icon"
      className={cn(
        "absolute bottom-20 right-4 h-10 w-10 rounded-full shadow-lg opacity-90 hover:opacity-100 transition-opacity",
        className,
      )}
      onClick={scrollToBottom}
    >
      <ChevronDown className="h-5 w-5" />
      <span className="sr-only">Scroll to bottom</span>
    </Button>
  )
}
