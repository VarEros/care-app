"use client"

import { useEffect, useRef, useState } from "react"
import { client } from "@/lib/amplifyClient"
import type { Schema } from "@/amplify/data/resource"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon, Check, ChevronsUpDown, Loader2, Plus, Trash2 } from "lucide-react"
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
  ItemActions,
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
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { RecipeFormValues, RecipesForm } from "./components/recipesForm"
import { fetchAuthSession } from "aws-amplify/auth"

const consultationSchema = z.object({
  reason: z.string().nonempty("La razon de la cita es requerida"),
  diagnosis: z.string().nonempty("El diagnostico es requerido"),
  treatment: z.string().optional(),
  observations: z.string().optional(),
  startedAt: z.string().nonempty("La hora de inicio es requerida"),
  endedAt: z.string().optional(),
});

type ConsultationFormValues = z.infer<typeof consultationSchema>;
type CompletedAppointment = {
    readonly patientId: string;
    readonly reason: string;
    readonly scheduledOn: string;
    readonly patient: {
        readonly name: string;
        readonly cedula: string;
    };
};

type ApprovedAppointment = {
    readonly patientId: string;
    readonly scheduledOn: string;
    readonly patient: {
        readonly name: string;
        readonly cedula: string;
    };
}

export default function AppointmentsPage() {
  const [completedAppointments, setCompletedAppointments] = useState<Array<CompletedAppointment>>([])
  const [approvedAppointments, setApprovedAppointments] = useState<Array<ApprovedAppointment>>([])
  const [appointment, setAppointment] = useState<ApprovedAppointment | null>(null)
  const [recipes, setRecipes] = useState<RecipeFormValues[]>([])

  const [openDialog, setOpenDialog] = useState(false)
  const [openForm, setOpenForm] = useState(false)
  const [openAppointments, setOpenAppointments] = useState(false)

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  let doctorId: string;

  // Setup form
  const form = useForm<ConsultationFormValues>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      reason: "",
      diagnosis: "",
      treatment: "",
      observations: "",
      startedAt: "",
      endedAt: "",
    },
  });

  // Load patients on mount
  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const { tokens }= await fetchAuthSession();
        const sub = tokens?.idToken?.payload["sub"] as string;
        doctorId = sub; 

        // if (!sub) {
        //   setLoading(false);
        //   return;
        // }
        // const frequencyType = client.enums.RecipeFrequencyType.values();
        // const { data, errors } = await client.models.Appointment.list({filter: {doctorId: {eq: doctorId}}, selectionSet: ["patientId", "scheduledOn", "reason", "patient.name", "patient.cedula"]})
        setTimeout(() => {
          const appointments = [
            {
              patientId: "1",
              scheduledOn: "20 de Octubre, 2025 - 8:30PM",
              reason: "Migraña",
              patient: {
                name: "Mario Lopez",
                cedula: "001-240504-1023S"
              }
            },
            {
              patientId: "2",
              scheduledOn: "25 de Octubre, 2025 - 2:30PM",
              reason: "Dolor de cabeza",
              patient: {
                name: "Maria Gutierrez",
                cedula: "001-240504-1023S"
              }
            }
          ]
          setCompletedAppointments(appointments)
          setLoading(false)
        }, 1000);
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

  useEffect(() => {
    if (approvedAppointments.length !== 0) return;  
    const loadAprovedAppointments = async () => {
      setTimeout(() => {
        const appointments = [
          {
            patientId: "1",
            scheduledOn: "20 de Octubre, 2025 - 8:30PM",
            patient: {
              name: "Mario Lopez",
              cedula: "001-240504-1023S"
            }
          },
          {
            patientId: "2",
            scheduledOn: "25 de Octubre, 2025 - 2:30PM",
            patient: {
              name: "Maria Gutierrez",
              cedula: "001-240504-1023S"
            }
          },
          {
            patientId: "5",
            scheduledOn: "28 de Octubre, 2025 - 2:30PM",
            patient: {
              name: "Maria Gutierrez",
              cedula: "001-240504-1023S"
            }
          }
        ]
        setApprovedAppointments(appointments)
      }, 2000);
    }
    loadAprovedAppointments()
  }, [openDialog])

  // Handle appointment creation
  const onSubmit = async (values: ConsultationFormValues) => {
    setSubmitting(true)
    try {
      const payload = {
        ...values,
        doctorId: doctorId,
        appointmentScheduledOn: appointment?.scheduledOn!,
      }
      const { data, errors } = await client.mutations.createConsultationWithRecipes({consultation: payload, recipes: recipes})
      
      if (errors) {
        console.error("Error creating appointment:", errors)
        toast.error("Error al crear al appointment", {
          description: errors[0]["message"]
        })
      } else if (data) {
        const completedAppointment: CompletedAppointment = {
          ...appointment!,
          reason: values.reason,
        }
        setCompletedAppointments((prev) => [...prev, completedAppointment])
        setOpenDialog(false)
        toast.success("Consulta registrada con exito", {
          description: "La consulta ha sido registrada correctamente.",
        })
        form.reset()
      }
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
        <span className="ml-2">Cargando consultas...</span>
      </div>
    )

  return (
    <div className="sm:p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Consultas</h1>

        {/* Dialog for adding new Cita */}
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="w-[200px]">Realizar Consulta</Button>
          </DialogTrigger>
          <DialogContent className={openForm ? "sm:max-w-none sm:w-[80%]" : "sm:max-w-[425px]"}>
            <DialogHeader>
              <DialogTitle>Registrar Consulta</DialogTitle>
              <DialogDescription>
                Llena los campos para crear una nueva consulta médica.
              </DialogDescription>
            </DialogHeader>
            
            {!openForm && (
              <>
                <Popover open={openAppointments} onOpenChange={setOpenAppointments}>
                  <PopoverTrigger asChild>
                    {approvedAppointments.length === 0 ? (
                      <Button variant="outline" disabled className="justify-between">
                        Cargando Citas...
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openAppointments}
                        className="justify-between"
                      >
                        {appointment ? appointment.patient.name : "Selecciona una cita..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    )}
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                    <Command>
                      <CommandInput placeholder="Busca cita..." className="h-9" />
                      <CommandList>
                        <CommandEmpty>Cita no encontrada</CommandEmpty>
                        <CommandGroup>
                          {approvedAppointments.map((aa, index) => (
                            <CommandItem
                              key={index}
                              value={aa.scheduledOn}
                              onSelect={(currentValue) => {
                                setAppointment(approvedAppointments.find(apt => apt.scheduledOn === currentValue)!)
                                setOpenAppointments(false)
                              }}
                            >
                              {aa.patient.name} ({aa.patient.cedula}) - {aa.scheduledOn}
                              <Check
                                className={cn(
                                  "ml-auto",
                                  appointment === aa ? "opacity-100" : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <Button
                  disabled={!appointment}
                  onClick={() => setOpenForm(true)}
                  className="justify-between"
                >
                  Empezar consulta
                  <Plus className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </>
            )}
            {openForm && (
              <div className="flex flex-row gap-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-2/3 h-fit">
                    {/* Reason */}
                    <FormField
                      control={form.control}
                      name="reason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Motivo</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: Dolor de cabeza" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Diagnosis */}
                    <FormField
                      control={form.control}
                      name="diagnosis"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Diagnóstico</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Ej: Migraña" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Treatment */}
                    <FormField
                      control={form.control}
                      name="treatment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tratamiento</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Ej: Analgésicos y descanso" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Observations */}
                    <FormField
                      control={form.control}
                      name="observations"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Observaciones</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Notas adicionales..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Start and End Time */}
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="startedAt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Inicio</FormLabel>
                            <FormControl>
                              <Input type="datetime-local" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="endedAt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fin</FormLabel>
                            <FormControl>
                              <Input type="datetime-local" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <DialogFooter>
                      <Button
                        variant="secondary"
                        className="w-full"
                        disabled={submitting}
                        onClick={() => setOpenForm(false)}
                      >
                        Volver
                      </Button>
                      <Button type="submit" className="w-full" disabled={submitting}>
                        {submitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Guardando...
                          </>
                        ) : (
                          "Guardar Consulta"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
                <RecipesForm recipes={recipes} setRecipes={setRecipes} />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Patient List */}
      {completedAppointments.length === 0 ? (
            <p>No se encontraron consultas.</p>
        ) : (
            <ul className="space-y-2">
            {completedAppointments.map((apt) => (
                <Item key={apt.scheduledOn} variant="outline">
                <ItemContent>
                    <ItemTitle>
                    <span className="text-muted-foreground hidden md:block">
                        {"Consulta con"}
                    </span>
                    {apt.patient.name} / {apt.patient.cedula}
                    <span className="text-muted-foreground hidden xs:block">
                        {apt.reason}
                    </span>
                    </ItemTitle>
                    <ItemDescription>
                      Realizada el {apt.scheduledOn}
                    </ItemDescription>
                </ItemContent>
                <ItemActions className="hidden sm:block">
                    <Button variant="outline" size="sm">
                    Ver Detalles
                    </Button>
                </ItemActions>
                </Item>
            ))}
            </ul>
        )}
    </div>
  )
}
