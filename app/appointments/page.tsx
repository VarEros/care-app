"use client"

import { useEffect, useState } from "react"
import { client } from "@/lib/amplifyClient"
import type { Schema } from "@/amplify/data/resource"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Nullable } from "@aws-amplify/data-schema"

// shadcn/ui components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item"
import { toast } from "sonner"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"

const appointmentSchema = z.object({
  doctorId: z.string(),
  timeScheduled: z.string().min(2, "El nombre es requerido"),
  dateScheduled: z
    .string()
    .nonempty("La fecha de nacimiento requerida")
    .refine((val) => !isNaN(Date.parse(val)), "La fecha es invalida"),
  type: z.enum(["Masculino", "Femenino", "Otro"], {
    required_error: "El genero es requerido",
  }),
})

type AppointmentFormValues = z.infer<typeof appointmentSchema>
type Appointment = {
    readonly scheduledOn: string;
    readonly doctor: {
        readonly name: string;
        readonly specialty: Nullable<string>;
    };
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Array<Appointment>>([])
  const [doctors, setDoctors] = useState<Array<Schema["Doctor"]["updateType"]>>([])
  const [specialties, setSpecialties] = useState<string[]>([])
  const [specialty, setSpecialty] = useState<string>("")
  const [date, setDate] = useState<Date | undefined>(new Date())

  const [openDialog, setOpenDialog] = useState(false)
  const [openSpecialties, setOpenSpecialties] = useState(false)
  const [openDoctors, setOpenDoctors] = useState(false)
  
  const [loading, setLoading] = useState(true)
  const [loadingDoctors, setLoadingDoctors] = useState(false)
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
        // const { data, errors } = await client.models.Appointment.list({filter: {patientId: {eq: "1"}}, selectionSet: ["scheduledOn", "doctor.name", "doctor.specialty"]})
        setTimeout(() => {
          const specialties = [
            "Cardiologia",
            "Ortopedia"
          ]
          setSpecialties(specialties)
          const appointments = [
            {
              scheduledOn: "20 de Octubre, 2025 - 8:30PM",
              doctor: {
                name: "Mario Lopez",
                specialty: "Neurocirugia"
              }
            },
            {
              scheduledOn: "25 de Octubre, 2025 - 2:30PM",
              doctor: {
                name: "Maria Gutierrez",
                specialty: "Cardiologia"
              }
            }
          ]
          setAppointments(appointments)
          setLoading(false)
        }, 2000);
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
  
  // Load doctors on mount
  useEffect(() => {
    if (!specialty) return
    setLoadingDoctors(true)
    const loadDoctors = async () => {
      try {
        // const { data, errors } = await client.models.Doctor.list({filter: {status: {eq: "Activo"}, specialty: {eq: specialty ?? undefined}}, selectionSet: ["id", "name"]})
        setTimeout(() => {
          const doctors = [
            {
              id: "1",
              name: "Juan Perez",
              email: "juanperez@gmail.com",
              specialty: "Neurologia"
            },
            {
              id: "2",
              name: "Juan Bolivar",
              email: "juanbolivar@gmail.com"
            }
          ];
          setDoctors(doctors)
          setLoadingDoctors(false)
        }, 1000)
        // if (errors) console.error(errors)
        // else setDoctors(data)
      } catch (err) {
        console.error("Failed to load appointments:", err)
      } finally {
        // setLoadingDoctors(false)
      }
    }

    loadDoctors()
  }, [specialty])

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
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-blue-600">Cargando citas...</span>
      </div>
    )

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Citas</h1>

        {/* Dialog for adding new Cita */}
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="w-[200px]">Agendar Cita</Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Creacion de Nueva Cita</DialogTitle>
              <DialogDescription>
                Llena el formulario para registrar su cita, espere hasta que el doctor revise y valide su cita para considerarla agendada.
              </DialogDescription>
            </DialogHeader>
            <Popover open={openSpecialties} onOpenChange={setOpenSpecialties}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openSpecialties}
                  className="justify-between"
                >
                  {specialty || "Selecciona un especialidad..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0">
                <Command>
                  <CommandInput placeholder="Busca especialidad..." className="h-9" />
                  <CommandList>
                    <CommandEmpty>Especialidad no encontrada</CommandEmpty>
                    <CommandGroup>
                      {specialties.map((s, index) => (
                        <CommandItem
                          key={index}
                          value={s}
                          onSelect={(currentValue) => {
                            setSpecialty(currentValue)
                            setOpenSpecialties(false)
                          }}
                        >
                          {s}
                          <Check
                            className={cn(
                              "ml-auto",
                              specialty === s ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {specialty && (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {/* Name */}
                  <FormField
                    control={form.control}
                    name="doctorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Doctor</FormLabel>
                        <FormControl>
                          <Popover open={openDoctors} onOpenChange={setOpenDoctors}>
                            <PopoverTrigger asChild>
                              {loadingDoctors ? (
                                <Button variant="outline" disabled className="justify-between">
                                  Cargando Doctores...
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  aria-expanded={openDoctors}
                                  className="justify-between"
                                >
                                  {field.value
                                    ? doctors.find((d) => d.id === field.value)?.name
                                    : "Selecciona un doctor..."}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              )}
                            </PopoverTrigger>
                            <PopoverContent className="p-0">
                              <Command>
                                <CommandInput placeholder="Busca doctores..." className="h-9" />
                                <CommandList>
                                  <CommandEmpty>Doctor no encontrado</CommandEmpty>
                                  <CommandGroup>
                                    {doctors.map((d) => (
                                      <CommandItem
                                        key={d.id}
                                        value={d.id}
                                        onSelect={(currentValue) => {
                                          field.onChange(currentValue)
                                          setOpenDoctors(false)
                                        }}
                                      >
                                        {d.name}
                                        <Check
                                          className={cn(
                                            "ml-auto",
                                            field.value === d.id ? "opacity-100" : "opacity-0"
                                          )}
                                        />
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(day) => day < new Date(new Date().setHours(0, 0, 0, 0))}
                    className="rounded-lg border"
                  />

                  <DialogFooter>
                    <Button type="submit" className="w-full" disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        "Crear Cita"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Doctor List */}
      {appointments.length === 0 ? (
        <p>No se encontraron citas.</p>
      ) : (
        <ul className="space-y-2">
          {appointments.map((apt) => (
            <Item variant="outline" key={apt.scheduledOn}>
              <ItemContent>
                <ItemTitle className="line-clamp-1">
                  Cita con {apt.doctor.name}{" "}
                  <span className="text-muted-foreground">especialista en {apt.doctor.specialty ?? "Medicina General"}</span>
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
