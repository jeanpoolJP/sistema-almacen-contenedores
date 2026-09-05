import type { ReactNode } from "react"

import { AdminSidebar } from "@/components/admin/admin-sidebar"

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

import { Toaster } from "@/components/ui/sonner"

type AdminLayoutProps = {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <SidebarProvider>
      <AdminSidebar />

      <SidebarInset>
        {/* Header */}
        <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
          {" "}
          <SidebarTrigger />
          <div className="h-4 w-px bg-border" />
          <span className="text-sm font-medium">
            Panel administrativo 
          </span>
        </header>

        {/* Contenido */}
        <main className="flex-1">{children}</main>
      </SidebarInset>

      <Toaster />
    </SidebarProvider>
  )
}
