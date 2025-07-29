import { supabase, isSupabaseConfigured } from "@/lib/supabase"

export async function checkDatabaseSetup(): Promise<{
  isSetup: boolean
  error?: string
  missingTables?: string[]
}> {
  // If Supabase is not configured, return as not setup
  if (!isSupabaseConfigured) {
    return {
      isSetup: false,
      error: "Supabase environment variables not configured. Anonymous chat will work without authentication.",
      missingTables: ["profiles", "chats", "messages"],
    }
  }

  try {
    // Check if tables exist by trying to query them
    const tables = ["profiles", "chats", "messages"]
    const missingTables: string[] = []

    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select("count").limit(1)
        if (error) {
          console.error(`Table ${table} check failed:`, error)
          missingTables.push(table)
        }
      } catch (err) {
        console.error(`Table ${table} access failed:`, err)
        missingTables.push(table)
      }
    }

    if (missingTables.length > 0) {
      return {
        isSetup: false,
        error: `Missing tables: ${missingTables.join(", ")}`,
        missingTables,
      }
    }

    return { isSetup: true }
  } catch (error) {
    return {
      isSetup: false,
      error: `Database check failed: ${error}`,
    }
  }
}

export async function initializeUserProfile(userId: string, email: string, fullName?: string) {
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured, skipping profile initialization")
    return null
  }

  try {
    // Check if profile already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 is "not found" error, which is expected for new users
      console.error("Error checking existing profile:", checkError)
      throw checkError
    }

    if (existingProfile) {
      console.log("Profile already exists for user:", userId)
      return existingProfile
    }

    // Create new profile
    const { data: newProfile, error: insertError } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        email,
        full_name: fullName || email,
      })
      .select()
      .single()

    if (insertError) {
      console.error("Error creating profile:", insertError)
      throw insertError
    }

    console.log("Profile created successfully:", newProfile)
    return newProfile
  } catch (error) {
    console.error("Error initializing user profile:", error)
    throw error
  }
}
