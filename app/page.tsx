import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowRight, Package, Truck, Users } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Truck className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">LogiTrack</h1>
          </div>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <section className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Shipment Management Made Simple</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Track your shipments in real-time, manage deliveries, and optimize your logistics operations with our
            comprehensive dashboard.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <Package className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Shipment Management</CardTitle>
              <CardDescription>Create, track, and manage all your shipments in one place.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Create shipments with detailed information</li>
                <li>Track shipment status in real-time</li>
                <li>View complete order history</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Truck className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Real-Time Tracking</CardTitle>
              <CardDescription>Monitor your deliveries with live location updates.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Live driver location on Google Maps</li>
                <li>Estimated arrival times</li>
                <li>Delivery status notifications</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Admin Controls</CardTitle>
              <CardDescription>Powerful tools for logistics administrators.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Approve and manage shipments</li>
                <li>Assign deliveries to drivers</li>
                <li>Monitor fleet performance</li>
              </ul>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Truck className="h-5 w-5 text-blue-600" />
              <span className="text-lg font-semibold text-gray-900">LogiTrack</span>
            </div>
            <div className="text-gray-500 text-sm">© {new Date().getFullYear()} LogiTrack. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}

