"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  className?: string
  pullDistance?: number
  children: React.ReactNode
}

export function PullToRefresh({ onRefresh, className, pullDistance = 80, children }: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false)
  const [pullY, setPullY] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const startY = useRef<number | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    // Only enable pull to refresh when scrolled to top
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      startY.current = e.touches[0].clientY
    } else {
      startY.current = null
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY.current === null || isRefreshing) return

    const currentY = e.touches[0].clientY
    const diff = currentY - startY.current

    // Only pull down, not up
    if (diff > 0) {
      setIsPulling(true)
      // Apply resistance to make it harder to pull
      const resistance = 0.4
      setPullY(Math.min(diff * resistance, pullDistance * 1.5))

      // Prevent default scrolling when pulling
      if (diff > 10) {
        e.preventDefault()
      }
    }
  }

  const handleTouchEnd = async () => {
    if (!isPulling || isRefreshing) return

    if (pullY >= pullDistance) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
      }
    }

    setPullY(0)
    setIsPulling(false)
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-auto", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="transition-transform duration-200 ease-out" style={{ transform: `translateY(${pullY}px)` }}>
        <div
          className={cn(
            "absolute left-1/2 -translate-x-1/2 -top-10 transition-opacity duration-200",
            isPulling || isRefreshing ? "opacity-100" : "opacity-0",
          )}
        >
          <Loader2
            className={cn(
              "h-6 w-6 text-primary",
              isRefreshing ? "animate-spin" : "animate-none",
              isPulling && !isRefreshing && "transition-transform duration-200",
            )}
            style={{
              transform: !isRefreshing ? `rotate(${Math.min((pullY / pullDistance) * 360, 360)}deg)` : undefined,
            }}
          />
        </div>
        {children}
      </div>
    </div>
  )
}
