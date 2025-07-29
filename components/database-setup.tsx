"use client"

import { useState } from "react"
import { AlertTriangle, Database, RefreshCw, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/context/auth-context"

export function DatabaseSetup() {
  const { databaseReady, databaseError, retryDatabaseSetup } = useAuth()
  const [isRetrying, setIsRetrying] = useState(false)

  const handleRetry = async () => {
    setIsRetrying(true)
    try {
      await retryDatabaseSetup()
    } finally {
      setIsRetrying(false)
    }
  }

  if (databaseReady) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-background/95">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900">
            <Database className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <CardTitle>Database Setup Required</CardTitle>
          <CardDescription>
            The database tables need to be created before you can use the chat application.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {databaseError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm">{databaseError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <h4 className="text-sm font-medium">Setup Instructions:</h4>
            <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
              <li>Go to your Supabase project dashboard</li>
              <li>Navigate to the SQL Editor</li>
              <li>Run the database setup script (setup-database-v2.sql)</li>
              <li>Click the retry button below</li>
            </ol>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleRetry} disabled={isRetrying} className="flex-1">
              {isRetrying ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry
                </>
              )}
            </Button>
          </div>

          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Once the database is set up, the application will automatically continue.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
