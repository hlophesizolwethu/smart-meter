"use client"

import { DialogFooter } from "@/components/ui/dialog"

import { useEffect, useState } from "react"
import { Bell, Zap, CreditCard, History, Settings, LogOut, Wifi, Plus } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { useSmartMeter } from "@/hooks/use-smart-meter"
import { useTransactions } from "@/hooks/use-transactions"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function Dashboard() {
  const { user, loading: authLoading, signOut } = useAuth()
  const { meter, loading: meterLoading } = useSmartMeter(user?.id)
  const { transactions, loading: transactionsLoading } = useTransactions(user?.id)
  const router = useRouter()
  const supabase = createClient()

  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false)
  const [meterRegistration, setMeterRegistration] = useState({
    meterId: "",
    location: "",
  })
  const [registrationLoading, setRegistrationLoading] = useState(false)
  const [registrationError, setRegistrationError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  if (authLoading || meterLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  const formatDateTime = (date: string) => {
    const dateObj = new Date(date)
    return (
      dateObj.toLocaleDateString() +
      ", " +
      dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) +
      " AM"
    )
  }

  const recentTransactions = transactions.slice(0, 3)

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
  }

  // make sure a matching row exists in user_profiles
  const ensureUserProfile = async () => {
    const { data: profile } = await supabase.from("user_profiles").select("id").eq("id", user!.id).maybeSingle()

    if (!profile) {
      // create a minimal profile so FK won't fail
      await supabase.from("user_profiles").insert({
        id: user!.id,
        full_name: user!.user_metadata?.full_name ?? user!.email ?? "Unnamed",
      })
    }
  }

  const handleRegisterMeter = async () => {
    if (!user?.id || !meterRegistration.meterId.trim()) {
      setRegistrationError("Please enter a valid meter ID")
      return
    }

    await ensureUserProfile() // 🔑 make sure FK target exists

    setRegistrationLoading(true)
    setRegistrationError(null)

    try {
      // Check if meter ID already exists (ignore the error if no meter found)
      const { data: existingMeter } = await supabase
        .from("smart_meters")
        .select("id, user_id")
        .eq("meter_id", meterRegistration.meterId.trim())
        .maybeSingle()

      if (existingMeter) {
        throw new Error("This meter ID is already registered to another account")
      }

      // Create new smart meter entry
      const { data: newMeter, error: insertError } = await supabase
        .from("smart_meters")
        .insert({
          meter_id: meterRegistration.meterId.trim(),
          user_id: user.id,
          status: "connected",
          current_units: 0.0,
        })
        .select()
        .single()

      if (insertError) {
        console.error("Insert error:", insertError.message)
        throw new Error(`Failed to register meter: ${insertError.message}`)
      }

      // Create a transaction record for meter registration
      const { error: transactionError } = await supabase.from("transactions").insert({
        user_id: user.id,
        meter_id: newMeter.id,
        type: "meter-update",
        status: "completed",
        description: `Smart meter ${meterRegistration.meterId} registered successfully`,
      })

      if (transactionError) {
        console.error("Transaction error:", transactionError)
        // Don't throw here as the meter was successfully created
      }

      // Reset form and close dialog
      setMeterRegistration({ meterId: "", location: "" })
      setIsRegisterDialogOpen(false)

      // Refresh the page to show the new meter
      window.location.reload()
    } catch (err) {
      console.error("Registration error:", err)
      setRegistrationError(err instanceof Error ? err.message : "Failed to register smart meter. Please try again.")
    } finally {
      setRegistrationLoading(false)
    }
  }

  const testDatabaseConnection = async () => {
    try {
      console.log("Testing database connection...")
      const { data, error } = await supabase.from("smart_meters").select("count").limit(1)
      console.log("Database test result:", { data, error })

      if (error) {
        console.error("Database connection failed:", error)
        alert(`Database Error: ${error.message}`)
      } else {
        console.log("Database connection successful")
        alert("Database connection is working!")
      }
    } catch (err) {
      console.error("Database test failed:", err)
      alert(`Test failed: ${err}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Eswatini Electricity</h1>
            <p className="text-gray-600">Welcome back, {user.user_metadata?.full_name || user.email}</p>
          </div>
          <Button variant="outline" className="flex items-center gap-2 bg-transparent" onClick={handleSignOut}>
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Notifications */}
        {meter && (
          <Card className="mb-8 border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-blue-900">Smart Meter Registered</h4>
                  <p className="text-sm text-blue-700">
                    Your smart meter {meter.meter_id} has been successfully registered. You can now purchase electricity
                    units.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Smart Meter Status */}
        {meter ? (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Wifi className="w-5 h-5 text-green-600" />
                  Smart Meter Status
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Real-time</span>
                  <Badge variant={meter.status === "connected" ? "default" : "destructive"} className="bg-green-600">
                    {meter.status === "connected" ? "Connected" : "Disconnected"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Meter: {meter.meter_id}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{meter.current_units.toFixed(1)}</span>
                  <span className="text-lg text-gray-600">kWh</span>
                </div>
                <p className="text-sm text-gray-600">Current Units Available</p>
                <p className="text-xs text-gray-500">Last update: {formatDateTime(meter.last_update)}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8 border-orange-200 bg-orange-50">
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="font-medium text-orange-900 mb-2">No Smart Meter Found</h3>
                <p className="text-sm text-orange-700 mb-4">
                  You need to register a smart meter to start using the auto-load system.
                </p>
                <Dialog open={isRegisterDialogOpen} onOpenChange={setIsRegisterDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="bg-transparent">
                      <Plus className="w-4 h-4 mr-2" />
                      Register Smart Meter
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Register Smart Meter</DialogTitle>
                      <DialogDescription>
                        Enter your smart meter details to connect it to your account and enable auto-load functionality.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      {registrationError && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                          {registrationError}
                        </div>
                      )}
                      <div>
                        <Label htmlFor="meter-id">Smart Meter ID</Label>
                        <Input
                          id="meter-id"
                          placeholder="e.g., SSH-766488"
                          value={meterRegistration.meterId}
                          onChange={(e) => setMeterRegistration((prev) => ({ ...prev, meterId: e.target.value }))}
                          disabled={registrationLoading}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Find this ID on your smart meter display or installation certificate
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="location">Installation Location (Optional)</Label>
                        <Input
                          id="location"
                          placeholder="e.g., Main House, Apartment 2B"
                          value={meterRegistration.location}
                          onChange={(e) => setMeterRegistration((prev) => ({ ...prev, location: e.target.value }))}
                          disabled={registrationLoading}
                        />
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Note:</strong> Once registered, your meter will be connected to our auto-load system.
                          You can purchase electricity units that will be automatically loaded to your meter.
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={testDatabaseConnection}
                        className="w-full bg-transparent"
                        type="button"
                      >
                        Test Database Connection
                      </Button>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsRegisterDialogOpen(false)}
                        disabled={registrationLoading}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleRegisterMeter} disabled={registrationLoading}>
                        {registrationLoading ? "Registering..." : "Register Meter"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/buy-units">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="flex flex-col items-center text-center p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Buy Units</h3>
                <p className="text-sm text-gray-600">Purchase electricity</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/payment">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="flex flex-col items-center text-center p-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <CreditCard className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Payment</h3>
                <p className="text-sm text-gray-600">Manage payments</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/history">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="flex flex-col items-center text-center p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <History className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">History</h3>
                <p className="text-sm text-gray-600">View transactions</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/settings">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="flex flex-col items-center text-center p-6">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <Settings className="w-6 h-6 text-gray-600" />
                </div>
                <h3 className="font-semibold mb-2">Settings</h3>
                <p className="text-sm text-gray-600">Account settings</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Activity Preview */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest electricity purchases and meter updates</CardDescription>
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Loading transactions...</p>
              </div>
            ) : recentTransactions.length > 0 ? (
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between py-2 border-b">
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-gray-600">{transaction.units && `${transaction.units} kWh units`}</p>
                    </div>
                    <div className="text-right">
                      {transaction.amount && <p className="font-medium">E{transaction.amount.toFixed(2)}</p>}
                      <p className="text-sm text-gray-600">{new Date(transaction.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
                <div className="mt-4 pt-4 border-t">
                  <Link href="/history">
                    <Button variant="outline" className="w-full bg-transparent">
                      View All Activity
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No recent activity found.</p>
                {meter ? (
                  <Link href="/buy-units">
                    <Button className="mt-4">Make Your First Purchase</Button>
                  </Link>
                ) : (
                  <Dialog open={isRegisterDialogOpen} onOpenChange={setIsRegisterDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="mt-4">
                        <Plus className="w-4 h-4 mr-2" />
                        Register Smart Meter
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Register Smart Meter</DialogTitle>
                        <DialogDescription>
                          Enter your smart meter details to connect it to your account and enable auto-load
                          functionality.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        {registrationError && (
                          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                            {registrationError}
                          </div>
                        )}
                        <div>
                          <Label htmlFor="meter-id-2">Smart Meter ID</Label>
                          <Input
                            id="meter-id-2"
                            placeholder="e.g., SSH-766488"
                            value={meterRegistration.meterId}
                            onChange={(e) => setMeterRegistration((prev) => ({ ...prev, meterId: e.target.value }))}
                            disabled={registrationLoading}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Find this ID on your smart meter display or installation certificate
                          </p>
                        </div>
                        <div>
                          <Label htmlFor="location-2">Installation Location (Optional)</Label>
                          <Input
                            id="location-2"
                            placeholder="e.g., Main House, Apartment 2B"
                            value={meterRegistration.location}
                            onChange={(e) => setMeterRegistration((prev) => ({ ...prev, location: e.target.value }))}
                            disabled={registrationLoading}
                          />
                        </div>
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Note:</strong> Once registered, your meter will be connected to our auto-load
                            system. You can purchase electricity units that will be automatically loaded to your meter.
                          </p>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsRegisterDialogOpen(false)}
                          disabled={registrationLoading}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleRegisterMeter} disabled={registrationLoading}>
                          {registrationLoading ? "Registering..." : "Register Meter"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
