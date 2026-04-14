"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Home, LogOut, Menu, Bot } from "lucide-react"
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
import { motion } from "framer-motion"

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
        <div className="flex min-h-screen w-full" style={{ background: "#F4F4FF" }}>
          {pathname.startsWith("/dashboard") && !pathname.startsWith("/dashboard/interviews/") && (
            <div className="hidden md:block">
              <DashboardSidebar pathname={pathname} user={user} />
            </div>
          )}
          <main className="flex-1 w-full max-w-full overflow-x-hidden">
            {/* Mobile topbar */}
            <div className="flex items-center justify-between p-4 md:hidden sticky top-0 z-30 border-b"
              style={{ background: "rgba(244,244,255,0.9)", backdropFilter: "blur(12px)", borderColor: "#E5E6F3" }}>
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-lg"
                  style={{ background: "#6C3FFE" }}>
                  🤖
                </div>
                <span className="font-extrabold text-primary text-lg">InterviewAI</span>
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

const navItems = [
  { href: "/dashboard", icon: "🏠", lucide: <Home className="h-4 w-4" />, label: "Overview" },
  { href: "/dashboard/interviews", icon: "🎯", lucide: <BarChart3 className="h-4 w-4" />, label: "My Interviews" },
]

function DashboardSidebar({ pathname, user }) {
  return (
    <Sidebar className="border-r" style={{ background: "#FFFFFF", borderColor: "#E5E6F3" }}>
      {/* Logo */}
      <SidebarHeader className="border-b" style={{ borderColor: "#E5E6F3" }}>
        <Link href="/dashboard" className="flex items-center gap-2.5 px-3 py-4">
          <motion.div
            whileHover={{ rotate: 20, scale: 1.15 }}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
            style={{ background: "#6C3FFE" }}
          >
            🤖
          </motion.div>
          <span className="font-extrabold text-primary text-xl">InterviewAI</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-bold uppercase tracking-widest mb-2"
            style={{ color: "#9CA3AF" }}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navItems.map(({ href, icon, label }) => {
                const isActive = pathname === href
                return (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton asChild>
                      <Link href={href}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200"
                        style={{
                          background: isActive ? "rgba(108, 63, 254, 0.1)" : "transparent",
                          color: isActive ? "#6C3FFE" : "#6B7280",
                          border: isActive ? "1.5px solid #6C3FFE25" : "1.5px solid transparent",
                        }}
                      >
                        <span className="text-lg">{icon}</span>
                        <span>{label}</span>
                        {isActive && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="ml-auto w-2 h-2 rounded-full"
                            style={{ background: "#6C3FFE" }}
                          />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick tip */}
        <div className="mx-3 mt-4 p-4 rounded-2xl"
          style={{ background: "#EEE5FF", border: "1.5px solid #6C3FFE20" }}>
          <div className="text-2xl mb-2">💡</div>
          <p className="text-xs font-bold text-primary mb-1">Pro Tip</p>
          <p className="text-xs text-muted-foreground">
            Practice 15 minutes daily to see 40% score improvement in a week!
          </p>
        </div>
      </SidebarContent>

      {/* User footer */}
      <SidebarFooter className="border-t p-4" style={{ borderColor: "#E5E6F3" }}>
        <motion.div
          className="flex items-center gap-3 p-3 rounded-2xl"
          style={{ background: "#F4F4FF", border: "1.5px solid #E5E6F3" }}
          whileHover={{ scale: 1.02 }}
        >
          <Avatar className="h-9 w-9 ring-2" style={{ "--tw-ring-color": "#6C3FFE" }}>
            <AvatarImage src="/placeholder.svg?height=36&width=36" alt="User" />
            <AvatarFallback className="text-sm font-bold" style={{ background: "#6C3FFE", color: "white" }}>
              {user?.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold truncate">{user?.name || "User"}</span>
            <span className="text-xs text-muted-foreground truncate">{user?.email || ""}</span>
          </div>
          <Button variant="ghost" size="icon" className="ml-auto shrink-0 hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors">
            <LogOut className="h-4 w-4" />
          </Button>
        </motion.div>
      </SidebarFooter>
    </Sidebar>
  )
}
