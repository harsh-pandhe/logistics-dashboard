"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { initializeApp } from "firebase/app"
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth"
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore"
import { Package, Truck, User, LogOut, LayoutDashboard, PlusCircle, ClipboardList, UsersIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { firebaseConfig } from "@/lib/firebase-config"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { toast } from "@/components/ui/use-toast"

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login")
        return
      }

      setUser(currentUser)

      setUserRole("user")

      try {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid))

        if (userDoc.exists()) {
          const userData = userDoc.data()
          setUserRole(userData.role || "user")
        } else {
          console.warn("User document not found in Firestore")

          try {
            await setDoc(
              doc(db, "users", currentUser.uid),
              {
                email: currentUser.email,
                name: currentUser.displayName || currentUser.email?.split("@")[0] || "User",
                role: "user",
                createdAt: new Date().toISOString(),
              },
              { merge: true },
            )
          } catch (createError) {
            console.error("Error creating user document:", createError)
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error)

        toast({
          title: "Permission Error",
          description: "Unable to fetch user role. Some features may be limited.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [router])

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="space-y-4 w-[300px]">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    )
  }

  const isAdmin = userRole === "admin"

  return (
    <SidebarProvider>
      <div className="flex w-[100%] bg-gray-50">
        <Sidebar>
          <SidebarHeader className="border-b">
            <div className="flex items-center gap-2 px-4 py-2">
              <Truck className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-bold">MapFleet</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard"} tooltip="Dashboard">
                  <a href="/dashboard">
                    <LayoutDashboard className="h-5 w-5" />
                    <span>Dashboard</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/dashboard/create-shipment"}
                  tooltip="Create Shipment"
                >
                  <a href="/dashboard/create-shipment">
                    <PlusCircle className="h-5 w-5" />
                    <span>Create Shipment</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard/shipments"} tooltip="My Shipments">
                  <a href="/dashboard/shipments">
                    <Package className="h-5 w-5" />
                    <span>My Shipments</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard/tracking"} tooltip="Track Shipments">
                  <a href="/dashboard/tracking">
                    <Truck className="h-5 w-5" />
                    <span>Track Shipments</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard/profile"} tooltip="Profile">
                  <a href="/dashboard/profile">
                    <User className="h-5 w-5" />
                    <span>Profile</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {isAdmin && (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === "/dashboard/admin/shipments"}
                      tooltip="Manage Shipments"
                    >
                      <a href="/dashboard/admin/shipments">
                        <ClipboardList className="h-5 w-5" />
                        <span>Manage Shipments</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === "/dashboard/admin/drivers"}
                      tooltip="Manage Drivers"
                    >
                      <a href="/dashboard/admin/drivers">
                        <UsersIcon className="h-5 w-5" />
                        <span>Manage Drivers</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t">
            <div className="p-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-full flex items-center justify-start gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {user?.email?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start text-sm">
                      <span className="font-medium">{user?.displayName || user?.email}</span>
                      <span className="text-xs text-gray-500">{isAdmin ? "Administrator" : "User"}</span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <a href="/dashboard/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white border-b h-16 flex items-center px-6">
            <SidebarTrigger className="mr-4" />
            <h1 className="text-xl font-semibold">
              {pathname === "/dashboard" && "Dashboard"}
              {pathname === "/dashboard/create-shipment" && "Create Shipment"}
              {pathname === "/dashboard/shipments" && "My Shipments"}
              {pathname === "/dashboard/tracking" && "Track Shipments"}
              {pathname === "/dashboard/profile" && "Profile"}
              {pathname === "/dashboard/admin/shipments" && "Manage Shipments"}
              {pathname === "/dashboard/admin/drivers" && "Manage Drivers"}
            </h1>
          </header>
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}

