"use client"

import { useEffect, useState } from "react"
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore, collection, query, where, getDocs, orderBy } from "firebase/firestore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, Truck, CheckCircle, Clock, Search, Eye, PlusCircle } from "lucide-react"
import { firebaseConfig } from "@/lib/firebase-config"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

export default function Shipments() {
  const [shipments, setShipments] = useState<any[]>([])
  const [filteredShipments, setFilteredShipments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const user = auth.currentUser
        if (!user) return

        const shipmentsRef = collection(db, "shipments")
        const q = query(shipmentsRef, where("userId", "==", user.uid), orderBy("createdAt", "desc"))

        const querySnapshot = await getDocs(q)
        const shipmentsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setShipments(shipmentsData)
        setFilteredShipments(shipmentsData)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching shipments:", error)
        setLoading(false)
      }
    }

    fetchShipments()
  }, [])

  useEffect(() => {
    let filtered = shipments

    if (searchQuery) {
      filtered = filtered.filter(
        (shipment) =>
          shipment.trackingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          shipment.packageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          shipment.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
          shipment.recipientName.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (activeTab !== "all") {
      filtered = filtered.filter((shipment) => {
        if (activeTab === "pending") return shipment.status === "pending"
        if (activeTab === "in_transit") return shipment.status === "in_transit"
        if (activeTab === "delivered") return shipment.status === "delivered"
        return true
      })
    }

    setFilteredShipments(filtered)
  }, [searchQuery, activeTab, shipments])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />
      case "in_transit":
        return <Truck className="h-5 w-5 text-blue-500" />
      case "delivered":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      default:
        return <Package className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Pending
          </Badge>
        )
      case "in_transit":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            In Transit
          </Badge>
        )
      case "delivered":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
            Delivered
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-10 w-full" />
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="mb-4">
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-24" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">My Shipments</h2>
        <Link href="/dashboard/create-shipment">
          <Button className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Create Shipment
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by tracking ID, name, or destination..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Tabs defaultValue="all" className="w-full sm:w-auto" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full sm:w-[400px]">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="in_transit">In Transit</TabsTrigger>
            <TabsTrigger value="delivered">Delivered</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {filteredShipments.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No shipments found</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery ? "Try adjusting your search query" : "You haven't created any shipments yet"}
          </p>
          {!searchQuery && (
            <Link href="/dashboard/create-shipment">
              <Button className="gap-2">
                <PlusCircle className="h-4 w-4" />
                Create Your First Shipment
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredShipments.map((shipment) => (
            <Card key={shipment.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(shipment.status)}
                    <CardTitle className="text-lg">{shipment.packageName}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(shipment.status)}
                    <Link href={`/dashboard/tracking?id=${shipment.trackingId}`}>
                      <Button variant="ghost" size="sm" className="h-8 gap-1">
                        <Eye className="h-4 w-4" />
                        Track
                      </Button>
                    </Link>
                  </div>
                </div>
                <CardDescription>
                  Tracking ID: {shipment.trackingId} • Created: {formatDate(shipment.createdAt)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-medium">From</p>
                    <p className="text-gray-500">{shipment.origin}</p>
                  </div>
                  <div>
                    <p className="font-medium">To</p>
                    <p className="text-gray-500">{shipment.destination}</p>
                  </div>
                  <div>
                    <p className="font-medium">Recipient</p>
                    <p className="text-gray-500">{shipment.recipientName}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

