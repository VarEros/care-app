"use client"

import { useEffect, useState, useMemo } from "react"
import { client } from "@/lib/amplifyClient"
import { Loader2 } from "lucide-react"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { fetchAuthSession } from "aws-amplify/auth"
import { Nullable } from "@aws-amplify/data-schema"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"

type Appointment = {
  readonly status: "Registrada" | "Aprobada" | "Completada" | "Cancelada" | null
  readonly scheduledOn: string
  readonly motive: Nullable<string>
  readonly patient: {
    readonly name: string
    readonly cedula: string
  }
}

export default function AppointmentsPage() {
  const [doctorId, setDoctorId] = useState("")
  const [appointments, setAppointments] = useState<Array<Appointment>>([])
  const [active, setActive] = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("Registrada")

  // Load doctor appointments
  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const { tokens } = await fetchAuthSession()
        const sub = tokens?.idToken?.payload["sub"] as string

        if (!sub) {
          setLoading(false)
          return
        }
        setDoctorId(sub)

        const { data, errors } = await client.models.Appointment.list({
          doctorId,
          selectionSet: ["scheduledOn", "motive", "status", "patient.name", "patient.cedula"],
        })

        if (errors) console.error(errors)
        else setAppointments(data)
      } catch (err) {
        console.error("Failed to load appointments:", err)
      } finally {
        setLoading(false)
      }
    }

    loadAppointments()
  }, [])

  // Update appointment status
  const handleUpdateAppointment = async (
    scheduledOn: string,
    type: "Cancelada" | "Aprobada" | "Completada"
  ) => {
    setSubmitting(true)
    try {
      const { data, errors } = await client.models.Appointment.update(
        { doctorId, scheduledOn, status: type },
        { selectionSet: ["scheduledOn", "motive", "status", "patient.name", "patient.cedula"] }
      )

      if (errors) {
        console.error("Error updating appointment:", errors)
        toast.error("Error al " + type.toLowerCase() + " la cita", {
          description: errors[0]?.message,
        })
      } else if (data) {
        setAppointments((prev) =>
          prev.map((apt) => (apt.scheduledOn === data.scheduledOn ? data : apt))
        )
        if (active?.scheduledOn === data.scheduledOn) setActive(data)
        toast.success("Cita " + type + " con éxito", {
          description: "La cita ha sido " + type.toLowerCase() + " correctamente.",
        })
      }
    } catch (err) {
      console.error("Update failed:", err)
      toast.error("Algo salió mal...")
    } finally {
      setSubmitting(false)
    }
  }

  const handleViewDetails = (scheduledOn: string) => {
    const apt = appointments.find((a) => a.scheduledOn === scheduledOn) || null
    setActive(apt)
  }

  const filteredAppointments = useMemo(() => {
    if (statusFilter === "all") return appointments
    return appointments.filter((a) => a.status === statusFilter)
  }, [appointments, statusFilter])

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando citas...</span>
      </div>
    )

  return (
    <div className="sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <h1 className="text-xl font-bold">Citas</h1>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="Registrada">Registradas</SelectItem>
            <SelectItem value="Aprobada">Aprobadas</SelectItem>
            <SelectItem value="Completada">Completadas</SelectItem>
            <SelectItem value="Cancelada">Canceladas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Appointment list */}
      {filteredAppointments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No se encontraron citas.</p>
      ) : (
        <ul className="space-y-2">
          {filteredAppointments.map((apt) => (
            <Item variant="outline" key={apt.scheduledOn}>
              <ItemContent>
                <ItemTitle>
                  Cita con {apt.patient.name}{" -"}
                  <span className="text-muted-foreground hidden sm:block">Por {apt.motive}</span>
                </ItemTitle>
                <ItemDescription>
                  <span className="text-foreground">{apt.status}  </span>
                   para {new Date(apt.scheduledOn).toLocaleString("es-ES", {dateStyle: "long",timeStyle: "short", hour12: true})}
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <Button size="sm" onClick={() => handleViewDetails(apt.scheduledOn)}>
                  Ver detalles
                </Button>
              </ItemActions>
            </Item>
          ))}
        </ul>
      )}

      {/* Details dialog */}
      <Dialog open={Boolean(active)} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalles de la cita</DialogTitle>
            <DialogDescription>
              Información detallada de la cita.
            </DialogDescription>
          </DialogHeader>

          {active ? (
            <div className="space-y-4 pt-2">
              <div>
                <p className="text-xs text-muted-foreground">Paciente</p>
                <p className="font-medium">{active.patient.name}</p>
                <p className="text-sm text-muted-foreground">{active.patient.cedula}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Fecha</p>
                <p className="font-medium">{new Date(active.scheduledOn).toLocaleString("es-ES", {dateStyle: "long",timeStyle: "short", hour12: true})}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Motivo</p>
                <p className="font-medium">{active.motive ?? "—"}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Estado</p>
                <p className="font-medium">{active.status ?? "—"}</p>
              </div>

              <DialogFooter className="flex items-center justify-end gap-2">
                {active.status !== "Cancelada" && (
                  <Button
                    variant="outline"
                    onClick={() => handleUpdateAppointment(active.scheduledOn, "Cancelada")}
                    disabled={submitting}
                  >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Cancelar Cita
                  </Button>
                  )}

                  {active.status === "Registrada" && (
                    <Button
                      onClick={() => handleUpdateAppointment(active.scheduledOn, "Aprobada")}
                      disabled={submitting}
                    >
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Aprobar Cita
                    </Button>
                  )}
              </DialogFooter>
            </div>
          ) : (
            <div className="py-8 text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
