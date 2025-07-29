"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"

interface SwipeHandlers {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  threshold?: number
}

export function useSwipe({ onSwipeLeft, onSwipeRight, threshold = 50 }: SwipeHandlers) {
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)
  const [isSwiping, setIsSwiping] = useState(false)

  const onTouchStart = (e: React.TouchEvent | TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchEndX.current = e.touches[0].clientX
    setIsSwiping(true)
  }

  const onTouchMove = (e: React.TouchEvent | TouchEvent) => {
    if (!touchStartX.current) return
    touchEndX.current = e.touches[0].clientX
  }

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) {
      setIsSwiping(false)
      return
    }

    const distance = touchEndX.current - touchStartX.current
    const isLeftSwipe = distance < -threshold
    const isRightSwipe = distance > threshold

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft()
    }

    if (isRightSwipe && onSwipeRight) {
      onSwipeRight()
    }

    // Reset values
    touchStartX.current = null
    touchEndX.current = null
    setIsSwiping(false)
  }

  useEffect(() => {
    // Add global touch handlers for when the user starts the swipe outside our component
    document.addEventListener("touchstart", onTouchStart as any)
    document.addEventListener("touchmove", onTouchMove as any)
    document.addEventListener("touchend", onTouchEnd as any)

    return () => {
      document.removeEventListener("touchstart", onTouchStart as any)
      document.removeEventListener("touchmove", onTouchMove as any)
      document.removeEventListener("touchend", onTouchEnd as any)
    }
  }, [onSwipeLeft, onSwipeRight])

  return {
    isSwiping,
    handlers: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    },
  }
}
