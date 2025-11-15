"use client"

import { useEffect, useRef, useState } from "react"
import { client } from "@/lib/amplifyClient"
import type { Schema } from "@/amplify/data/resource"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon, Check, ChevronsUpDown, Loader2, Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

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
import BiometricDrawer from "./components/biometricDrawer"
import { Biometric } from "./type"
import { PatientSheet } from "@/components/patientSheet"
import { PatientRecord } from "@/lib/types"
import ConsultationModal from "./components/consultationModal"

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
  readonly doctorId: string;
  readonly patientId: string;
  readonly patient: {
      readonly name: string;
      readonly cedula: string;
  };
  readonly consultation: {
      readonly id: string;
      readonly reason: string;
      readonly startedAt: string;
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

export default function ConsultationsPage() {
  const [completedAppointments, setCompletedAppointments] = useState<Array<CompletedAppointment>>([])
  const [approvedAppointments, setApprovedAppointments] = useState<Array<ApprovedAppointment>>([])
  const [appointment, setAppointment] = useState<ApprovedAppointment | null>(null)
  const [recipes, setRecipes] = useState<RecipeFormValues[]>([])
  const [biometric, setBiometric] = useState<Biometric | null>(null)
  const [patient, setPatient] = useState<PatientRecord | null>(null)
  
  const [openConsultation, setOpenConsultation] = useState(false)
  const [consultationId, setConsultationId] = useState<string>("")

  const [openDialog, setOpenDialog] = useState(false)
  const [openBiometric, setOpenBiometric] = useState(false)
  const [openExpedient, setOpenExpedient] = useState(false)
  const [openForm, setOpenForm] = useState(false)
  const [openAppointments, setOpenAppointments] = useState(false)

  const [doctorId, setDoctorId] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const now = new Date();

  // Setup form
  const form = useForm<ConsultationFormValues>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      reason: "",
      diagnosis: "",
      treatment: "",
      observations: "",
      startedAt: new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16),
      endedAt: "",
    },
  });

  // Load patients on mount
  useEffect(() => {
    if (completedAppointments.length !== 0) return;
    const loadAppointments = async () => {
      try {
        const { tokens }= await fetchAuthSession();
        const sub = tokens?.idToken?.payload["sub"] as string;
        if (!sub) {
          setLoading(false);
          return;
        }
        setDoctorId(sub);

        const { data, errors } = await client.models.Appointment.list({doctorId, filter: {status: {eq: "Completada"}}, selectionSet: ["consultation.id", "patientId", "doctorId", "consultation.reason", "consultation.startedAt", "patient.name", "patient.cedula"]})
        if (errors) console.error(errors)
        else setCompletedAppointments(data)
      } catch (err) {
        console.error("Failed to load appointments:", err)
      } finally {
        setLoading(false)
      }
    }

    loadAppointments()
  }, [])

  useEffect(() => {
    if (approvedAppointments.length !== 0 || openDialog == false) return;  
    console.log("Doctor ID:", doctorId);
    const loadAprovedAppointments = async () => {
      const { data, errors } = await client.models.Appointment.list({doctorId, filter: {status: { eq: "Aprobada"}}, selectionSet: ["patientId", "scheduledOn", "patient.name", "patient.cedula"]})
      if (errors) console.error(errors)
      else setApprovedAppointments(data)
    }
    loadAprovedAppointments()
  }, [openDialog])

  useEffect(() => {
    if (!appointment) return
    const loadExpedient = async() => {
      const { data, errors } = await client.models.Patient.get({id: appointment!.patientId}, {selectionSet: ["email", "birthdate", "gender", "bloodType", "background", "allergies", "exams"]})
      if (errors) console.error(errors)
      else setPatient({...data!, name: appointment!.patient.name, cedula: appointment!.patient.cedula, id: appointment!.patientId})
    }
    loadExpedient()
  }, [appointment])

  const handleViewDetails = (consultationId: string) => {
    setConsultationId(consultationId);
    setOpenConsultation(true);
  }

  // Handle appointment creation
  const onSubmit = async (values: ConsultationFormValues) => {
    setSubmitting(true)
    try {
      const consultation: Schema["Consultation"]["createType"] = {
        ...values,
        doctorId: doctorId,
        endedAt: values.endedAt ? new Date(values.endedAt).toISOString() : new Date().toISOString(),
        startedAt: new Date(values.startedAt).toISOString(),
        scheduledOn: appointment?.scheduledOn!,
      }
      
      let payload: Schema["createCompleteConsultation"]["args"] = {consultation}

      if (recipes && recipes.length !== 0) {
        payload.recipes = recipes
      }

      if (biometric) {
        const biometricPayload: Schema["Biometric"]["createType"] = {
          ...biometric,
          patientId: appointment!.patientId,
          createdAt: consultation.startedAt,
        }
        payload.biometric = biometricPayload
      }
      
      const { data, errors } = await client.mutations.createCompleteConsultation(payload)
      
      if (errors) {
        console.error("Error creating appointment:", errors)
        toast.error("Error al crear al appointment", {
          description: errors[0]["message"]
        })
      } else if (data) {
        const completedAppointment: CompletedAppointment = {
          ...appointment!,
          consultation: {
            id: data,
            reason: consultation.reason,
            startedAt: consultation.startedAt
          },
          doctorId: doctorId
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
        <Dialog open={openDialog} onOpenChange={setOpenDialog} >
        <BiometricDrawer open={openBiometric} onOpenChange={setOpenBiometric} setBiometric={setBiometric}/>
        <PatientSheet open={openExpedient} setOpen={setOpenExpedient} patient={patient}/>      
        <ConsultationModal open={openConsultation} onOpenChange={setOpenConsultation} consultationId={consultationId}/>
          <DialogTrigger asChild>
            <Button className="w-[200px]">Realizar Consulta</Button>
          </DialogTrigger>
          <DialogContent className={openForm ? "max-h-screen overflow-auto sm:max-w-none sm:w-[80%]" : "sm:max-w-[425px]"}>
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
                              {aa.patient.name} ({aa.patient.cedula}) - {new Date(aa.scheduledOn).toLocaleString("es-ES", {dateStyle: "long",timeStyle: "short", hour12: true})}
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
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 h-fit">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-2/3">
                      {/* Reason */}
                      <FormField
                        control={form.control}
                        name="reason"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Razón de consulta</FormLabel>
                            <FormControl>
                              <Input placeholder="Ej: Dolor de cabeza" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* HEA */}
                      <FormField
                        control={form.control}
                        name="observations"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>HEA (Historia de la Enfermedad Actual)</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Notas adicionales..." {...field} />
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
                    </div>
                    <RecipesForm recipes={recipes} setRecipes={setRecipes} />
                  </div>
                  <DialogFooter className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    {/* Left side buttons */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button variant="outline" type="button" onClick={() => setOpenExpedient(true)}>
                        Revisar expediente
                      </Button>
                      <Button variant="outline" type="button" onClick={() => setOpenBiometric(true)}>
                        {biometric ? "Editar Datos Biometricos" : "Añadir Datos Biometricos"}
                      </Button>
                    </div>

                    {/* Right side buttons (existing) */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        variant="secondary"
                        className="mt-4 sm:mt-0"
                        disabled={submitting}
                        onClick={() => setOpenForm(false)}
                      >
                        Volver
                      </Button>
                      <Button type="submit" disabled={submitting}>
                        {submitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Guardando...
                          </>
                        ) : (
                          "Guardar Consulta"
                        )}
                      </Button>
                    </div>
                  </DialogFooter>
                </form>
              </Form>
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
                <Item key={apt.consultation.startedAt} variant="outline">
                <ItemContent>
                    <ItemTitle>
                    <span className="text-muted-foreground hidden md:block">
                        {"Consulta con"}
                    </span>
                    {apt.patient.name} / {apt.patient.cedula}
                    <span className="text-muted-foreground hidden xs:block">
                        Por {apt.consultation.reason}
                    </span>
                    </ItemTitle>
                    <ItemDescription>
                      Realizada el {new Date(apt.consultation.startedAt).toLocaleString("es-ES", {dateStyle: "long",timeStyle: "short", hour12: true})}
                    </ItemDescription>
                </ItemContent>
                <ItemActions className="hidden sm:block">
                    <Button variant="outline" size="sm" onClick={() => handleViewDetails(apt.consultation.id)}>
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
