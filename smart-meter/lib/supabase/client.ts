import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "./database.types"

/**
 * Creates a browser-side Supabase client.
 * Requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
 * to be present in your environment.
 */
export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Missing Supabase environment variables. " +
        "Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    )
  }

  return createClientComponentClient<Database>({
    supabaseUrl,
    supabaseKey,
  })
}
