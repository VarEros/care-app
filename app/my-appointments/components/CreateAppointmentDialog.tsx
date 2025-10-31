"use client"

import React, { useEffect, useMemo, useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { es } from "date-fns/locale"
import { Loader2, Calendar as CalendarIcon, ChevronsUpDown, Check } from "lucide-react"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty, CommandGroup } from "@/components/ui/command"
import { Appointment, Doctor, doctorList } from "../types"
import { client } from "@/lib/amplifyClient"
import { cn } from "@/lib/utils"
import { convertTo12Hour, weekdayKeyFromDate } from "../helpers/dateTime"
import { dayLabels } from "@/lib/constants"
import { format } from "date-fns"
import { Schema } from "@/amplify/data/resource"

const appointmentTypes = Object.values(client.enums.AppointmentType.values()) as string[]
const appointmentSchema = (appointments: string[]) => z.object({
  motive: z.string(),
  type: z.enum([...appointmentTypes] as [string, ...string[]], { message: "El tipo de cita es requerido"}),
  specialty: z.string().min(1, "La especialidad es requerida"),
  doctorId: z.string().min(1, "El doctor es requerido"),
  dateScheduled: z.string().nonempty("La fecha es requerida").refine((v) => !isNaN(Date.parse(v)), "Fecha inválida"),
  timeScheduled: z.string().min(1, "La hora es requerida").refine((value) => !appointments.includes(value), "La hora seleccionada ya está ocupada"),
})

interface Props {
  setAppointments?: React.Dispatch<React.SetStateAction<Appointment[]>>;
  patientId: string
}

