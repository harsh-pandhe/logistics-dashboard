"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore, collection, addDoc } from "firebase/firestore"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { firebaseConfig } from "@/lib/firebase-config"
import { Package, ArrowRight } from "lucide-react"
import RazorpayButton from "@/components/RazorpayButton";
import RazorpayPaymentForm from "@/components/RazorpayButton"

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

export default function CreateShipment() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    packageName: "",
    packageDescription: "",
    weight: "",
    dimensions: "",
    origin: "",
    destination: "",
    recipientName: "",
    recipientPhone: "",
    recipientEmail: "",
    packageType: "standard",
    deliverySpeed: "standard",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const user = auth.currentUser
      if (!user) {
        throw new Error("You must be logged in to create a shipment")
      }

      const trackingId = `TRK${Math.floor(Math.random() * 1000000)
        .toString()
        .padStart(6, "0")}`

      await addDoc(collection(db, "shipments"), {
        userId: user.uid,
        trackingId,
        packageName: formData.packageName,
        packageDescription: formData.packageDescription,
        weight: formData.weight,
        dimensions: formData.dimensions,
        origin: formData.origin,
        destination: formData.destination,
        recipientName: formData.recipientName,
        recipientPhone: formData.recipientPhone,
        recipientEmail: formData.recipientEmail,
        packageType: formData.packageType,
        deliverySpeed: formData.deliverySpeed,
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      router.push("/dashboard/shipments")
    } catch (error: any) {
      setError(error.message || "Failed to create shipment. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-blue-600" />
          <CardTitle>Create New Shipment</CardTitle>
        </div>
        <CardDescription>Fill in the details to create a new shipment for delivery</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {error && <div className="p-3 rounded-md bg-red-50 text-red-500 text-sm">{error}</div>}

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Package Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="packageName">Package Name</Label>
                <Input
                  id="packageName"
                  name="packageName"
                  value={formData.packageName}
                  onChange={handleChange}
                  placeholder="Electronics, Clothing, etc."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="packageType">Package Type</Label>
                <Select
                  value={formData.packageType}
                  onValueChange={(value) => handleSelectChange("packageType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select package type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="fragile">Fragile</SelectItem>
                    <SelectItem value="perishable">Perishable</SelectItem>
                    <SelectItem value="hazardous">Hazardous</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="packageDescription">Package Description</Label>
              <Textarea
                id="packageDescription"
                name="packageDescription"
                value={formData.packageDescription}
                onChange={handleChange}
                placeholder="Brief description of the package contents"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  name="weight"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="0.5"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dimensions">Dimensions (cm)</Label>
                <Input
                  id="dimensions"
                  name="dimensions"
                  value={formData.dimensions}
                  onChange={handleChange}
                  placeholder="30x20x10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Shipping Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="origin">Origin Address</Label>
                <Input
                  id="origin"
                  name="origin"
                  value={formData.origin}
                  onChange={handleChange}
                  placeholder="123 Sender St, City, Country"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="destination">Destination Address</Label>
                <Input
                  id="destination"
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  placeholder="456 Receiver Ave, City, Country"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliverySpeed">Delivery Speed</Label>
              <Select
                value={formData.deliverySpeed}
                onValueChange={(value) => handleSelectChange("deliverySpeed", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select delivery speed" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard (3-5 days)</SelectItem>
                  <SelectItem value="express">Express (1-2 days)</SelectItem>
                  <SelectItem value="same_day">Same Day</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Recipient Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recipientName">Recipient Name</Label>
                <Input
                  id="recipientName"
                  name="recipientName"
                  value={formData.recipientName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipientPhone">Recipient Phone</Label>
                <Input
                  id="recipientPhone"
                  name="recipientPhone"
                  value={formData.recipientPhone}
                  onChange={handleChange}
                  placeholder="+1 (555) 123-4567"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipientEmail">Recipient Email</Label>
              <Input
                id="recipientEmail"
                name="recipientEmail"
                type="email"
                value={formData.recipientEmail}
                onChange={handleChange}
                placeholder="recipient@example.com"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
  <Button type="button" variant="outline" onClick={() => router.back()}>
    Cancel
  </Button>
  <div className="flex items-center justify-center">
    <RazorpayPaymentForm />
  </div>
</CardFooter>

      </form>
    </Card>
  )
}

