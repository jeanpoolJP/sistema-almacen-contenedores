"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";

import {
  LayoutDashboard,
  Users,
  FileText,
  Container,
  Truck,
  CreditCard,
  UsersRound,
  BarChart3,
  Settings,
  LogOut,
  Warehouse,
  Sun,
  Moon,
} from "lucide-react";

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
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Clientes",
    href: "/admin/clientes",
    icon: Users,
  },
  {
    title: "Guías",
    href: "/admin/guias",
    icon: FileText,
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
    title: "Conductores",
    href: "/admin/conductores",
    icon: UsersRound,
  },
  {
    title: "Pagos",
    href: "/admin/pagos",
    icon: CreditCard,
  },
];

const reportItems = [
  {
    title: "Reportes",
    href: "/admin/reportes",
    icon: BarChart3,
  },
];

const systemItems = [
  {
    title: "Configuración",
    href: "/admin/configuracion",
    icon: Settings,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const isDark = theme === "dark";

  function isActive(href: string) {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return pathname.startsWith(href);
  }

  function navigateTo(href: string) {
    router.push(href);
  }

  function toggleTheme() {
    setTheme(isDark ? "light" : "dark");
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
                <span className="truncate font-semibold">
                  Almacén
                </span>

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
        {/* PRINCIPAL */}

        <SidebarGroup>
          <SidebarGroupLabel>
            Principal
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

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
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* INFORMACIÓN */}

        <SidebarGroup>
          <SidebarGroupLabel>
            Información
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {reportItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

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
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* SISTEMA */}

        <SidebarGroup>
          <SidebarGroupLabel>
            Sistema
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {systemItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

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
                );
              })}
            </SidebarMenu>
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
                isDark
                  ? "Cambiar a modo claro"
                  : "Cambiar a modo oscuro"
              }
              onClick={toggleTheme}
            >
              {isDark ? (
                <Sun className="size-4" />
              ) : (
                <Moon className="size-4" />
              )}

              <span>
                {isDark
                  ? "Modo claro"
                  : "Modo oscuro"}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* CERRAR SESIÓN */}

          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Cerrar sesión"
              onClick={() => {
                // TODO: implementar logout
                console.log("Cerrar sesión");
              }}
            >
              <LogOut className="size-4" />

              <span>
                Cerrar sesión
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}