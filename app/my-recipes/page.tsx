"use client"

import React, { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
// import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Tablet,
  Droplet,
  Hash,
  Calendar,
  Repeat,
  FileText,
  Eye,
  Box,
} from "lucide-react"

/**
 * MyRecipesPage
 * - Lists rectangullar tall cards for each prescription (recipe)
 * - Each card shows icon (by dosageFormat), medication, dosage, frequency, until, short notes
 * - "Ver" button opens a dialog with full recipe details
 *
 * This component is read-only (list + view).
 */

/* ----- Types ----- */
type DosageFormat = "mg" | "ml" | "pastilla" | "gota" | "tableta" | "cápsula"
type FrequencyType = "Horas" | "Dias" | "Semanas"

type Recipe = {
  id: string
  medication: string
  dosage: number
  dosageFormat: DosageFormat
  frequency: number
  frequencyType: FrequencyType
  until: string // ISO date string
  notes?: string
  issuedAt?: string
}

/* ----- Icon mapping ----- */
const FormatIcon: Record<DosageFormat, React.ReactNode> = {
  mg: <Hash className="h-6 w-6" />,
  ml: <Droplet className="h-6 w-6" />,
  pastilla: <Tablet className="h-6 w-6" />,
  gota: <Droplet className="h-6 w-6" />,
  tableta: <Tablet className="h-6 w-6" />,
  "cápsula": <Tablet className="h-6 w-6" />,
}

const getFrequencyType = (frequencyType: FrequencyType, frequency: number): string => {
    if (frequency === 1) {
        return "Cada " + frequencyType.substring(0, frequencyType.length - 1)
    }
    return "Cada " + frequency + " " + frequencyType
}

/* ----- Sample data (replace with props / API) ----- */
const sampleRecipes: Recipe[] = [
  {
    id: "r1",
    medication: "Amoxicilina",
    dosage: 500,
    dosageFormat: "mg",
    frequency: 8,
    frequencyType: "Horas",
    until: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    notes: "Tomar con alimentos. Completar tratamiento.",
    issuedAt: new Date().toISOString(),
  },
  {
    id: "r2",
    medication: "Paracetamol",
    dosage: 650,
    dosageFormat: "mg",
    frequency: 6,
    frequencyType: "Horas",
    until: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
    notes: "No exceder 4 dosis al día.",
    issuedAt: new Date().toISOString(),
  },
  {
    id: "r3",
    medication: "Jarabe para la tos",
    dosage: 10,
    dosageFormat: "ml",
    frequency: 1,
    frequencyType: "Dias",
    until: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
    notes: "Medir con dosificador incluido.",
    issuedAt: new Date().toISOString(),
  },
  {
    id: "r4",
    medication: "Vitamina D",
    dosage: 1,
    dosageFormat: "pastilla",
    frequency: 6,
    frequencyType: "Horas",
    until: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
    notes: "Tomar con la comida principal.",
    issuedAt: new Date().toISOString(),
  },
]

/* ----- Helper to format dates in Spanish ----- */
function formatDateISO(iso?: string) {
  if (!iso) return "-"
  try {
    return format(new Date(iso), "PPP", { locale: es })
  } catch {
    return iso
  }
}

/* ----- Main component ----- */
export default function MyRecipesPage({ recipes = sampleRecipes }: { recipes?: Recipe[] }) {
  const [active, setActive] = useState<Recipe | null>(null)

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Mis Recetas</h1>
          <p className="text-sm text-muted-foreground">Lista de recetas emitidas por tus médicos. Solo lectura.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((r) => (
          <Card key={r.id} className="h-56 flex flex-col overflow-hidden">
            <CardHeader className="px-4 pt-4 pb-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    {/* Icon */}
                    {FormatIcon[r.dosageFormat]}
                  </div>
                  <div>
                    <CardTitle className="text-base">{r.medication}</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      {r.dosage} {r.dosageFormat}
                    </CardDescription>
                  </div>
                </div>

                <div className="text-right">
                  {/* <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="rounded">
                        <Calendar className="h-3.5 w-3.5 mr-2 inline" />
                        {formatDateISO(r.until)}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent side="top">Válida hasta</TooltipContent>
                  </Tooltip> */}
                </div>
              </div>
            </CardHeader>

            <CardContent className="px-4 pb-4 pt-2 flex-1 flex flex-col justify-between">
              <div className="text-sm text-muted-foreground line-clamp-3">
                {r.notes ?? "— Sin observaciones —"}
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <Repeat className="h-4 w-4" />
                  <span>{getFrequencyType(r.frequencyType, r.frequency)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setActive(r)}>
                    Ver
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detail dialog */}
      <Dialog open={Boolean(active)} onOpenChange={() => setActive(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{active?.medication}</DialogTitle>
          </DialogHeader>

          {active && (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  {FormatIcon[active.dosageFormat]}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Dosis</p>
                  <p className="text-lg font-medium">
                    {active.dosage} {active.dosageFormat}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">Frecuencia: {getFrequencyType(active.frequencyType, active.frequency)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Válida hasta</p>
                  <p className="font-medium">{formatDateISO(active.until)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Emitida</p>
                  <p className="font-medium">{formatDateISO(active.issuedAt)}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Indicaciones</p>
                <p className="whitespace-pre-line">{active.notes ?? "— Sin observaciones —"}</p>
              </div>

              <div className="text-right">
                <Button onClick={() => setActive(null)}>Cerrar</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
