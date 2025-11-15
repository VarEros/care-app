"use client"

import React, { useEffect, useMemo, useState } from "react"
import { endOfDay, format } from "date-fns"
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
import { client } from "@/lib/amplifyClient"
import { fetchAuthSession } from "aws-amplify/auth"
import { Nullable } from "@aws-amplify/data-schema"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

/* ----- Types ----- */

type Recipe = {
    readonly id: string;
    readonly medication: string;
    readonly dosage: number;
    readonly dosageFormat: "mg" | "ml" | "pastilla" | "gota" | "tableta" | "capsula" | null;
    readonly frequency: number;
    readonly frequencyType: "Horas" | "Dias" | "Semanas" | null;
    readonly until: string;
    readonly notes: Nullable<string>;
    readonly consultation: {
        readonly startedAt: string;
    };
}

/* ----- Icon mapping ----- */
const FormatIcon: Record<string, React.ReactNode> = {
  mg: <Hash className="h-6 w-6" />,
  ml: <Droplet className="h-6 w-6" />,
  pastilla: <Tablet className="h-6 w-6" />,
  gota: <Droplet className="h-6 w-6" />,
  tableta: <Tablet className="h-6 w-6" />,
  "cápsula": <Tablet className="h-6 w-6" />,
}

const getFrequencyType = (frequencyType: string, frequency: number): string => {
    if (frequency === 1) {
        return "Cada " + frequencyType.substring(0, frequencyType.length - 1)
    }
    return "Cada " + frequency + " " + frequencyType
}

/* ----- Helper to format dates in Spanish ----- */
function formatDateISO(iso?: string) {
  if (!iso) return "-"
  try {
    return format(new Date(iso), "PPP", { locale: es })
  } catch {
    return iso
  }
}

let patientId = "";

/* ----- Main component ----- */
export default function MyRecipesPage() {

  const [active, setActive] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [recipes, setRecipes] = useState<Array<Recipe>>([])

  useEffect(() => {
    const loadRecipes = async () => {
      setLoading(true)
      try {
        const { tokens } = await fetchAuthSession();
        const sub = tokens?.idToken?.payload["sub"] as string;
        patientId = sub; 

        if (!sub) {
          setLoading(false);
          return;
        }
        // await setTimeout(() => {
        //   setRecipes(patientsSample)
        // }, 500);
        const { data, errors } = await client.models.Recipe.list({filter: { patientId: { eq: patientId}}, selectionSet: ["id", "medication", "dosage", "dosageFormat", "frequency", "frequencyType", "until", "notes", "consultation.startedAt"]})
        if (errors) console.error(errors)
        else setRecipes(data ?? [])
      } catch (err) {
        console.error("Failed to load patients:", err)
        setRecipes([])
      } finally {
        setLoading(false)
      }
    }
    loadRecipes()
  }, [])

  const todayEnd = endOfDay(new Date())

const activeRecipes = useMemo(
  () => recipes.filter((r) => {
    try {
      return new Date(r.until).getTime() >= todayEnd.getTime()
    } catch {
      return false
    }
  }),
  [recipes]
)

const expiredRecipes = useMemo(
  () => recipes.filter((r) => {
    try {
      return new Date(r.until).getTime() < todayEnd.getTime()
    } catch {
      return true
    }
  }),
  [recipes]
)

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Mis Recetas</h1>
          <p className="text-sm text-muted-foreground">Lista de recetas emitidas por tus médicos. Solo para revisión.</p>
        </div>
      </header>

<Tabs defaultValue="active" className="space-y-4">
    <TabsList>
      <TabsTrigger value="active">Vigentes ({activeRecipes.length})</TabsTrigger>
      <TabsTrigger value="expired">Vencidas ({expiredRecipes.length})</TabsTrigger>
    </TabsList>

    <TabsContent value="active" className="pt-4">
      {activeRecipes.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay recetas vigentes.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeRecipes.map((r) => (
            <Card key={r.id} className="h-56 flex flex-col overflow-hidden">
              <CardHeader className="px-4 pt-4 pb-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      {FormatIcon[r.dosageFormat!]}
                    </div>
                    <div>
                      <CardTitle className="text-base">{r.medication}</CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        {r.dosage} {r.dosageFormat}
                      </CardDescription>
                    </div>
                  </div>

                  <div className="text-right">
                    {/* optionally place badge / metadata here */}
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
                    <span>{getFrequencyType(r.frequencyType!, r.frequency)}</span>
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
      )}
    </TabsContent>

    <TabsContent value="expired" className="pt-4">
      {expiredRecipes.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay recetas vencidas.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {expiredRecipes.map((r) => (
            <Card key={r.id} className="h-56 flex flex-col overflow-hidden">
              <CardHeader className="px-4 pt-4 pb-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      {FormatIcon[r.dosageFormat!]}
                    </div>
                    <div>
                      <CardTitle className="text-base">{r.medication}</CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        {r.dosage} {r.dosageFormat}
                      </CardDescription>
                    </div>
                  </div>

                  <div className="text-right">
                    {/* optionally place badge / metadata here */}
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
                    <span>{getFrequencyType(r.frequencyType!, r.frequency)}</span>
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
      )}
    </TabsContent>
  </Tabs>

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
                  {FormatIcon[active.dosageFormat!]}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Dosis</p>
                  <p className="text-lg font-medium">
                    {active.dosage} {active.dosageFormat}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">Frecuencia: {getFrequencyType(active.frequencyType!, active.frequency)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Válida hasta</p>
                  <p className="font-medium">{formatDateISO(active.until)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Emitida</p>
                  <p className="font-medium">{formatDateISO(active.consultation.startedAt)}</p>
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
