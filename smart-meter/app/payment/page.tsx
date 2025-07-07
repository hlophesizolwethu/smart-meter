"use client"

import { useState } from "react"
import { ArrowLeft, CreditCard, Smartphone, Building2, Plus, Edit, Trash2, CheckCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { usePaymentMethods } from "@/hooks/use-payment-methods"

interface PaymentMethod {
  id: string
  type: "card" | "mobile" | "bank"
  name: string
  details: string
  isDefault: boolean
}

export default function PaymentMethods() {
  const { user } = useAuth()
  const {
    paymentMethods,
    loading,
    error,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    setDefaultPaymentMethod,
  } = usePaymentMethods(user?.id)

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null)
  const [newMethodType, setNewMethodType] = useState<"card" | "mobile" | "bank">("card")

  const getIcon = (type: string) => {
    switch (type) {
      case "card":
        return <CreditCard className="w-5 h-5" />
      case "mobile":
        return <Smartphone className="w-5 h-5" />
      case "bank":
        return <Building2 className="w-5 h-5" />
      default:
        return <CreditCard className="w-5 h-5" />
    }
  }

  const handleSetDefault = (id: string) => {
    setDefaultPaymentMethod(id)
  }

  const handleDelete = (id: string) => {
    deletePaymentMethod(id)
  }

  const handleEdit = (method: any) => {
    setEditingMethod(method)
    setIsEditDialogOpen(true)
  }

  const handleAddMethod = async () => {
    if (!user?.id) return

    const newMethod = {
      user_id: user.id,
      type: newMethodType,
      name: `New ${newMethodType} method`,
      details: "Details to be updated",
      is_default: false,
      is_active: true,
    }

    await addPaymentMethod(newMethod)
    setIsAddDialogOpen(false)
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
            <h1 className="text-2xl font-bold text-gray-900">Payment Methods</h1>
            <p className="text-gray-600">Manage your payment options</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Add Payment Method Button */}
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Your Payment Methods</h2>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Payment Method
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Payment Method</DialogTitle>
                  <DialogDescription>Choose the type of payment method you'd like to add.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="method-type">Payment Method Type</Label>
                    <Select
                      value={newMethodType}
                      onValueChange={(value: "card" | "mobile" | "bank") => setNewMethodType(value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="card">Credit/Debit Card</SelectItem>
                        <SelectItem value="mobile">Mobile Money</SelectItem>
                        <SelectItem value="bank">Bank Account</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {newMethodType === "card" && (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="card-number">Card Number</Label>
                        <Input id="card-number" placeholder="1234 5678 9012 3456" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="expiry">Expiry Date</Label>
                          <Input id="expiry" placeholder="MM/YY" />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input id="cvv" placeholder="123" />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="card-name">Cardholder Name</Label>
                        <Input id="card-name" placeholder="John Doe" />
                      </div>
                    </div>
                  )}

                  {newMethodType === "mobile" && (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="provider">Mobile Money Provider</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select provider" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mtn">MTN Mobile Money</SelectItem>
                            <SelectItem value="eswatini-mobile">Eswatini Mobile</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="mobile-number">Mobile Number</Label>
                        <Input id="mobile-number" placeholder="+268 7612 3456" />
                      </div>
                    </div>
                  )}

                  {newMethodType === "bank" && (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="bank-name">Bank Name</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select bank" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="standard">Standard Bank</SelectItem>
                            <SelectItem value="fnb">FNB Eswatini</SelectItem>
                            <SelectItem value="nedbank">Nedbank</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="account-number">Account Number</Label>
                        <Input id="account-number" placeholder="1234567890" />
                      </div>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddMethod}>Add Payment Method</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Payment Methods List */}
          <div className="space-y-4">
            {paymentMethods?.map((method: any) => (
              <Card key={method.id} className={method.is_default ? "border-green-200 bg-green-50" : ""}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-white rounded-lg border">{getIcon(method.type)}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{method.name}</h3>
                          {method.is_default && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Default
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{method.details}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!method.is_default && (
                        <Button variant="outline" size="sm" onClick={() => handleSetDefault(method.id)}>
                          Set as Default
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => handleEdit(method)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(method.id)}
                        disabled={method.is_default}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Auto-load Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Auto-load Payment Settings</CardTitle>
              <CardDescription>Configure how auto-load purchases are processed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="auto-amount">Auto-load Amount</Label>
                  <Select defaultValue="100">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="50">E50 (10 kWh)</SelectItem>
                      <SelectItem value="100">E100 (20 kWh)</SelectItem>
                      <SelectItem value="200">E200 (40 kWh)</SelectItem>
                      <SelectItem value="500">E500 (100 kWh)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="threshold">Low Balance Threshold</Label>
                  <Select defaultValue="10">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 kWh</SelectItem>
                      <SelectItem value="10">10 kWh</SelectItem>
                      <SelectItem value="15">15 kWh</SelectItem>
                      <SelectItem value="20">20 kWh</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Auto-load is enabled:</strong> When your meter balance drops below the threshold, we'll
                  automatically purchase the specified amount using your default payment method.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
