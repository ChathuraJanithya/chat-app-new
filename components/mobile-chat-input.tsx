"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Paperclip, Send, Mic, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface MobileChatInputProps {
  onSendMessage: (message: string) => void
  placeholder?: string
  disabled?: boolean
  autoFocus?: boolean
}

export function MobileChatInput({
  onSendMessage,
  placeholder = "Message...",
  disabled = false,
  autoFocus = false,
}: MobileChatInputProps) {
  const [inputValue, setInputValue] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.style.height = "auto"
    const newHeight = Math.min(textarea.scrollHeight, 120) // Max height of 120px
    textarea.style.height = `${newHeight}px`
  }, [inputValue])

  // Auto-focus when requested and not disabled
  useEffect(() => {
    if (autoFocus && !disabled && textareaRef.current) {
      // Small delay to ensure UI has updated
      setTimeout(() => {
        textareaRef.current?.focus()
      }, 100)
    }
  }, [autoFocus, disabled])

  const handleSend = () => {
    if (!inputValue.trim() || disabled) return
    onSendMessage(inputValue.trim())
    setInputValue("")

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div
      className={cn(
        "p-2 bg-background/80 backdrop-blur-sm transition-all duration-200 border-t",
        isFocused && "pb-4", // Add more padding when focused to accommodate keyboard
      )}
    >
      <div className="relative rounded-full border bg-background shadow-sm transition-all duration-200">
        {inputValue && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full"
            onClick={() => setInputValue("")}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear input</span>
          </Button>
        )}

        <Textarea
          ref={textareaRef}
          placeholder={placeholder}
          className={cn(
            "min-h-10 max-h-32 resize-none rounded-full border-0 focus-visible:ring-0 py-2",
            inputValue ? "pl-10 pr-20" : "pl-4 pr-20",
          )}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
        />

        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {!inputValue && (
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <Paperclip className="h-4 w-4" />
              <span className="sr-only">Attach file</span>
            </Button>
          )}

          {!inputValue && (
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <Mic className="h-4 w-4" />
              <span className="sr-only">Voice message</span>
            </Button>
          )}

          <Button
            size="icon"
            className={cn("h-8 w-8 rounded-full", !inputValue.trim() && "opacity-50")}
            onClick={handleSend}
            disabled={!inputValue.trim() || disabled}
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
