"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/database.types"

type PaymentMethod = Database["public"]["Tables"]["payment_methods"]["Row"]

export function usePaymentMethods(userId: string | undefined) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!userId) return

    const fetchPaymentMethods = async () => {
      try {
        const { data, error } = await supabase
          .from("payment_methods")
          .select("*")
          .eq("user_id", userId)
          .eq("is_active", true)
          .order("is_default", { ascending: false })

        if (error) throw error
        setPaymentMethods(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchPaymentMethods()
  }, [userId, supabase])

  const addPaymentMethod = async (method: Omit<PaymentMethod, "id" | "created_at" | "updated_at">) => {
    try {
      const { data, error } = await supabase.from("payment_methods").insert(method).select().single()

      if (error) throw error
      setPaymentMethods((prev) => [...prev, data])
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add payment method")
      return null
    }
  }

  const updatePaymentMethod = async (id: string, updates: Partial<PaymentMethod>) => {
    try {
      const { data, error } = await supabase.from("payment_methods").update(updates).eq("id", id).select().single()

      if (error) throw error
      setPaymentMethods((prev) => prev.map((pm) => (pm.id === id ? data : pm)))
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update payment method")
      return null
    }
  }

  const deletePaymentMethod = async (id: string) => {
    try {
      const { error } = await supabase.from("payment_methods").update({ is_active: false }).eq("id", id)

      if (error) throw error
      setPaymentMethods((prev) => prev.filter((pm) => pm.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete payment method")
    }
  }

  const setDefaultPaymentMethod = async (id: string) => {
    try {
      // First, unset all defaults
      await supabase.from("payment_methods").update({ is_default: false }).eq("user_id", userId)

      // Then set the new default
      const { error } = await supabase.from("payment_methods").update({ is_default: true }).eq("id", id)

      if (error) throw error

      setPaymentMethods((prev) =>
        prev.map((pm) => ({
          ...pm,
          is_default: pm.id === id,
        })),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set default payment method")
    }
  }

  return {
    paymentMethods,
    loading,
    error,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    setDefaultPaymentMethod,
  }
}
