"use client"

import { useEffect, useState } from "react"
import { client } from "@/lib/amplifyClient"
import type { Schema } from "@/amplify/data/resource"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon, Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Nullable } from "@aws-amplify/data-schema"
import { es } from "date-fns/locale"

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
  type: z.enum(["Primaria", "Preventiva"], {
    required_error: "El tipo es requerido",
  }),
})

type AppointmentFormValues = z.infer<typeof appointmentSchema>
type Appointment = {
  readonly scheduledOn: string;
  readonly doctor: {
    readonly name: string;
    readonly specialty: Nullable<string>;
  }
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Array<Appointment>>([])
  const [doctors, setDoctors] = useState<Array<Schema["Doctor"]["updateType"]>>([])
  const [specialties, setSpecialties] = useState<string[]>([])
  const [specialty, setSpecialty] = useState<string>("")

  const [openDialog, setOpenDialog] = useState(false)
  const [openSpecialties, setOpenSpecialties] = useState(false)
  const [openCalendar, setOpenCalendar] = useState(false)
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

  // Helper to check if the selected date’s weekday is available
  let businessHours: object;
  const isOpenDay = (date: Date) => {
    const weekday = date
      .toLocaleString("en-ES", { weekday: "long" })
      .toLowerCase()
    return Object.keys(businessHours).includes(weekday)
  }

  // Load doctors on mount
  useEffect(() => {
    const loadAppointments = async () => {
      try {
        // const { data, errors } = await client.models.Appointment.list({ filter: { patientId: { eq: "1" } }, selectionSet: ["scheduledOn", "doctor.name", "doctor.specialty"] })
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
        // const { data, errors } = await client.models.Doctor.list({ filter: { status: { eq: "Activo" }, specialty: { eq: specialty ?? undefined } }, selectionSet: ["id", "name", "businessHours"] })
        setTimeout(() => {
          const doctors = [
            {
              id: "1",
              name: "Juan Perez",
              specialty: "Neurologia",
              businessHours: {
                monday: "8:00-17:00",
                tuesday: "8:00-17:00",
                wednesday: "8:00-17:00",
                thursday: "8:00-17:00",
                friday: "8:00-17:00"
              }
            },
            {
              id: "2",
              name: "Juan Bolivar",
              businessHours: {
                monday: "8:00-17:00",
                tuesday: "8:00-17:00",
                wednesday: "8:00-17:00",
                thursday: "8:00-17:00",
                friday: "8:00-17:00"
              }
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
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando citas...</span>
      </div>
    )

  return (
    <div className="sm:p-6">
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
            {!specialty && (
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
            )}
            {specialty && (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                  {/* Seleccionar doctor */}
                  <FormField
                    control={form.control}
                    name="doctorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Doctor</FormLabel>
                        <FormControl>
                          <Popover open={openDoctors} onOpenChange={setOpenDoctors}>
                            <PopoverTrigger asChild>
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
                                          businessHours = doctors.find((d) => d.id === field.value)?.businessHours as object ?? {}
                                          if (field.value === currentValue) {
                                            form.setValue("dateScheduled", "")
                                            form.setValue("timeScheduled", "")
                                          }
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

                  {/* Date of Schedule */}
                  <FormField
                    control={form.control}
                    name="dateScheduled"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de Cita</FormLabel>
                        <FormControl>
                          <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="justify-between w-full"
                              >
                                {field.value
                                  ? new Date(field.value).toLocaleDateString("es-ES", {
                                    weekday: "long",
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                  })
                                  : "Seleccionar fecha..."}
                                <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                locale={es} // 🇪🇸 calendar in Spanish
                                selected={field.value ? new Date(field.value) : undefined}
                                captionLayout="dropdown"
                                onSelect={(date) => {
                                  field.onChange(date?.toISOString() || "")
                                  setOpenCalendar(false)
                                }}
                                disabled={(date) => !isOpenDay(date)} // disable non-working days
                              />
                            </PopoverContent>
                          </Popover>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
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
