"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/database.types"

type Transaction = Database["public"]["Tables"]["transactions"]["Row"] & {
  payment_methods?: Database["public"]["Tables"]["payment_methods"]["Row"]
}

export function useTransactions(userId: string | undefined) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!userId) return

    const fetchTransactions = async () => {
      try {
        const { data, error } = await supabase
          .from("transactions")
          .select(`
            *,
            payment_methods (
              name,
              type
            )
          `)
          .eq("user_id", userId)
          .order("created_at", { ascending: false })

        if (error) throw error
        setTransactions(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()

    // Set up real-time subscription
    const subscription = supabase
      .channel("transactions")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "transactions",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchTransactions()
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [userId, supabase])

  const createTransaction = async (transaction: Database["public"]["Tables"]["transactions"]["Insert"]) => {
    try {
      const { data, error } = await supabase.from("transactions").insert(transaction).select().single()

      if (error) throw error
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create transaction")
      return null
    }
  }

  return { transactions, loading, error, createTransaction }
}
