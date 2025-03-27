"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore, collection, query, where, getDocs, orderBy, limit } from "firebase/firestore"
import { Package, Truck, CheckCircle, Clock } from "lucide-react"
import { firebaseConfig } from "@/lib/firebase-config"
import { Skeleton } from "@/components/ui/skeleton"

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalShipments: 0,
    pendingShipments: 0,
    inTransitShipments: 0,
    deliveredShipments: 0,
  })
  const [recentShipments, setRecentShipments] = useState<any[]>([])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const user = auth.currentUser
        if (!user) return

        const shipmentsRef = collection(db, "shipments")
        const userShipmentsQuery = query(shipmentsRef, where("userId", "==", user.uid))
        const querySnapshot = await getDocs(userShipmentsQuery)

        let total = 0
        let pending = 0
        let inTransit = 0
        let delivered = 0

        querySnapshot.forEach((doc) => {
          total++
          const status = doc.data().status
          if (status === "pending") pending++
          if (status === "in_transit") inTransit++
          if (status === "delivered") delivered++
        })

        setStats({
          totalShipments: total,
          pendingShipments: pending,
          inTransitShipments: inTransit,
          deliveredShipments: delivered,
        })

        const recentQuery = query(shipmentsRef, where("userId", "==", user.uid), orderBy("createdAt", "desc"), limit(5))
        const recentSnapshot = await getDocs(recentQuery)
        const recentData = recentSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setRecentShipments(recentData)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

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

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending"
      case "in_transit":
        return "In Transit"
      case "delivered":
        return "Delivered"
      default:
        return "Unknown"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "in_transit":
        return "bg-blue-100 text-blue-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="py-3 border-b last:border-0">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <Skeleton className="h-4 w-48 mt-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Shipments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalShipments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{stats.pendingShipments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">In Transit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.inTransitShipments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Delivered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.deliveredShipments}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Shipments</CardTitle>
          <CardDescription>Your latest shipment activities</CardDescription>
        </CardHeader>
        <CardContent>
          {recentShipments.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              No shipments found. Create your first shipment to get started.
            </div>
          ) : (
            <div className="space-y-1">
              {recentShipments.map((shipment) => (
                <div key={shipment.id} className="py-3 border-b last:border-0">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(shipment.status)}
                      <span className="font-medium">Tracking ID: {shipment.trackingId}</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(shipment.status)}`}>
                      {getStatusText(shipment.status)}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    From {shipment.origin} to {shipment.destination}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

