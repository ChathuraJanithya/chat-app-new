"use client";

import {
  AlertTriangle,
  LogIn,
  UserPlus,
  CheckCircle,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAnonymousChat } from "@/context/anonymous-chat-context";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { CONST_VARIABLES } from "@/data/chat-data";

export function MessageLimitBanner() {
  const { maxMessages, canSendMessage, getCurrentMessageCount } =
    useAnonymousChat();
  const { user } = useAuth();

  const [showConversionSuccess, setShowConversionSuccess] = useState(false);

  const current = getCurrentMessageCount();
  const max = CONST_VARIABLES.MAX_MESSAGE_COUNT;

  const isLimitReached = current >= max;

  // Don't show banner if user is logged in (unless showing conversion success)
  if (user && !showConversionSuccess) return null;

  const remainingMessages = max - current;

  // Show conversion success
  if (showConversionSuccess) {
    return (
      <Alert className="mb-4 border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
        <CheckCircle className="h-4 w-4" />
        <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <span>
            🎉 Welcome! Your anonymous chat has been saved to your account. You
            now have unlimited messaging!
          </span>
          <Button
            size="sm"
            variant="outline"
            className="bg-white text-green-800 border-green-300 hover:bg-green-50"
            onClick={() => setShowConversionSuccess(false)}
          >
            Got it
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Show warning when approaching limit
  if (!isLimitReached && remainingMessages <= 2) {
    return (
      <Alert className="mb-4 border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          You have {remainingMessages} message
          {remainingMessages !== 1 ? "s" : ""} remaining in this anonymous
          session.{" "}
          <Link href="/login" className="underline font-medium">
            Log in
          </Link>{" "}
          to continue this conversation with unlimited messaging.
        </AlertDescription>
      </Alert>
    );
  }

  // Show limit reached
  if (isLimitReached || !canSendMessage) {
    return (
      <Alert className="mb-4 border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
        <MessageSquare className="h-4 w-4" />
        <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <span>
            You've reached the {maxMessages} message limit for anonymous chats.
            Sign in to continue this conversation and get unlimited messaging.
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="bg-white text-red-800 border-red-300 hover:bg-red-50"
              asChild
            >
              <Link href="/login">
                <LogIn className="h-4 w-4 mr-1" />
                Log In
              </Link>
            </Button>
            <Button
              size="sm"
              className="bg-red-600 text-white hover:bg-red-700"
              asChild
            >
              <Link href="/signup">
                <UserPlus className="h-4 w-4 mr-1" />
                Sign Up
              </Link>
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
