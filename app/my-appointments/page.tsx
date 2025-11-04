"use client"

import { useEffect, useState } from "react"
import { client } from "@/lib/amplifyClient"
import type { Schema } from "@/amplify/data/resource"
import { Loader2 } from "lucide-react"
// shadcn/ui components
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item"
import { toast } from "sonner"
import { CreateAppointmentDialog } from "./components/CreateAppointmentDialog"
import { Appointment } from "./types"
import { fetchAuthSession } from "aws-amplify/auth"

export default function MyAppointmentsPage() {
  let patientId = "";
  const [appointments, setAppointments] = useState<Array<Appointment>>([])
  const [loading, setLoading] = useState(true)

  // Load doctors on mount
  useEffect(() => {
    const loadAppointments = async () => {

      try {
        const { tokens } = await fetchAuthSession();
        const sub = tokens?.idToken?.payload["sub"] as string;
        patientId = sub; 

        // if (!sub) {
        //   setLoading(false);
        //   return;
        // }
        // const { data, errors } = await client.models.Appointment.listAppointmentByPatientIdAndScheduledOn({ patientId: patientId }, { selectionSet: ["scheduledOn", "status", "doctor.name", "doctor.specialty"] } )
        setTimeout(() => {
          const appointments = [
            {
              scheduledOn: "20 de Octubre, 2025 - 8:30PM",
              status: "Aprobada" as any,
              doctor: {
                name: "Mario Lopez",
                specialty: "Neurocirugia"
              }
            },
            {
              scheduledOn: "25 de Octubre, 2025 - 2:30PM",
              status: "Aprobada" as any,
              doctor: {
                name: "Maria Gutierrez",
                specialty: "Cardiologia"
              }
            }
          ]
          setAppointments(appointments)
          setLoading(false)
        }, 500);
        // if (errors) console.error(errors)
        // else setAppointments(data)
      } catch (err) {
        console.error("Failed to load appointments:", err)
      } finally {
        // setLoading(false)
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
    <div className="sm:p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Citas</h1>

        {/* Dialog for adding new Cita */}
        <CreateAppointmentDialog setAppointments={setAppointments} patientId={patientId}/>
      </div>

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
                  Agendada para {apt.scheduledOn}
                </ItemDescription>
              </ItemContent>
            </Item>
          ))}
        </ul>
      )}
    </div>
  )
}
