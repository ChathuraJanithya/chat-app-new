"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react";
interface ApiStatus {
  isConfigured: boolean;
  isReachable: boolean;
  error?: string;
  lastChecked?: Date;
}

export function ApiStatus() {
  const [status, setStatus] = useState<ApiStatus>({
    isConfigured: false,
    isReachable: false,
  });
  const [isChecking, setIsChecking] = useState(false);

  const checkApiStatus = async () => {
    setIsChecking(true);

    try {
      // Check if environment variables are configured
      const apiUrl = process.env.NEXT_PUBLIC_CHAT_API_URL;
      const hasApiKey = !!process.env.CHAT_API_KEY; // We can't access server-side env vars directly

      if (!apiUrl) {
        setStatus({
          isConfigured: false,
          isReachable: false,
          error: "NEXT_PUBLIC_CHAT_API_URL not configured",
          lastChecked: new Date(),
        });
        return;
      }

      // Test API connectivity with a simple request
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId: "test-connection",
          message: "test",
        }),
      });

      if (response.ok) {
        setStatus({
          isConfigured: true,
          isReachable: true,
          lastChecked: new Date(),
        });
      } else {
        const errorData = await response.json();
        setStatus({
          isConfigured: true,
          isReachable: false,
          error: errorData.error || `HTTP ${response.status}`,
          lastChecked: new Date(),
        });
      }
    } catch (error) {
      setStatus({
        isConfigured: true,
        isReachable: false,
        error: error instanceof Error ? error.message : "Unknown error",
        lastChecked: new Date(),
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkApiStatus();
  }, []);

  const getStatusIcon = () => {
    if (isChecking) return <RefreshCw className="h-4 w-4 animate-spin" />;
    if (!status.isConfigured)
      return <XCircle className="h-4 w-4 text-red-500" />;
    if (status.isReachable)
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <AlertCircle className="h-4 w-4 text-yellow-500" />;
  };

  const getStatusText = () => {
    if (isChecking) return "Checking...";
    if (!status.isConfigured) return "Not Configured";
    if (status.isReachable) return "Connected";
    return "Connection Error";
  };

  const getStatusColor = () => {
    if (!status.isConfigured) return "destructive";
    if (status.isReachable) return "default";
    return "secondary";
  };

  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Chat API Status
        </CardTitle>
        <CardDescription>
          Connection status to the external chat API
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status:</span>
          <Badge variant={getStatusColor()}>{getStatusText()}</Badge>
        </div>

        {status.error && (
          <div className="p-3 bg-red-50 dark:bg-red-950 rounded-md">
            <p className="text-sm text-red-800 dark:text-red-200">
              {status.error}
            </p>
          </div>
        )}

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>API URL:</span>
            <span className="text-muted-foreground">
              {process.env.NEXT_PUBLIC_CHAT_API_URL || "Not set"}
            </span>
          </div>
          {status.lastChecked && (
            <div className="flex justify-between">
              <span>Last checked:</span>
              <span className="text-muted-foreground">
                {status.lastChecked.toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>

        <Button
          onClick={checkApiStatus}
          disabled={isChecking}
          className="w-full"
        >
          {isChecking ? "Checking..." : "Check Connection"}
        </Button>
      </CardContent>
    </Card>
  );
}
