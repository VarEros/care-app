"use client"

import React, { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

/**
 * Simple Settings page
 * - Theme selector (light / dark / system)
 * - Minimal "New settings coming soon" placeholder
 */

export default function SimpleSettingsPage() {
  const { theme, setTheme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const effective = theme === "system" ? systemTheme : theme

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Configuración</h1>
        <p className="text-sm text-muted-foreground">Ajustes rápidos de la aplicación</p>
      </header>

      <div className="grid grid-cols-1 gap-6">
        <Card>
            <CardHeader>
              <CardTitle>Tema</CardTitle>
              <CardDescription>Selecciona el tema de la interfaz</CardDescription>
              <div className="w-48">
                <Select onValueChange={(v) => setTheme(v)} defaultValue={theme ?? "system"}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={mounted ? String(effective) : "cargando..."} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Claro</SelectItem>
                    <SelectItem value="dark">Oscuro</SelectItem>
                    <SelectItem value="system">Sistema</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <CardAction>
                <Button onClick={() => setTheme("system")} variant="outline" size="sm">
                  Restablecer
                </Button>
              </CardAction>
            </CardHeader>
        </Card>

        <Card>
          <CardHeader>
              <CardTitle>Nuevas opciones</CardTitle>
              <CardDescription>Más ajustes estarán disponibles pronto.</CardDescription>

            <CardAction className="text-right">
              <Button variant="outline" size="sm" onClick={() => alert("Próximamente")}>
                Ver
              </Button>
            </CardAction>
          </CardHeader>

          <CardContent>
            <li>Notificaciones — Próximamente</li>
            <li>Privacidad avanzada — Próximamente</li>
            <li>Integraciones — Próximamente</li>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
