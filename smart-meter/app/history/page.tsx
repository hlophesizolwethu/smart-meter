"use client"

import { useState } from "react"
import { ArrowLeft, Download, Search, Zap, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

interface Transaction {
  id: string
  type: "purchase" | "auto-load" | "alert" | "meter-update"
  amount?: number
  units?: number
  status: "completed" | "pending" | "failed"
  date: Date
  description: string
  paymentMethod?: string
}

export default function TransactionHistory() {
  const [transactions] = useState<Transaction[]>([
    {
      id: "1",
      type: "auto-load",
      amount: 250,
      units: 50,
      status: "completed",
      date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      description: "Auto-load purchase - Low balance threshold reached",
      paymentMethod: "Visa ending in 4242",
    },
    {
      id: "2",
      type: "purchase",
      amount: 125,
      units: 25,
      status: "completed",
      date: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      description: "Manual electricity purchase",
      paymentMethod: "MTN Mobile Money",
    },
    {
      id: "3",
      type: "alert",
      status: "completed",
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      description: "Low balance alert - Units below 10 kWh threshold",
    },
    {
      id: "4",
      type: "purchase",
      amount: 500,
      units: 100,
      status: "completed",
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      description: "Electricity purchase",
      paymentMethod: "Standard Bank",
    },
    {
      id: "5",
      type: "meter-update",
      status: "completed",
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      description: "Smart meter SSH-766488 registered successfully",
    },
    {
      id: "6",
      type: "purchase",
      amount: 100,
      units: 20,
      status: "failed",
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      description: "Electricity purchase failed - Payment declined",
      paymentMethod: "Visa ending in 4242",
    },
  ])

  const [filteredTransactions, setFilteredTransactions] = useState(transactions)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  const getTransactionIcon = (type: string, status: string) => {
    if (status === "failed") return <AlertTriangle className="w-5 h-5 text-red-500" />
    if (status === "pending") return <Clock className="w-5 h-5 text-yellow-500" />

    switch (type) {
      case "purchase":
      case "auto-load":
        return <Zap className="w-5 h-5 text-blue-500" />
      case "alert":
        return <AlertTriangle className="w-5 h-5 text-orange-500" />
      case "meter-update":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      default:
        return <CheckCircle className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return "1 day ago"
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} days ago`
    return date.toLocaleDateString()
  }

  const handleExport = () => {
    // Export functionality
    console.log("Exporting transaction history...")
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
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
            <p className="text-gray-600">View all your electricity purchases and activities</p>
          </div>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold">E975.00</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Units Purchased</p>
                  <p className="text-2xl font-bold">195 kWh</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Auto-loads</p>
                  <p className="text-2xl font-bold">1</p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Failed Transactions</p>
                  <p className="text-2xl font-bold">1</p>
                </div>
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Transaction Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="purchase">Purchases</SelectItem>
                  <SelectItem value="auto-load">Auto-loads</SelectItem>
                  <SelectItem value="alert">Alerts</SelectItem>
                  <SelectItem value="meter-update">Meter Updates</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Transaction List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>All your electricity-related activities and purchases</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    {getTransactionIcon(transaction.type, transaction.status)}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{transaction.description}</p>
                        {getStatusBadge(transaction.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{formatDate(transaction.date)}</span>
                        {transaction.paymentMethod && <span>• {transaction.paymentMethod}</span>}
                        {transaction.units && <span>• {transaction.units} kWh</span>}
                      </div>
                    </div>
                  </div>

                  {transaction.amount && (
                    <div className="text-right">
                      <p className="font-semibold text-lg">E{transaction.amount.toFixed(2)}</p>
                      {transaction.status === "failed" && (
                        <Button variant="outline" size="sm" className="mt-1 bg-transparent">
                          Retry
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {filteredTransactions.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No transactions found matching your criteria.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
