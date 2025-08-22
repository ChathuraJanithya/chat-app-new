import type { ChatMessage } from "@/types/chat";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import Markdown from "react-markdown";
import { useChat } from "@/context/chat-context";
import {
  AnimatedStreamingMessage,
  AnimatedStreamingMessageVariant,
} from "./animated-streaming-message";

interface ChatMessageProps {
  message: ChatMessage;
  isLastMessage?: boolean;
}

export function ChatMessageItem({ message, isLastMessage }: ChatMessageProps) {
  const isUser = message.role === "user";

  // Format the timestamp to show how long ago the message was sent
  const timeAgo = formatDistanceToNow(new Date(message.timestamp), {
    addSuffix: true,
  });

  const { isStreaming } = useChat();

  return (
    <div
      className={cn(
        "flex w-full items-start gap-2 py-2 animate-in fade-in-0 slide-in-from-bottom-3 duration-300",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "flex max-w-[85%] sm:max-w-[75%] flex-col gap-1 rounded-2xl px-4 py-2",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-none"
            : "bg-transparent rounded-tl-none"
        )}
      >
        {isStreaming && isLastMessage ? (
          <AnimatedStreamingMessageVariant
            message={message}
            isStreaming={isStreaming}
            variant="typewriter"
          />
        ) : (
          <div className="prose prose-invert text-sm sm:text-base whitespace-pre-wrap">
            <Markdown>{message.content}</Markdown>
          </div>
        )}
        {!isStreaming && (
          <span className="text-[10px] opacity-70 self-end mt-1">
            {timeAgo}
          </span>
        )}
      </div>
    </div>
  );
}
