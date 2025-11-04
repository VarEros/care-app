"use client"

import React, { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { fetchAuthSession, signOut as amplifySignOut } from "aws-amplify/auth"// adjust to your auth utilities
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Home, User, Calendar, Users, Settings, FileText, LogOut, Stethoscope, Circle } from "lucide-react"

/**
 * Small helper to join classes
 */
function cn(...args: Array<string | false | null | undefined>) {
  return args.filter(Boolean).join(" ")
}

type NavItem = {
  label: string
  href: string
  icon?: React.ReactNode
  badge?: string | number
}

/**
 * Sidebar component
 *
 * - reads Cognito groups from fetchAuthSession()
 * - builds the menu dynamically
 * - highlights the active route using usePathname()
 * - exposes a Sign out button (calls amplifySignOut() from your auth utils)
 *
 * NOTE: adjust imports for `fetchAuthSession` and `amplifySignOut` to match your project.
 */
export default function Sidebar() {
  const [groups, setGroups] = useState<string[]>([])
  const [loadingGroups, setLoadingGroups] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    let alive = true;

    const loadGroups = async () => {
      // try {
      //   setLoadingGroups(true)
      //   const { tokens } = await fetchAuthSession()
      //   // tokens?.accessToken?.payload["cognito:groups"] or tokens?.idToken?.payload depending on your setup
      //   const gs =
      //     (tokens?.accessToken?.payload?.["cognito:groups"] as string[] | undefined) ??
      //     (tokens?.idToken?.payload?.["cognito:groups"] as string[] | undefined) ??
      //     []
      //   if (alive) setGroups(gs)
      // } catch (err) {
      //   console.error("Failed to fetch auth session:", err)
      //   if (alive) setGroups([])
      // } finally {
      //   if (alive) setLoadingGroups(false)
      // }
      setGroups(["Doctors"])
      setLoadingGroups(false)
    }
    loadGroups();

    return () => {
      alive = false
    }
  }, [])

  const items: NavItem[] = useMemo(() => {
    const base: NavItem[] = [
      { label: "Dashboard", href: "/", icon: <Home className="h-4 w-4" /> },
      { label: "Perfil", href: "/profile", icon: <User className="h-4 w-4" /> },
    ]

    if (groups.includes("Patients")) {
      base.push(
        { label: "Mis Citas", href: "/my-appointments", icon: <Calendar className="h-4 w-4" /> },
        { label: "Mis Recetas", href: "/my-recipes", icon: <FileText className="h-4 w-4" /> },
        { label: "Mis Consultas", href: "/my-consultations", icon: <Stethoscope className="h-4 w-4" /> }
      )
    }

    if (groups.includes("Doctors")) {
      base.push(
        { label: "Pacientes", href: "/patients", icon: <Users className="h-4 w-4" /> },
        { label: "Citas", href: "/appointments", icon: <Calendar className="h-4 w-4" /> },
        { label: "Mis Citas", href: "/my-appointments", icon: <Calendar className="h-4 w-4" /> },
        { label: "Consultas", href: "/consultations", icon: <Stethoscope className="h-4 w-4" /> },
        { label: "Mis Recetas", href: "/my-recipes", icon: <FileText className="h-4 w-4" /> },
        { label: "Doctores", href: "/doctors", icon: <Users className="h-4 w-4" /> }
      )
    }

    if (groups.includes("Admins")) {
      base.push(
        { label: "Administración", href: "/admin", icon: <Settings className="h-4 w-4" /> },
        { label: "Doctores", href: "/doctors", icon: <Users className="h-4 w-4" /> }
      )
    }

    return base
  }, [groups])

  const handleSignOut = async () => {
    try {
      await amplifySignOut()
      // Optionally redirect to login page or refresh
      // window.location.href = "/login"
    } catch (err) {
      console.error("Sign out failed", err)
    }
  }

 return (
    <aside className="h-screen sticky top-0 w-72 border-r flex flex-col">
      {/* Header */}
      <div className="px-4 py-5 flex items-center gap-3 border-b">
        <Circle className="h-10 w-10">

        </Circle>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">Dr. Juan Pérez</p>
          <p className="text-xs text-muted-foreground truncate">Cardiología</p>
        </div>
      </div>

      {/* Navigation */}
      <nav aria-label="Main navigation" className="flex-1 px-3 py-5 space-y-2">
        {loadingGroups ? (
          <div className="px-3 py-2 text-sm text-muted-foreground">Cargando menú...</div>
        ) : (
          items.map((item) => {
            const isActive =
              pathname === item.href || pathname?.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                  isActive
                    ? "bg-secondary text-primary font-medium"
                    : "text-secondary-foreground hover:bg-primary-foreground"
                )}
              >
                <span
                  className={cn(
                    "flex-none",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {item.icon}
                </span>
                <span className="text-sm truncate">{item.label}</span>
                {item.badge != null && (
                  <span className="ml-auto text-xs bg-blue-100 text-primary px-2 py-0.5 rounded-full">
                    {String(item.badge)}
                  </span>
                )}
              </Link>
            )
          })
        )}

        <Separator className="my-4" />

        <div className="space-y-1">
          <Link
            href="/settings"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground hover:bg-primary-foreground"
          >
            <Settings className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Ajustes</span>
          </Link>

          <Link
            href="/help"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground hover:bg-primary-foreground"
          >
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Ayuda</span>
          </Link>
        </div>
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm">
            <p className="font-medium">Rol</p>
            <p className="text-xs text-muted-foreground">
              {groups.length ? groups.join(", ") : "No roles"}
            </p>
          </div>

          <Button
            variant="ghost"
            className="text-sm px-3"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2 inline" /> Cerrar sesión
          </Button>
        </div>
      </div>
    </aside>
  )
}