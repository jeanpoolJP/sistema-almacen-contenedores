// components/admin/admin-sidebar.tsx

"use client"

import { logoutAction } from "@/modules/auth/actions/logout"
import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "next-themes"

import {
  LayoutDashboard,
  Users,
  FileText,
  Container,
  Truck,
  UsersRound,
  Building2,
  BarChart3,
  Settings,
  LogOut,
  Warehouse,
  Sun,
  Moon,
  ClipboardCheck,
  Box,
  ArrowRightLeft,
  Receipt,
  FileBarChart,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// ============================================================
// CONFIGURACIÓN DE GRUPOS
// ============================================================

/**
 * Acceso principal: Dashboard.
 * Se renderiza solo, sin grupo.
 */
const dashboardItem = {
  title: "Dashboard",
  href: "/admin",
  icon: LayoutDashboard,
}

/**
 * Operaciones del día a día.
 * Lo que el usuario abre todos los días.
 */
const operacionesItems = [
  {
    title: "Guías de Internamiento",
    href: "/admin/guias",
    icon: FileText,
  },
  {
    title: "Guías de Trasegados",
    href: "/admin/trasegados",
    icon: ArrowRightLeft,
  },
]

/**
 * Inventario: proceso periódico (mensual).
 * Se separa para que sea visible cuando toque hacerlo.
 */
const inventarioItems = [
  {
    title: "Inventario",
    href: "/admin/inventario",
    icon: ClipboardCheck,
  },
  { title: "Liquidaciones", 
    href: "/admin/liquidaciones", 
    icon: Receipt },
  {
    title: "Inventario por cliente",
    href: "/admin/reportes/inventario",
    icon: FileBarChart,
  },
]

/**
 * Datos maestros: soporte para las operaciones.
 * Se consultan/editan esporádicamente.
 */
const maestrosItems = [
  {
    title: "Clientes",
    href: "/admin/clientes",
    icon: Users,
  },
  {
    title: "Contenedores",
    href: "/admin/contenedores",
    icon: Container,
  },
  {
    title: "Vehículos",
    href: "/admin/vehiculos",
    icon: Truck,
  },
  {
    title: "Empresas de transporte",
    href: "/admin/empresas-transporte",
    icon: Building2,
  },
  {
    title: "Conductores",
    href: "/admin/conductores",
    icon: UsersRound,
  },
  {
    title: "Flat Racks",
    href: "/admin/flat-racks",
    icon: Box,
  },
]

/**
 * Sistema: administración y análisis.
 */
const sistemaItems = [
  /*   {
    title: "Reportes",
    href: "/admin/reportes",
    icon: BarChart3,
  }, */
  {
    title: "Configuración",
    href: "/admin/configuracion",
    icon: Settings,
  },
]

// ============================================================
// COMPONENTE
// ============================================================

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  const isDark = theme === "dark"

  function isActive(href: string) {
    if (href === "/admin") {
      return pathname === "/admin"
    }

    return pathname.startsWith(href)
  }

  function navigateTo(href: string) {
    router.push(href)
  }

  function toggleTheme() {
    setTheme(isDark ? "light" : "dark")
  }

  /**
   * Renderiza un item individual del sidebar.
   * Se usa desde todos los grupos para evitar duplicación.
   */
  function renderItem(item: {
    title: string
    href: string
    icon: React.ComponentType<{ className?: string }>
  }) {
    const Icon = item.icon
    const active = isActive(item.href)

    return (
      <SidebarMenuItem key={item.href}>
        <SidebarMenuButton
          isActive={active}
          tooltip={item.title}
          onClick={() => navigateTo(item.href)}
        >
          <Icon />
          <span>{item.title}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  return (
    <Sidebar collapsible="icon">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="Almacén de Contenedores"
              onClick={() => navigateTo("/admin")}
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Warehouse className="size-4" />
              </div>

              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Almacén</span>
                <span className="truncate text-xs text-muted-foreground">
                  Contenedores
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <SidebarContent>
        {/* DASHBOARD (sin grupo, primero) */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>{renderItem(dashboardItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* OPERACIONES */}
        <SidebarGroup>
          <SidebarGroupLabel>Operaciones</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{operacionesItems.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* INVENTARIO */}
        <SidebarGroup>
          <SidebarGroupLabel>Inventario</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{inventarioItems.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* MAESTROS */}
        <SidebarGroup>
          <SidebarGroupLabel>Maestros</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{maestrosItems.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* SISTEMA */}
        <SidebarGroup>
          <SidebarGroupLabel>Sistema</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{sistemaItems.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <SidebarFooter>
        <SidebarMenu>
          {/* MODO OSCURO / CLARO */}

          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={
                isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
              }
              onClick={toggleTheme}
            >
              {isDark ? (
                <Sun className="size-4" />
              ) : (
                <Moon className="size-4" />
              )}
              <span>{isDark ? "Modo claro" : "Modo oscuro"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* CERRAR SESIÓN */}

          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Cerrar sesión"
              onClick={async () => {
                await logoutAction()
                router.replace("/")
                router.refresh()
              }}
            >
              <LogOut className="size-4" />
              <span>Cerrar sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