export const  CreateAppointmentDialog: React.FC<Props> = ({ setAppointments, patientId }) => {
  const [specialties, setSpecialties] = useState<Array<string>>([])
  const [doctors, setDoctors] = useState<Array<Doctor>>([])
  const [takenTimes, setTakenTimes] = useState<Array<string>>([])

  const [step, setStep] = useState(0)
  const [loadingAppointments, setLoadingAppointments] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [open, setOpen] = useState(false)
  const [openDoctors, setOpenDoctors] = useState(false)
  const [openCalendar, setOpenCalendar] = useState(false)

  const schema = appointmentSchema(takenTimes)
  type AppointmentFormValues = z.infer<typeof schema>

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema(takenTimes)),
    defaultValues: {
      motive: "",
      type: "",
      specialty: "",
      doctorId: "",
      dateScheduled: "",
      timeScheduled: "",
    },
    mode: "onTouched",
  })

  const selectedSpecialty = form.watch("specialty")
  const selectedDoctorId = form.watch("doctorId")
  const selectedDoctor = doctors!.find((d) => d.id === selectedDoctorId)
  const selectedDateIso = form.watch("dateScheduled")
  const selectedDate = selectedDateIso ? new Date(selectedDateIso) : undefined
  const selectedWeekday = selectedDateIso ? weekdayKeyFromDate(selectedDate!) : undefined

  useEffect(() => {
    if (!open || specialties.length !== 0 && doctors.length !== 0) return

    const loadSpecialties = async () => {
      try {
        // const { data, errors } = await client.models.Catalog.list({ type: "Especialidades", selectionSet: ["value"]})
        // if (errors) console.error(errors)
        // else setSpecialties(data.map(catalog => catalog.value))
        setTimeout(() => {
          setSpecialties(["Neurologia", "Ojontologo"])
          if (selectedDoctor){
            form.setValue("specialty", selectedDoctor!.specialty)
          }
        }, 1000);
      } catch (err) {
        console.error("Failed to load doctors:", err)
      } finally {
        // setLoading(false)
      }
    }
    
    const loadDoctors = async () => {
      try {
        setTimeout(() => {
          const doctors = doctorList as Doctor[];
          setDoctors(doctors);
          // setLoading(false);
        }, 2000);
        // const { data, errors } = await client.models.Doctor.list()
        // if (errors) console.error(errors)
        // else setDoctors(data)
      } catch (err) {
        console.error("Failed to load doctors:", err)
      } finally {
        // setLoading(false)
      }
    }

    loadSpecialties()
    loadDoctors()
  }, [open])

  useEffect(() => {
    if (!selectedDateIso || !selectedDoctorId) return;
    setLoadingAppointments(true)
    const dayOfDate = selectedDateIso.split("T")[0]
    const loadAppointments = async () => {
      try {
        // const { data, errors } = await client.models.Appointment.list({ doctorId: selectedDoctorId, scheduledOn: { beginsWith: dayOfDate}, selectionSet: ["scheduledOn"]})
        // if (errors) console.error(errors)
        // else setAppointments(data.map(apt => apt.scheduledOn))
        await setTimeout(() => {
          setTakenTimes(["09:00", "09:20", "10:40", "11:00", "11:40", "14:40", "15:40", "16:00" , "16:40"])
          setLoadingAppointments(false)
        }, 700);
      } catch (err) {
        console.error("Failed to load appointments:", err)
      } 
      // finally {
      //   setLoadingAppointments(false)
      // }
    }
    loadAppointments()
  }, [selectedDateIso])

  // compute available weekday keys from selected doctor's businessHours
  const availableWeekdays = useMemo(() => {
    if (!selectedDoctor?.businessHours) return []
    return Object.keys(selectedDoctor.businessHours)
  }, [selectedDoctor])

  // calendar day enabled by businessHours of selected doctor
  const isOpenDay = (date: Date) => {
    if (!selectedDoctor?.businessHours) return false
    // return false for previous days than today
    if (date < new Date(new Date().setHours(0,0,0,0))) return false
    const isInBusinessHours = availableWeekdays.includes(weekdayKeyFromDate(date))
    return isInBusinessHours
  }

  // description with the startTime and EndTime of the BusinessHours
  const dayBusinessHoursDescription = useMemo(() => {
    if (!selectedDateIso) return ""

    const dayLabel = dayLabels[selectedWeekday!]
    const startTime = convertTo12Hour(selectedDoctor!.businessHours![selectedWeekday!].start)
    const endTime = convertTo12Hour(selectedDoctor!.businessHours![selectedWeekday!].end)
    console.log("dateISO: " + selectedDateIso)

    return `El Dr.${selectedDoctor!.name} atiende los ${dayLabel} desde las ${startTime} hasta las ${endTime}`
  }, [selectedDateIso])


  const onNext = async () => {
    // validate partial steps
    if (step === 0) {
      const ok = await form.trigger("specialty")
      if (!ok) return
      setStep(1)
    } else if (step === 1) {
      const ok = await form.trigger("doctorId")
      if (!ok) return
      setStep(2)
    } else if (step === 2) {
      const ok = await form.trigger("dateScheduled")
      if (!ok) return
      if (!form.getValues("timeScheduled")) form.setValue("timeScheduled", "09:00")
      setStep(3)
    } else if (step === 3) {
      const ok = await form.trigger("timeScheduled")
      if (!ok) return
      setStep(4)
    } else if (step === 4) {
      const ok = await form.trigger("motive") && await form.trigger("type")
      if (!ok) return
      setStep(5)
    }
  }

  const onBack = () => setStep((s) => Math.max(0, s - 1))

  const onSubmit = async (values: AppointmentFormValues) => {
    setSubmitting(true)
    try {
      const { data, errors } = await client.models.Appointment.create(getPayload(values), {selectionSet: ["scheduledOn", "status", "doctor.name", "doctor.specialty"]})
      if (errors) {
        console.error("Error creating appointment:", errors)
        toast.error("Error al crear al appointment", {
          description: errors[0]["message"]
        })
      } else if (data) {
        if (setAppointments) setAppointments!((prev) => [...prev, data])
        setOpen(false)
        toast.success("Cita creada con exito", {
          description: values.doctorId + " ya puede ingresar al sistema."
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

  const getPayload = (values: AppointmentFormValues): Schema["Appointment"]["createType"] => {
    return {
      motive: values.motive,
      type: values.type as any,
      doctorId: values.doctorId,
      patientId,
      scheduledOn: new Date(
        new Date(values.dateScheduled).toDateString() + " " + values.timeScheduled 
      ).toISOString(),
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { form.reset(); setStep(0) } }}>
      <DialogTrigger asChild>
        <Button className="w-[200px]">Agendar Cita</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[620px]">
        <DialogHeader>
          <DialogTitle>Agendar Cita</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Step indicator */}
            <div className="flex items-center gap-3 text-sm">
              <div className={`px-3 py-1 rounded ${step === 0 ? "bg-primary text-primary-foreground" : "bg-muted"}`}>1. Especialidad</div>
              <div className={`px-3 py-1 rounded ${step === 1 ? "bg-primary text-primary-foreground" : "bg-muted"}`}>2. Doctor</div>
              <div className={`px-3 py-1 rounded ${step === 2 ? "bg-primary text-primary-foreground" : "bg-muted"}`}>3. Fecha</div>
              <div className={`px-3 py-1 rounded ${step === 3 ? "bg-primary text-primary-foreground" : "bg-muted"}`}>4. Hora</div>
              <div className={`px-3 py-1 rounded ${step === 4 ? "bg-primary text-primary-foreground" : "bg-muted"}`}>5. Info</div>
              <div className={`px-3 py-1 rounded ${step === 5 ? "bg-primary text-primary-foreground" : "bg-muted"}`}>6. Resumen</div>
            </div>

            {/* STEP 0 - Specialty */}
            {step === 0 && (
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="specialty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Especialidad</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                          disabled={!specialties.length}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                specialties.length === 0
                                  ? "Cargando especialidades..."
                                  : "Selecciona una especialidad"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {specialties.map((s, index) => (
                              <SelectItem key={index} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* STEP 1 - Doctor selection */}
            {step === 1 && (
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="doctorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Doctor</FormLabel>
                      <FormControl>
                        <Popover open={openDoctors} onOpenChange={setOpenDoctors}>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="justify-between w-full" role="combobox" aria-expanded={false}>
                              {field.value ? doctors.find((d) => d.id === field.value)?.name : "Selecciona un doctor..."}
                              <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="p-0">
                            <Command>
                              <CommandInput placeholder="Buscar doctor..." />
                              <CommandList>
                                <CommandEmpty>No hay doctores</CommandEmpty>
                                <CommandGroup>
                                  {doctors
                                    .filter((d) => (selectedSpecialty ? d.specialty === selectedSpecialty : true))
                                    .map((d) => (
                                      <CommandItem
                                        key={d.id}
                                        value={d.id}
                                        onSelect={(v) => {
                                          field.onChange(v)
                                          setOpenDoctors(false)
                                          // reset date/time when changing doctor
                                          form.setValue("dateScheduled", "")
                                          form.setValue("timeScheduled", "")
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
              </div>
            )}

            {/* STEP 2 - Date */}
            {step === 2 && (
              <div className="space-y-3">
                {/* Date picker */}
                <FormField
                  control={form.control}
                  name="dateScheduled"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha</FormLabel>
                      <FormControl>
                        <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="justify-between w-full">
                              {field.value
                                ? new Date(field.value).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
                                : "Seleccionar fecha..."}
                              <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              locale={es}
                              selected={field.value ? new Date(field.value) : undefined}
                              onSelect={(date) => {
                                if (!date) return
                                if (!isOpenDay(date)) {
                                  toast.error("El doctor no trabaja ese día")
                                  return
                                }
                                field.onChange(date.toISOString())
                                setOpenCalendar(false)
                                // clear previously chosen time to force reselect
                                form.setValue("timeScheduled", "")
                              }}
                              disabled={(date) => !isOpenDay(date)}
                              captionLayout="dropdown"
                            />
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                      <FormMessage />
                      <FormDescription>
                        { dayBusinessHoursDescription }
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* STEP 3 - Time */}
            {step === 3 && (
              <div className="space-y-6">
                {/* 🕒 Time picker field */}
                <FormField
                  control={form.control}
                  name="timeScheduled"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hora</FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          value={field.value}
                          onChange={(e) => {
                            const value = e.target.value
                            const minutes = parseInt(value.split(":")[1], 10)
                            if ([0, 20, 40].includes(minutes)) {
                              field.onChange(value)
                            }
                          }}
                          step={1200}
                          className="w-28"
                        />
                      </FormControl>
                      <FormMessage />
                      
                      <FormDescription>
                        - {dayBusinessHoursDescription}. <br/>
                        - Las citas tienen una duración de 20 minutos.  <br/>
                        - Los horarios marcados en rojo ya están ocupados.<br/>
                      </FormDescription>
                    </FormItem>
                  )}
                />

                {/* 🚫 Taken times display */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Horarios ocupados</h4>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                    {loadingAppointments ? 
                      <p className="text-sm text-muted-foreground col-span-full">Cargando horarios ocupados...</p> :
                      takenTimes.length !== 0 ? takenTimes.map(
                        (time) => (
                          <Button
                            key={time}
                            variant="destructive"
                            disabled
                            className="w-full cursor-not-allowed opacity-70"
                          >
                            {time}
                          </Button>
                        )
                      ) : 
                      <p className="text-sm text-muted-foreground col-span-full">No hay horarios ocupados para esta fecha.</p>
                    }
                  </div>
                </div>

                {/* ✅ Suggestion hint */}
                <div className="rounded-md border border-border bg-muted/50 p-3 text-sm text-muted-foreground">
                  Nota: Selecciona una hora que no esté marcada como ocupada para agendar tu cita.
                </div>
              </div>
            )}

            {/* STEP 4 - Info */}
            {step === 4 && (
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de consulta</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                "Seleccion una tipo"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {appointmentTypes.map((s, index) => (
                              <SelectItem key={index} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="motive"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Motivo de cita</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Dolor de cabeza" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* STEP 5 - Summary */}
            {step === 5 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Resumen de la cita</h3>
                <p className="text-sm text-muted-foreground">
                  Verifica que toda la información sea correcta antes de confirmar.
                </p>

                <div className="w-full rounded-lg border bg-muted/30 p-6 space-y-4">

                  <p className="text-base leading-relaxed">
                    Estoy programando una cita... <br/>
                    <span className="font-semibold text-foreground">
                      {form.getValues("type") || "—"}
                    </span>
                    .
                  </p>

                  <p className="text-base leading-relaxed">
                    Con el doctor... <br/>
                    <span className="font-semibold text-foreground">
                      Dr. {selectedDoctor?.name || "—"}
                    </span>
                    .
                  </p>

                  <p className="text-base leading-relaxed">
                    Especialista en... <br/>
                    <span className="font-semibold text-foreground">
                      {form.getValues("specialty") || "—"}
                    </span>
                    .
                  </p>

                  <p className="text-base leading-relaxed">
                    Para el día... <br/>
                    <span className="font-semibold text-foreground">
                      {form.getValues("dateScheduled")
                        ? format(form.getValues("dateScheduled"), "EEEE, d 'de' MMMM 'del' yyyy", {
                            locale: es,
                          })
                        : "—"}
                    </span>
                    .
                  </p>

                  <p className="text-base leading-relaxed">
                    A las... <br/>
                    <span className="font-semibold text-foreground">
                      {convertTo12Hour(form.getValues("timeScheduled"))}
                    </span>
                    .
                  </p>

                  <p className="text-base leading-relaxed">
                    Por el motivo de... <br/>
                    <span className="font-semibold text-foreground">
                      {form.getValues("motive") || "(Sin Motivo)"}
                    </span>
                    .
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4">
              <div>
                {step > 0 && (
                  <Button variant="outline" onClick={onBack} type="button">
                    Atrás
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {step < 5 && (
                  <Button onClick={onNext} type="button">
                    Siguiente
                  </Button>
                )}

                {step === 5 && (
                  <DialogFooter>
                    <Button type="submit" className="w-40">
                      <span>Confirmar Cita</span>
                    </Button>
                  </DialogFooter>
                )}
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
