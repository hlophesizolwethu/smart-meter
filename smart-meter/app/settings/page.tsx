"use client"

import { useState } from "react"
import { ArrowLeft, User, Bell, Shield, Smartphone } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

export default function Settings() {
  const [profile, setProfile] = useState({
    name: "Furman Dlamini",
    email: "furman.dlamini@email.com",
    phone: "+268 7612 3456",
    address: "123 Main Street, Mbabane, Eswatini",
    meterId: "SSH-766488",
  })

  const [notifications, setNotifications] = useState({
    lowBalance: true,
    autoLoad: true,
    purchases: true,
    systemUpdates: false,
    marketing: false,
  })

  const [autoLoad, setAutoLoad] = useState({
    enabled: true,
    threshold: 10,
    amount: 100,
    maxDaily: 500,
  })

  const handleProfileUpdate = () => {
    console.log("Updating profile:", profile)
  }

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4 max-w-7xl mx-auto">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">Manage your account and preferences</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
              <CardDescription>Update your personal information and contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile((prev) => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile((prev) => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="meter-id">Smart Meter ID</Label>
                  <Input id="meter-id" value={profile.meterId} disabled className="bg-gray-50" />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={profile.address}
                  onChange={(e) => setProfile((prev) => ({ ...prev, address: e.target.value }))}
                />
              </div>
              <Button onClick={handleProfileUpdate}>Update Profile</Button>
            </CardContent>
          </Card>

          {/* Smart Meter Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Smart Meter Configuration
              </CardTitle>
              <CardDescription>Configure your smart meter connection and monitoring</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Meter Status</h4>
                  <p className="text-sm text-gray-600">SSH-766488 - Connected</p>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="update-frequency">Update Frequency</Label>
                  <Select defaultValue="30">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">Every 15 seconds</SelectItem>
                      <SelectItem value="30">Every 30 seconds</SelectItem>
                      <SelectItem value="60">Every minute</SelectItem>
                      <SelectItem value="300">Every 5 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="data-retention">Data Retention</Label>
                  <Select defaultValue="365">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                      <SelectItem value="unlimited">Unlimited</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Auto-load Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Auto-load Configuration</CardTitle>
              <CardDescription>Configure automatic electricity purchases when balance is low</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-load-enabled">Enable Auto-load</Label>
                  <p className="text-sm text-gray-600">Automatically purchase units when balance is low</p>
                </div>
                <Switch
                  id="auto-load-enabled"
                  checked={autoLoad.enabled}
                  onCheckedChange={(checked) => setAutoLoad((prev) => ({ ...prev, enabled: checked }))}
                />
              </div>

              {autoLoad.enabled && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="threshold">Low Balance Threshold (kWh)</Label>
                      <Input
                        id="threshold"
                        type="number"
                        value={autoLoad.threshold}
                        onChange={(e) =>
                          setAutoLoad((prev) => ({ ...prev, threshold: Number.parseInt(e.target.value) }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="auto-amount">Auto-purchase Amount (E)</Label>
                      <Input
                        id="auto-amount"
                        type="number"
                        value={autoLoad.amount}
                        onChange={(e) => setAutoLoad((prev) => ({ ...prev, amount: Number.parseInt(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="max-daily">Daily Limit (E)</Label>
                      <Input
                        id="max-daily"
                        type="number"
                        value={autoLoad.maxDaily}
                        onChange={(e) =>
                          setAutoLoad((prev) => ({ ...prev, maxDaily: Number.parseInt(e.target.value) }))
                        }
                      />
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      When your balance drops below {autoLoad.threshold} kWh, we'll automatically purchase E
                      {autoLoad.amount} worth of electricity (≈{(autoLoad.amount / 5).toFixed(1)} kWh) using your
                      default payment method.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Choose what notifications you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="low-balance">Low Balance Alerts</Label>
                    <p className="text-sm text-gray-600">Get notified when your electricity balance is low</p>
                  </div>
                  <Switch
                    id="low-balance"
                    checked={notifications.lowBalance}
                    onCheckedChange={(checked) => handleNotificationChange("lowBalance", checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-load-notif">Auto-load Notifications</Label>
                    <p className="text-sm text-gray-600">Get notified when auto-load purchases are made</p>
                  </div>
                  <Switch
                    id="auto-load-notif"
                    checked={notifications.autoLoad}
                    onCheckedChange={(checked) => handleNotificationChange("autoLoad", checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="purchases">Purchase Confirmations</Label>
                    <p className="text-sm text-gray-600">Get notified when electricity purchases are completed</p>
                  </div>
                  <Switch
                    id="purchases"
                    checked={notifications.purchases}
                    onCheckedChange={(checked) => handleNotificationChange("purchases", checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="system-updates">System Updates</Label>
                    <p className="text-sm text-gray-600">Get notified about system maintenance and updates</p>
                  </div>
                  <Switch
                    id="system-updates"
                    checked={notifications.systemUpdates}
                    onCheckedChange={(checked) => handleNotificationChange("systemUpdates", checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="marketing">Marketing Communications</Label>
                    <p className="text-sm text-gray-600">Receive promotional offers and news</p>
                  </div>
                  <Switch
                    id="marketing"
                    checked={notifications.marketing}
                    onCheckedChange={(checked) => handleNotificationChange("marketing", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security & Privacy
              </CardTitle>
              <CardDescription>Manage your account security and privacy settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  Change Password
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  Enable Two-Factor Authentication
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  Download My Data
                </Button>
                <Separator />
                <Button variant="destructive" className="w-full">
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
