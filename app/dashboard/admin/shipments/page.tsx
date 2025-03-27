"use client"

import { useEffect, useState } from "react"
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore, collection, query, getDocs, doc, updateDoc, orderBy, getDoc } from "firebase/firestore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Package, Truck, CheckCircle, Clock, Search, User, MapPin, Calendar, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { firebaseConfig } from "@/lib/firebase-config"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

export default function AdminShipmentsPage() {
  const [shipments, setShipments] = useState<any[]>([])
  const [filteredShipments, setFilteredShipments] = useState<any[]>([])
  const [drivers, setDrivers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [selectedShipment, setSelectedShipment] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth.currentUser
        if (!user) {
          router.push("/login")
          return
        }

        setShipments([])
        setFilteredShipments([])
        setDrivers([])

        try {
          const userDoc = await getDoc(doc(db, "users", user.uid))
          const userData = userDoc.exists() ? userDoc.data() : { role: "user" }

          if (userData?.role !== "admin") {
            toast({
              title: "Access Denied",
              description: "You don't have permission to access this page.",
              variant: "destructive",
            })
            router.push("/dashboard")
            return
          }

          const shipmentsRef = collection(db, "shipments")
          const q = query(shipmentsRef, orderBy("createdAt", "desc"))
          const querySnapshot = await getDocs(q)
          const shipmentsData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))

          setShipments(shipmentsData)
          setFilteredShipments(shipmentsData)

          const driversRef = collection(db, "drivers")
          const driversSnapshot = await getDocs(driversRef)
          const driversData = driversSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))

          setDrivers(driversData)
        } catch (error) {
          console.error("Error fetching data:", error)
          toast({
            title: "Data Error",
            description: "Unable to fetch shipment data. Please try again later.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error in admin shipments page:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  useEffect(() => {
    let filtered = shipments

    if (searchQuery) {
      filtered = filtered.filter(
        (shipment) =>
          shipment.trackingId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          shipment.packageName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          shipment.destination?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          shipment.recipientName?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (activeTab !== "all") {
      filtered = filtered.filter((shipment) => shipment.status === activeTab)
    }

    setFilteredShipments(filtered)
  }, [searchQuery, activeTab, shipments])

  const handleShipmentAction = (shipment: any) => {
    setSelectedShipment(shipment)
    setSelectedDriver(shipment.driverId || "")
    setSelectedStatus(shipment.status || "pending")
    setIsDialogOpen(true)
  }

  const updateShipment = async () => {
    if (!selectedShipment) return

    setIsUpdating(true)

    try {
      const shipmentRef = doc(db, "shipments", selectedShipment.id)

      await updateDoc(shipmentRef, {
        status: selectedStatus,
        driverId: selectedDriver || null,
        updatedAt: new Date().toISOString(),
        ...(selectedStatus === "in_transit" && !selectedShipment.transitDate
          ? { transitDate: new Date().toISOString() }
          : {}),
        ...(selectedStatus === "delivered" && !selectedShipment.deliveryDate
          ? { deliveryDate: new Date().toISOString() }
          : {}),
      })

      const updatedShipments = shipments.map((shipment) => {
        if (shipment.id === selectedShipment.id) {
          return {
            ...shipment,
            status: selectedStatus,
            driverId: selectedDriver || null,
            updatedAt: new Date().toISOString(),
            ...(selectedStatus === "in_transit" && !shipment.transitDate
              ? { transitDate: new Date().toISOString() }
              : {}),
            ...(selectedStatus === "delivered" && !shipment.deliveryDate
              ? { deliveryDate: new Date().toISOString() }
              : {}),
          }
        }
        return shipment
      })

      setShipments(updatedShipments)
      setIsDialogOpen(false)

      toast({
        title: "Shipment Updated",
        description: `Shipment ${selectedShipment.trackingId} has been updated successfully.`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update shipment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

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
    if (!dateString) return "N/A"
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Skeleton className="h-4 w-full" />
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
        <h2 className="text-2xl font-bold">Manage Shipments</h2>
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
          <p className="text-gray-500">
            {searchQuery ? "Try adjusting your search query" : "There are no shipments in the system yet"}
          </p>
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleShipmentAction(shipment)}>
                          Update Status & Driver
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <CardDescription>
                  Tracking ID: {shipment.trackingId} • Created: {formatDate(shipment.createdAt)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="flex items-center gap-1 text-gray-500 mb-1">
                      <MapPin className="h-3 w-3" />
                      <span>Destination</span>
                    </div>
                    <p className="font-medium">{shipment.destination}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-gray-500 mb-1">
                      <User className="h-3 w-3" />
                      <span>Recipient</span>
                    </div>
                    <p className="font-medium">{shipment.recipientName}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-gray-500 mb-1">
                      <Calendar className="h-3 w-3" />
                      <span>Last Updated</span>
                    </div>
                    <p className="font-medium">{formatDate(shipment.updatedAt)}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-gray-500 mb-1">
                      <Truck className="h-3 w-3" />
                      <span>Assigned Driver</span>
                    </div>
                    <p className="font-medium">
                      {shipment.driverId
                        ? drivers.find((d) => d.id === shipment.driverId)?.name || "Unknown Driver"
                        : "Not Assigned"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Shipment</DialogTitle>
            <DialogDescription>Update the status and assigned driver for this shipment.</DialogDescription>
          </DialogHeader>
          {selectedShipment && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Tracking ID: {selectedShipment.trackingId}</h4>
                <p className="text-sm text-gray-500">{selectedShipment.packageName}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_transit">In Transit</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Assign Driver</label>
                <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select driver" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not Assigned</SelectItem>
                    {drivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={updateShipment} disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

