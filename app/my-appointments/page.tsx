"use client"

import { useEffect, useState } from "react"
import { client } from "@/lib/amplifyClient"
import type { Schema } from "@/amplify/data/resource"
import { Loader2 } from "lucide-react"
// shadcn/ui components
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item"
import { toast } from "sonner"
import { CreateAppointmentDialog } from "./components/CreateAppointmentDialog"
import { Appointment } from "./types"
import { fetchAuthSession } from "aws-amplify/auth"

export default function MyAppointmentsPage() {
  const [patientId, setPatientId] = useState("")
  const [appointments, setAppointments] = useState<Array<Appointment>>([])
  const [loading, setLoading] = useState(true)

  // Load doctors on mount
  useEffect(() => {
    const loadAppointments = async () => {

      try {
        const { tokens } = await fetchAuthSession();
        const sub = tokens?.idToken?.payload["sub"] as string;
        setPatientId(sub); 

        if (!sub) {
          setLoading(false);
          return;
        }
        const { data, errors } = await client.models.Appointment.listAppointmentByPatientIdAndScheduledOn({ patientId: sub }, { selectionSet: ["scheduledOn", "status", "doctor.name", "doctor.specialty"] } )
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

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando citas...</span>
      </div>
    )

  return (
    <div className="sm:p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Mis Citas</h1>
          <p className="text-sm text-muted-foreground">Lista de citas registradas, aprobadas, completadas y canceladas.</p>
        </div>
        {/* Dialog for adding new Cita */}
        <CreateAppointmentDialog setAppointments={setAppointments} patientId={patientId}/>
      </header>

      {/* Doctor List */}
      {appointments.length === 0 ? (
        <p>No se encontraron citas.</p>
      ) : (
        <ul className="space-y-2">
          {appointments.map((apt) => (
            <Item variant="outline" key={apt.scheduledOn}>
              <ItemContent>
                <ItemTitle>
                  Cita con Dr. {apt.doctor.name}{" "}
                  <span className="text-muted-foreground hidden sm:block">especialista en {apt.doctor.specialty ?? "Medicina General"}</span>
                </ItemTitle>
                <ItemDescription>
                  Agendada para {new Date(apt.scheduledOn).toLocaleString("es-ES", {dateStyle: "long",timeStyle: "short", hour12: true})}
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                {apt.status}
              </ItemActions>
            </Item>
          ))}
        </ul>
      )}
    </div>
  )
}
