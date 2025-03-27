"use client"

import React from "react";
import { useEffect, useState, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { initializeApp } from "firebase/app"
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from "firebase/firestore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Package, Truck, CheckCircle, Clock, Search, MapPin, Calendar, User } from "lucide-react"
import { firebaseConfig } from "@/lib/firebase-config"
import { Skeleton } from "@/components/ui/skeleton"

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
declare global {
  interface Window {
    google: any;
  }
}

export default function TrackingPage() {
  const searchParams = useSearchParams()
  const [trackingId, setTrackingId] = useState(searchParams.get("id") || "")
  const [shipment, setShipment] = useState<ShipmentData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  interface ShipmentData {
    id: string;
    trackingId: string;
    status: string;
    destination: string;
    driverId?: string;
    driver?: any;
    origin: string;
    packageName: string;
    packageType: string;
    weight: number;
    createdAt: string;
    transitDate?: string;
    deliveryDate?: string;
    recipientName: string;
    recipientPhone: string;
    recipientEmail?: string;
  }

  useEffect(() => {
    const loadGoogleMapsScript = () => {
      if (window.google && window.google.maps) {
        setMapLoaded(true)
        return
      }

      const script = document.createElement("script")
      script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyCU6MVjsXBxLRIG1VEkVKx7-4zX2wh7di8&libraries=places&loading=async"
      script.async = true
      script.defer = true
      script.onload = () => setMapLoaded(true)
      document.head.appendChild(script)
    }

    loadGoogleMapsScript()
  }, [])

  useEffect(() => {
    if (trackingId) {
      trackShipment()
    }
  }, [trackingId])

  useEffect(() => {
    if (mapLoaded && shipment && mapRef.current) {
      initializeMap()
    }
  }, [mapLoaded, shipment])

  const trackShipment = async () => {
    if (!trackingId) return;

    setLoading(true);
    setError("");
    setShipment(null);

    try {
      const shipmentsRef = collection(db, "shipments");
      const q = query(shipmentsRef, where("trackingId", "==", trackingId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("Shipment not found. Please check the tracking ID and try again.");
        setLoading(false);
        return;
      }

      const shipmentData = {
        id: querySnapshot.docs[0].id,
        ...querySnapshot.docs[0].data(),
      } as ShipmentData;

      if (shipmentData.driverId) {
        const driverDoc = await getDoc(doc(db, "drivers", shipmentData.driverId));
        if (driverDoc.exists()) {
          shipmentData.driver = driverDoc.data();
        }
      }

      setShipment(shipmentData);
    } catch (error: any) {
      if (error.code === "permission-denied") {
        setError("You do not have permission to access this shipment.");
      } else {
        setError("An error occurred while tracking the shipment. Please try again.");
      }
      console.error("Error tracking shipment:", error);
    } finally {
      setLoading(false);
    }
  };

  const initializeMap = () => {
    if (!window.google || !mapRef.current || !shipment) {
      console.warn("Map initialization skipped: missing dependencies")
      return
    }

    try {
      const geocoder = new window.google.maps.Geocoder()

      geocoder.geocode({ address: shipment.destination }, (results: any, status: any) => {
        if (status === "OK" && results && results[0]) {
          const destinationLocation = results[0].geometry.location

          const map = new window.google.maps.Map(mapRef.current, {
            center: destinationLocation,
            zoom: 12,
          })

          new window.google.maps.Marker({
            position: destinationLocation,
            map,
            title: "Destination",
            icon: {
              url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
            },
          })

          if (shipment.status === "in_transit") {
            const lat = destinationLocation.lat() + (Math.random() - 0.5) * 0.05
            const lng = destinationLocation.lng() + (Math.random() - 0.5) * 0.05

            const driverPosition = new window.google.maps.LatLng(lat, lng)

            new window.google.maps.Marker({
              position: driverPosition,
              map,
              title: "Driver",
              icon: {
                url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
              },
            })

            const path = new window.google.maps.Polyline({
              path: [driverPosition, destinationLocation],
              strokeColor: "#3b82f6",
              strokeOpacity: 1.0,
              strokeWeight: 2
            });

            path.setMap(map);

            const bounds = new window.google.maps.LatLngBounds();
            bounds.extend(driverPosition);
            bounds.extend(destinationLocation);
            map.fitBounds(bounds);
          }
        } else {
          if (mapRef.current) {
            mapRef.current.innerHTML = '<div class="h-full flex items-center justify-center text-red-500">Unable to load map location. Please try again later.</div>';
          }
        }
      })
    } catch (error) {
      console.error("Error initializing map:", error)
      if (mapRef.current) {
        mapRef.current.innerHTML = '<div class="h-full flex items-center justify-center text-red-500">An error occurred while loading the map.</div>';
      }
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-6 w-6 text-yellow-500" />
      case "in_transit":
        return <Truck className="h-6 w-6 text-blue-500" />
      case "delivered":
        return <CheckCircle className="h-6 w-6 text-green-500" />
      default:
        return <Package className="h-6 w-6 text-gray-500" />
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

  const getStatusDescription = (status: string) => {
    switch (status) {
      case "pending":
        return "Your shipment has been registered and is awaiting processing"
      case "in_transit":
        return "Your shipment is on its way to the destination"
      case "delivered":
        return "Your shipment has been delivered successfully"
      default:
        return ""
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Track Your Shipment</CardTitle>
          <CardDescription>
            Enter your tracking ID to see the current status and location of your shipment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Enter tracking ID"
                className="pl-10"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
              />
            </div>
            <Button onClick={trackShipment} disabled={loading || !trackingId}>
              {loading ? "Tracking..." : "Track Shipment"}
            </Button>
          </div>

          {error && <div className="mt-4 p-3 rounded-md bg-red-50 text-red-500 text-sm">{error}</div>}
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
            <Skeleton className="h-[300px] w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </CardContent>
        </Card>
      ) : shipment ? (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              {getStatusIcon(shipment.status)}
              <div>
                <CardTitle>Tracking ID: {shipment.trackingId}</CardTitle>
                <CardDescription>{getStatusDescription(shipment.status)}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">{shipment.packageName}</h3>
                  <p className="text-sm text-gray-500">
                    {shipment.packageType} • {shipment.weight} kg
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {getStatusText(shipment.status)}
                </span>
              </div>
            </div>

            {shipment.status === "in_transit" && (
              <div className="border rounded-lg overflow-hidden">
                <div className="h-[300px] bg-gray-100" ref={mapRef}>
                  <div className="h-full flex items-center justify-center text-gray-500">Loading map...</div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium text-lg">Shipment Details</h3>

                <div className="space-y-3">
                  <div className="flex gap-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">From</p>
                      <p className="text-sm text-gray-600">{shipment.origin}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">To</p>
                      <p className="text-sm text-gray-600">{shipment.destination}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">Created</p>
                      <p className="text-sm text-gray-600">{formatDate(shipment.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-lg">Recipient Information</h3>

                <div className="space-y-3">
                  <div className="flex gap-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">Name</p>
                      <p className="text-sm text-gray-600">{shipment.recipientName}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm text-gray-600">{shipment.recipientPhone}</p>
                    </div>
                  </div>

                  {shipment.recipientEmail && (
                    <div className="flex gap-3">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm text-gray-600">{shipment.recipientEmail}</p>
                      </div>
                    </div>
                  )}                </div>
              </div>
            </div>

            <Separator />

            <h3 className="font-medium text-lg">Shipment Timeline</h3>

            <div className="space-y-6">
              <div className="flex gap-3">
                <div className="relative flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${shipment.status === "in_transit" || shipment.status === "delivered" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                    <Package className="h-4 w-4" />
                  </div>
                  {shipment.status !== "pending" && (
                    <div className="h-12 w-0.5 bg-gray-200 absolute top-8 left-1/2 -translate-x-1/2"></div>
                  )}
                </div>
                <div>
                  <p className="font-medium">Shipment Created</p>
                  <p className="text-sm text-gray-500">{formatDate(shipment.createdAt)}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="relative flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${shipment.status === "in_transit" || shipment.status === "delivered" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                    <Truck className="h-4 w-4" />
                  </div>
                  {shipment.status === "delivered" && (
                    <div className="h-12 w-0.5 bg-gray-200 absolute top-8 left-1/2 -translate-x-1/2"></div>
                  )}
                </div>
                <div>
                  <p className="font-medium">In Transit</p>
                  {shipment.status === "in_transit" || shipment.status === "delivered" ? (
                    <>
                      <p className="text-sm text-gray-500">
                        {shipment.transitDate ? formatDate(shipment.transitDate) : "Currently in transit"}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">Your shipment is on its way to the destination</p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">Pending</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <div className="relative flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${shipment.status === "delivered" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                    <CheckCircle className="h-4 w-4" />
                  </div>
                </div>
                <div>
                  <p className="font-medium">Delivered</p>
                  {shipment.status === "delivered" ? (
                    <>
                      <p className="text-sm text-gray-500">
                        {shipment.deliveryDate ? formatDate(shipment.deliveryDate) : "Successfully delivered"}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">Your shipment has been delivered successfully</p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">Pending</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}

