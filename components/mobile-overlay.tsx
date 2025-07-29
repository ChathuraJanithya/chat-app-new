"use client"

import { useSidebarContext } from "@/components/ui/sidebar"

export function MobileOverlay() {
  const { isOpen, setIsOpen } = useSidebarContext()

  if (!isOpen) return null

  return (
    <div className="md:hidden fixed inset-0 z-10 bg-black/50" onClick={() => setIsOpen(false)} aria-hidden="true" />
  )
}
