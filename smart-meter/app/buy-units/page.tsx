"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Zap, CreditCard, Smartphone, Building2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import mqtt from "mqtt"


export default function BuyUnits() {
  const [amount, setAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [autoLoad, setAutoLoad] = useState(true)
  const [threshold, setThreshold] = useState("10")
  const [feedback, setFeedback] = useState("")

  const quickAmounts = [50, 100, 200, 500]
  const unitRate = 5.0 // E5.00 per kWh

  const topic = "smartmeter/reload"
  const [client, setClient] = useState<any>(null)

  useEffect(() => {
    const mqttClient = mqtt.connect("wss://broker.hivemq.com:8000/mqtt")
    mqttClient.on("connect", () => {
      console.log("✅ MQTT connected")
    })
    mqttClient.on("error", (err) => {
      console.error("❌ MQTT error:", err)
    })
    setClient(mqttClient)

    return () => {
      mqttClient.end()
    }
  }, [])


  const calculateUnits = (amount: number) => {
    return (amount / unitRate).toFixed(1)
  }

  const handlePurchase = () => {
    // Handle purchase logic here
    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0 || !client?.connected) {
      setFeedback("Please enter a valid amount and ensure MQTT is connected.")
      return
    }

    const unitsToSend = calculateUnits(parsedAmount)
    client.publish(topic, unitsToSend)
    setFeedback(`✅ Sent ${unitsToSend} kWh to your smart meter.`)
    console.log("Processing purchase:", { amount, paymentMethod, autoLoad })
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
            <h1 className="text-2xl font-bold text-gray-900">Buy Units</h1>
            <p className="text-gray-600">Purchase electricity for your smart meter</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Purchase Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Purchase Amount
                </CardTitle>
                <CardDescription>Current rate: E{unitRate.toFixed(2)} per kWh</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="amount">Amount (Emalangeni)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="text-lg"
                  />
                  {amount && (
                    <p className="text-sm text-gray-600 mt-1">
                      ≈ {calculateUnits(Number.parseFloat(amount))} kWh units
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium">Quick amounts</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {quickAmounts.map((quickAmount) => (
                      <Button
                        key={quickAmount}
                        variant="outline"
                        onClick={() => setAmount(quickAmount.toString())}
                        className="justify-between"
                      >
                        <span>E{quickAmount}</span>
                        <span className="text-xs text-gray-500">{calculateUnits(quickAmount)} kWh</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Auto-load Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Auto-load Settings</CardTitle>
                <CardDescription>Automatically purchase units when balance is low</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-load">Enable Auto-load</Label>
                    <p className="text-sm text-gray-600">Automatically purchase units when threshold is reached</p>
                  </div>
                  <Switch id="auto-load" checked={autoLoad} onCheckedChange={setAutoLoad} />
                </div>

                {autoLoad && (
                  <div>
                    <Label htmlFor="threshold">Low balance threshold (kWh)</Label>
                    <Input
                      id="threshold"
                      type="number"
                      value={threshold}
                      onChange={(e) => setThreshold(e.target.value)}
                      placeholder="10"
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      Auto-purchase will trigger when units drop below this amount
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="card" id="card" />
                    <CreditCard className="w-5 h-5" />
                    <Label htmlFor="card" className="flex-1">
                      Credit/Debit Card
                    </Label>
                    <Badge variant="secondary">Default</Badge>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="mobile" id="mobile" />
                    <Smartphone className="w-5 h-5" />
                    <Label htmlFor="mobile" className="flex-1">
                      Mobile Money
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="bank" id="bank" />
                    <Building2 className="w-5 h-5" />
                    <Label htmlFor="bank" className="flex-1">
                      Bank Transfer
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          {/* Purchase Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Purchase Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span className="font-medium">E{amount || "0.00"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Units:</span>
                    <span className="font-medium">
                      {amount ? calculateUnits(Number.parseFloat(amount)) : "0.0"} kWh
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rate:</span>
                    <span>E{unitRate.toFixed(2)} per kWh</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Processing fee:</span>
                    <span>E2.00</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>E{amount ? (Number.parseFloat(amount) + 2).toFixed(2) : "2.00"}</span>
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <h4 className="font-medium">Meter Information</h4>
                  <p className="text-sm text-gray-600">SSH-766488</p>
                  <p className="text-sm text-gray-600">Current balance: 0.0 kWh</p>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handlePurchase}
                  disabled={!amount || Number.parseFloat(amount) <= 0}
                >
                  Purchase Units
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  Units will be automatically loaded to your smart meter within 30 seconds
                </p>
              </CardContent>
            </Card>

            {/* Recent Purchases */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Purchases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <div>
                      <p className="font-medium">50 kWh</p>
                      <p className="text-sm text-gray-600">Auto-load</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">E250.00</p>
                      <p className="text-sm text-gray-600">2h ago</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <div>
                      <p className="font-medium">25 kWh</p>
                      <p className="text-sm text-gray-600">Manual</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">E125.00</p>
                      <p className="text-sm text-gray-600">1d ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
