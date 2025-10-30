"use client"

import { useEffect, useState } from "react"
import { client } from "@/lib/amplifyClient"
import type { Schema } from "@/amplify/data/resource"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
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
import { Appointment, Doctor, doctorList } from "./types"
import { DoctorSchema } from "../doctors/types"

const appointmentSchema = z.object({
  doctorId: z.string(),
  timeScheduled: z.string().min(2, "El nombre es requerido"),
  dateScheduled: z
    .string()
    .nonempty("La fecha de nacimiento requerida")
    .refine((val) => !isNaN(Date.parse(val)), "La fecha es invalida"),
  type: z.enum(["Primaria", "Preventiva"], {
    required_error: "El tipo es requerido",
  }),
})

type AppointmentFormValues = z.infer<typeof appointmentSchema>

export default function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState<Array<Appointment>>([])
  const [doctors, setDoctors] = useState<Array<Doctor>>([])
  const [specialties, setSpecialties] = useState<string[]>([])

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Setup form
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      doctorId: "",
      timeScheduled: "",
      dateScheduled: "",
      type: undefined
    },
  })
  // Load doctors on mount
  useEffect(() => {
    const loadAppointments = async () => {
      try {
        // const { data, errors } = await client.models.Appointment.listAppointmentByPatientIdAndScheduledOn({ patientId: "1" }, { selectionSet: ["scheduledOn", "status", "doctor.name", "doctor.specialty"] } )
        setTimeout(() => {
          const specialties = [
            "Cardiologia",
            "Ortopedia"
          ]
          setSpecialties(specialties)
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

  // Handle appointment creation
  const onSubmit = async (values: AppointmentFormValues) => {
    setSubmitting(true)
    try {
      // const { data, errors } = await client.models.Appointment.create(values)
      // if (errors) {
      //   console.error("Error creating appointment:", errors)
      //   toast.error("Error al crear al appointment", {
      //     description: errors[0]["message"]
      //   })
      // } else if (data) {
      //   setAppointments((prev) => [...prev, data])
      //   setOpenDialog(false)
      //   toast.success("Cita creada con exito", {
      //     description: values.doctorId + " ya puede ingresar al sistema."
      //   })
      //   form.reset()
      // }
    } catch (err) {
      console.error("Create failed:", err)
      toast.error("Algo salio mal...")
    } finally {
      setSubmitting(false)
    }
  }

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
        <CreateAppointmentDialog/>
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
