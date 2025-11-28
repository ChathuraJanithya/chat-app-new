import { cn } from "@/lib/utils";
import Markdown from "react-markdown";
import { formatDistanceToNow } from "date-fns";
import type { ChatMessage } from "@/types/chat";
import { useChat } from "@/context/chat-context";
import { ThumbsUp, ThumbsDown, X } from "lucide-react";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "./ui/drawer";
import { Textarea } from "./ui/textarea";

interface ChatMessageProps {
  message: ChatMessage;
  isLastMessage?: boolean;
}

export function ChatMessageItem({ message, isLastMessage }: ChatMessageProps) {
  const isUser = message.role === "user";
  const [reaction, setReaction] = useState<"up" | "down" | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<"up" | "down" | null>(null);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [additionalFeedback, setAdditionalFeedback] = useState("");
  const isMobile = useIsMobile();

  // Format the timestamp to show how long ago the message was sent
  const timeAgo = formatDistanceToNow(new Date(message.timestamp), {
    addSuffix: true,
  });

  const { isStreaming } = useChat();

  const positiveReasons = [
    "Factually correct",
    "Easy to understand",
    "Informative",
    "Creative/interesting",
    "Other",
  ];

  const negativeReasons = [
    "Factually incorrect",
    "Hard to understand",
    "Not informative",
    "Not creative",
    "Offensive/inappropriate",
    "Other",
  ];

  const handleReaction = (type: "up" | "down") => {
    setFeedbackType(type);
    setFeedbackOpen(true);
    setSelectedReasons([]);
    setAdditionalFeedback("");
  };

  const toggleReason = (reason: string) => {
    setSelectedReasons((prev) =>
      prev.includes(reason)
        ? prev.filter((r) => r !== reason)
        : [...prev, reason]
    );
  };

  const handleSubmitFeedback = () => {
    // Toggle reaction: if clicking the same one, remove it; otherwise set new one
    setReaction(feedbackType);

    // TODO: You can add API call here to save feedback to backend
    console.log(`Message ${message.id} received ${feedbackType} reaction`, {
      reasons: selectedReasons,
      additionalFeedback,
    });
    toast.success("Thank you for your feedback!");

    setFeedbackOpen(false);
  };

  const handleCloseFeedback = () => {
    setFeedbackOpen(false);
    setSelectedReasons([]);
    setAdditionalFeedback("");
  };

  const FeedbackContent = () => (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        {feedbackType === "up"
          ? "Why did you choose this rating? (optional)"
          : "What was the issue with this response?"}
      </div>

      <div className="flex flex-wrap gap-2">
        {(feedbackType === "up" ? positiveReasons : negativeReasons).map(
          (reason) => (
            <Button
              key={reason}
              variant={selectedReasons.includes(reason) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleReason(reason)}
              className="rounded-full"
            >
              {reason}
            </Button>
          )
        )}
      </div>

      <Textarea
        placeholder="Provide additional feedback"
        value={additionalFeedback}
        onChange={(e) => setAdditionalFeedback(e.target.value)}
        className="min-h-[100px] resize-none"
      />

      <div className="text-xs text-muted-foreground">
        Data is reviewed by trained service providers after it's disconnected
        from your account.
      </div>

      <Button
        onClick={handleSubmitFeedback}
        onKeyDown={handleSubmitFeedback}
        className="w-full"
        disabled={selectedReasons.length === 0 && !additionalFeedback.trim()}
      >
        Submit
      </Button>
    </div>
  );

  return (
    <div
      className={cn(
        "flex w-full items-start gap-2 py-2 animate-in fade-in-0 slide-in-from-bottom-3 duration-300",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "relative flex max-w-[85%] sm:max-w-[75%] flex-col gap-1 rounded-2xl px-4 py-2",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-none"
            : "bg-transparent rounded-tl-none"
        )}
      >
        {/*  {isStreaming && isLastMessage ? (
          <AnimatedStreamingMessageVariant
            message={message}
            isStreaming={isStreaming}
            variant="typewriter"
          />
        ) : ( */}
        <div className="prose prose-invert text-sm sm:text-base whitespace-pre-wrap">
          {message.content ? (
            <Markdown>{message.content}</Markdown>
          ) : (
            <span className="text-muted-foreground italic">
              I apologize, but I'm having trouble generating a response right
              now. Please try again.
            </span>
          )}
        </div>
        {/*     )} */}
        <div className="flex items-center justify-between gap-2">
          {!isStreaming && (
            <span className="text-[10px] opacity-70 mt-1">{timeAgo}</span>
          )}

          {/* Thumbs up/down for assistant messages */}
          {!isUser && !isStreaming && (
            <div className="flex items-center gap-1 ml-auto">
              <Button
                variant={"ghost"}
                onClick={() => handleReaction("up")}
                className={cn(
                  "p-1  transition-colors",
                  reaction === "up" && " text-green-500"
                )}
                aria-label="Thumbs up"
              >
                <ThumbsUp className="h-5 w-5" />
              </Button>
              <Button
                variant={"ghost"}
                onClick={() => handleReaction("down")}
                className={cn(
                  " p-1 transition-colors",
                  reaction === "down" && " text-red-500"
                )}
                aria-label="Thumbs down"
              >
                <ThumbsDown className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Feedback Dialog for Desktop */}
      {!isMobile && (
        <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
          <DialogContent className="sm:max-w-[425px] ">
            <DialogHeader>
              <DialogTitle>
                {feedbackType === "up"
                  ? "Why did you like this response?"
                  : "What went wrong?"}
              </DialogTitle>
            </DialogHeader>
            <FeedbackContent />
          </DialogContent>
        </Dialog>
      )}

      {/* Feedback Drawer for Mobile */}
      {isMobile && (
        <Drawer open={feedbackOpen} onOpenChange={setFeedbackOpen}>
          <DrawerContent className="rounded-t-[50px] ">
            <DrawerHeader className="text-left p-5">
              <div className="flex items-center justify-between">
                <DrawerTitle>
                  {feedbackType === "up"
                    ? "Why did you like this response?"
                    : "What went wrong?"}
                </DrawerTitle>
                <DrawerClose asChild>
                  {/* <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCloseFeedback}
                  >
                    <X className="h-4 w-4" />
                  </Button> */}
                </DrawerClose>
              </div>
            </DrawerHeader>
            <div className="px-4 pb-4">
              <FeedbackContent />
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
}
