"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/database.types"

type SmartMeter = Database["public"]["Tables"]["smart_meters"]["Row"]

export function useSmartMeter(userId: string | undefined) {
  const [meter, setMeter] = useState<SmartMeter | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!userId) return

    const fetchMeter = async () => {
      try {
        setLoading(true)

        const { data, error } = await supabase.from("smart_meters").select("*").eq("user_id", userId).maybeSingle()

        if (error) {
          // If the table itself is missing, show an actionable message
          if (error.message.includes("does not exist")) {
            setError(
              "Database not initialised. Run the migration script (01-create-tables.sql) in Supabase → SQL to create the smart_meters table.",
            )
            return
          }
          throw error
        }

        setMeter(data ?? null)
        setError(null)
      } catch (err) {
        console.error("Smart meter error:", err)
        setError(err instanceof Error ? err.message : "Unexpected error")
      } finally {
        setLoading(false)
      }
    }

    fetchMeter()

    // Set up real-time subscription
    const subscription = supabase
      .channel("smart_meters")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "smart_meters",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setMeter(payload.new as SmartMeter)
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [userId, supabase])

  const updateMeterUnits = async (units: number) => {
    if (!meter) return

    const { error } = await supabase
      .from("smart_meters")
      .update({
        current_units: units,
        last_update: new Date().toISOString(),
      })
      .eq("id", meter.id)

    if (error) {
      setError(error.message)
    }
  }

  return { meter, loading, error, updateMeterUnits }
}
