"use client"

import React, { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { format, set } from "date-fns"
import { es } from "date-fns/locale"
import { Loader2, Printer, X } from "lucide-react"
import { client } from "@/lib/amplifyClient"
import { Nullable } from "@aws-amplify/data-schema"

type Consultation = {
  readonly doctorId: string;
  readonly scheduledOn: string;
  readonly reason: string;
  readonly diagnosis: string;
  readonly treatment: Nullable<string>;
  readonly observations: Nullable<string>;
  readonly startedAt: string;
  readonly endedAt: string;
}

export default function ConsultationModal({
  open,
  onOpenChange,
  consultationId,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  consultationId: string
}) {
  const [consultation, setConsultation] = useState<Consultation | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!consultationId) return
    const loadConsultation = async () => {
      try {
        setLoading(true)
        const { data, errors } = await client.models.Consultation.get({id: consultationId},{ selectionSet: ["doctorId", "scheduledOn", "reason", "diagnosis", "treatment", "observations", "startedAt", "endedAt"]})
        if (errors) console.error(errors)
        else setConsultation(data)
      } catch (err) {
        console.error("Failed to load consultation:", err)
      } finally {
        setLoading(false)
      }
    }
    loadConsultation();
  }, [consultationId])
  

  const fmt = (iso?: string | null) => {
    if (!iso) return "—"
    try {
      return format(new Date(iso), "PPP 'a las' h:mm a", { locale: es })
    } catch {
      return iso
    }
  }

  const fmtShort = (iso?: string | null) => {
    if (!iso) return "—"
    try {
      return format(new Date(iso), "h:mm a", { locale: es })
    } catch {
      return iso
    }
  }

  const duration = (start?: string | null, end?: string | null) => {
    if (!start || !end) return "—"
    try {
      const s = new Date(start)
      const e = new Date(end)
      const mins = Math.round((e.getTime() - s.getTime()) / 60000)
      const h = Math.floor(mins / 60)
      const m = mins % 60
      return `${h > 0 ? `${h} horas ` : ""}${m} minutos`
    } catch {
      return "—"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Optional trigger if parent wants to render it inside; kept empty so parent controls open */}
      <DialogTrigger asChild>
        <span />
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl min-h-[600px]">
        <DialogHeader>
          <DialogTitle>Detalles de la consulta</DialogTitle>
          <DialogDescription>
            Información completa de la consulta programada y el registro clínico.
          </DialogDescription>
        </DialogHeader>



        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Cargando datos de la consulta...</span>
          </div>
        ) :
        !consultation ? (
          <div className="py-8 text-center">No hay datos de la consulta.</div>
        ) : (
          <div className="space-y-4 py-2">
            <Card className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Fecha programada</p>
                  <p className="text-sm font-medium">{fmt(consultation.scheduledOn)}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Duración</p>
                  <p className="text-sm font-medium">{duration(consultation.startedAt, consultation.endedAt)}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Inicio</p>
                  <p className="text-sm font-medium">{fmtShort(consultation.startedAt)}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Fin</p>
                  <p className="text-sm font-medium">{fmtShort(consultation.endedAt)}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex flex-col space-y-4">
                <p className="text-xs text-muted-foreground">Motivo</p>
                <p className="text-sm font-medium">{consultation.reason}</p>

                <Separator />

                <p className="text-xs text-muted-foreground">Diagnóstico</p>
                <p className="text-sm font-medium whitespace-pre-line">{consultation.diagnosis}</p>

                <Separator />

                <p className="text-xs text-muted-foreground">Tratamiento</p>
                <p className="text-sm font-medium whitespace-pre-line">{consultation.treatment ?? "—"}</p>

                <Separator />

                <p className="text-xs text-muted-foreground">Observaciones</p>
                <p className="text-sm font-medium whitespace-pre-line">{consultation.observations ?? "—"}</p>
                  
              </div>
            </Card>
          </div>
        )}

        <DialogFooter>
          <div className="flex items-center justify-between w-full gap-2">
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                <X className="mr-2 h-4 w-4" /> Cerrar
              </Button>

              <Button
                variant="ghost"
                onClick={() => {
                  // simple print: print only the consultation content (fallback)
                  window.print()
                }}
                disabled={!consultation}
              >
                <Printer className="mr-2 h-4 w-4" /> Imprimir
              </Button>
            </div>

            <div className="text-sm text-muted-foreground self-center">
              {consultation ? `Realizada: ${format(new Date(consultation.startedAt), "PPP", { locale: es })}` : ""}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
