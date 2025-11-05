"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Clock, Home, LayoutDashboard, LogOut, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useEffect, useState } from "react"
import axios from "axios"
import { UserContext } from "../context/UserContext"

export default function DashboardLayout({ children }) {
  const pathname = usePathname()
  const [user, setUser] = useState(null)
  useEffect(() => {
    const getUser = async () => {
      const response = await axios.get("/api/user")
      setUser(response.data.user)
    }
    getUser()
  }, [])

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-slate-50 dark:bg-slate-900">
          {pathname.startsWith("/dashboard") && !pathname.startsWith("/dashboard/interviews/") && (
            <div className="hidden md:block">
              <DashboardSidebar pathname={pathname} user={user} />
            </div>
          )}
          <main className="flex-1 w-full max-w-full overflow-x-hidden">
            <div className="flex items-center justify-between p-4 md:hidden sticky top-0 bg-background/95 backdrop-blur-sm z-10 border-b">
              <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                <LayoutDashboard className="h-5 w-5" />
                <span>AI Interview</span>
              </Link>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0">
                  <DashboardSidebar pathname={pathname} user={user} />
                </SheetContent>
              </Sheet>
            </div>
            <div className="md:p-6 w-full">{children}</div>
          </main>
        </div>
      </SidebarProvider>
    </UserContext.Provider>
  )
}

function DashboardSidebar({ pathname, user }) {
  return (
    <Sidebar>
      <SidebarHeader className="border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2 px-2 py-3">
          <LayoutDashboard className="h-5 w-5" />
          <span className="font-semibold">AI Interview</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard"}>
                  <Link href="/dashboard">
                    <Home className="h-4 w-4" />
                    <span>Overview</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard/interviews"}>
                  <Link href="/dashboard/interviews">
                    <BarChart3 className="h-4 w-4" />
                    <span>My Interviews</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard/history"}>
                  {/* <Link href="/dashboard/history">
                    <Clock className="h-4 w-4" />
                    <span>History</span>
                  </Link> */}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard/profile"}>
                  <Link href="/dashboard/profile">
                    <User2 className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard/settings"}>
                  <Link href="/dashboard/settings">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup> */}
      </SidebarContent>
      <SidebarFooter className="border-t border-border p-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{user?.name}</span>
            <span className="text-xs text-muted-foreground">{user?.email}</span>
          </div>
          <Button variant="ghost" size="icon" className="ml-auto">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
