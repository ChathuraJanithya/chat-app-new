"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/context/auth-context"
import { supabase } from "@/lib/supabase"
import { ApiStatus } from "@/components/api-status"

export function DebugInfo() {
  const { user, session } = useAuth()
  const [isVisible, setIsVisible] = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)

  const testDatabaseConnection = async () => {
    try {
      const { data, error } = await supabase.from("chats").select("count").limit(1)

      if (error) {
        setTestResult(`Database Error: ${error.message}`)
      } else {
        setTestResult("Database connection successful!")
      }
    } catch (err) {
      setTestResult(`Connection Error: ${err}`)
    }
  }

  if (process.env.NODE_ENV === "production") {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button variant="outline" size="sm" onClick={() => setIsVisible(!isVisible)} className="mb-2">
        Debug Info
      </Button>

      {isVisible && (
        <div className="space-y-4">
          <Card className="w-80 max-h-96 overflow-auto">
            <CardHeader>
              <CardTitle className="text-sm">Debug Information</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <div>
                <strong>User:</strong> {user ? "Authenticated" : "Not authenticated"}
              </div>
              {user && (
                <>
                  <div>
                    <strong>User ID:</strong> {user.id}
                  </div>
                  <div>
                    <strong>Email:</strong> {user.email}
                  </div>
                  <div>
                    <strong>Session:</strong> {session ? "Active" : "None"}
                  </div>
                </>
              )}
              <div>
                <Button size="sm" onClick={testDatabaseConnection}>
                  Test Database
                </Button>
              </div>
              {testResult && <div className="p-2 bg-muted rounded text-xs">{testResult}</div>}
            </CardContent>
          </Card>

          <ApiStatus />
        </div>
      )}
    </div>
  )
}
