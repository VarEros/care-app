"use client"

import { useEffect, useState } from "react"
import { client } from "@/lib/amplifyClient"
import type { Schema } from "@/amplify/data/resource"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ChevronsUpDown, Loader2 } from "lucide-react"

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
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
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
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
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

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Array<Schema["Appointment"]["type"]>>([])
  const [doctors, setDoctors] = useState<Array<Schema["Doctor"]["updateType"]>>([])
  const [specialty, setSpecialty] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [openSpecialties, setOpenSpecialties] = useState(false)
  const [openDoctors, setOpenDoctors] = useState(false)
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
        const { data, errors } = await client.models.Appointment.list()
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
  
  // Load doctors on mount
  useEffect(() => {
    if (!specialty) return
    const loadDoctors = async () => {
      try {
        const { data, errors } = await client.models.Doctor.list({filter: {status: {eq: "Activo"}, specialty: {eq: specialty ?? undefined}}, selectionSet: ["id", "name", "email"]})
        if (errors) console.error(errors)
        else setDoctors(data)
      } catch (err) {
        console.error("Failed to load appointments:", err)
      } finally {
        setLoading(false)
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
            <Button>Agregar Cita</Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Registro de Cita</DialogTitle>
              <DialogDescription>
                Llena el formulario para crear un doctor junto a su perfil de usuario, el nuevo doctor podra entrar al sistema sin necesidad de introduccir contraseña.
              </DialogDescription>
            </DialogHeader>

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
                        <Popover open={openDoctors} onOpenChange={setOpenDialog}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={openDialog}
                              className="w-[200px] justify-between"
                            >
                              {field.value
                                ? doctors.find((d) => d.id === field.value)?.name
                                : "Selecciona una doctor..."}
                              <ChevronsUpDown className="opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[200px] p-0">
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
                                        field.onChange(currentValue === field.value ? "" : currentValue)
                                        setOpenDoctors(false)
                                      }}
                                    >
                                      {d.name}
                                      {/* <Check
                                        className={cn(
                                          "ml-auto",
                                          value === framework.value ? "opacity-100" : "opacity-0"
                                        )}
                                      /> */}
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

                
                <DialogFooter>
                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      "Guardar Doctor"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Doctor List */}
      {doctors.length === 0 ? (
        <p>No se encontraron doctores.</p>
      ) : (
        <ul className="space-y-2">
          {doctors.map((doc) => (
            <Item variant="outline" key={doc.id}>
              <ItemContent>
                <ItemTitle className="line-clamp-1">
                  {doc.name} -{" "}
                  <span className="text-muted-foreground">{doc.specialty ?? "Medicina General"}</span>
                </ItemTitle>
                <ItemDescription>
                  {doc.email}
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <Button variant="secondary" size="sm">
                  Editar
                </Button>
              </ItemActions>
            </Item>
          ))}
        </ul>
      )}
    </div>
  )
}
