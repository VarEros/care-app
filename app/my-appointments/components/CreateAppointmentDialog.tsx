"use client"

import React, { useEffect, useMemo, useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { es } from "date-fns/locale"
import { Loader2, Calendar as CalendarIcon, ChevronsUpDown } from "lucide-react"
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
import { Doctor, doctorList } from "../types"

const appointmentSchema = z.object({
  specialty: z.string().min(1),
  doctorId: z.string().min(1),
  dateScheduled: z.string().nonempty("La fecha es requerida").refine((v) => !isNaN(Date.parse(v)), "Fecha inválida"),
  timeScheduled: z.string().min(1, "La hora es requerida"),
})

type AppointmentFormValues = z.infer<typeof appointmentSchema>

export function CreateAppointmentDialog() {
  const [open, setOpen] = useState(false)
  const [specialties, setSpecialties] = useState<Array<string>>([])
  const [doctors, setDoctors] = useState<Doctor | null>(null)
  const [step, setStep] = useState(0)
  const [openCalendar, setOpenCalendar] = useState(false)

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      specialty: "",
      doctorId: "",
      dateScheduled: "",
      timeScheduled: "",
    },
    mode: "onTouched",
  })

  useEffect(() => {
    if (!open) return

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
          setLoading(false);
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
  

  // Helpers
  const weekdayKeyFromDate = (date: Date) => {
    // map JS Date.getDay() to keys used in businessHours
    const map = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
    return map[date.getDay()]
  }

  const selectedSpecialty = form.watch("specialty")
  const selectedDoctorId = form.watch("doctorId")
  const selectedDoctor = doctors!.find((d) => d.id === selectedDoctorId)
  const selectedDateIso = form.watch("dateScheduled")
  const selectedDate = selectedDateIso ? new Date(selectedDateIso) : undefined

  // compute available weekday keys from selected doctor's businessHours
  const availableWeekdays = useMemo(() => {
    if (!selectedDoctor?.businessHours) return []
    return Object.keys(selectedDoctor.businessHours)
  }, [selectedDoctor])

  // calendar day enabled by businessHours of selected doctor
  const isOpenDay = (date: Date) => {
    if (!selectedDoctor?.businessHours) return false
    const key = weekdayKeyFromDate(date)
    const range = (selectedDoctor.businessHours as any)?.[key]
    if (!range) return false
    // treat start===end or invalid as closed
    if (typeof range.start !== "number" || typeof range.end !== "number") return false
    return range.end > range.start
  }

  // generate hour options (HH) based on selected date's weekday businessHours
  const hourOptions = useMemo(() => {
    if (!selectedDate || !selectedDoctor?.businessHours) return []
    const key = weekdayKeyFromDate(selectedDate)
    const range = (selectedDoctor.businessHours as any)?.[key]
    if (!range) return []
    const start = Math.max(0, Math.floor(range.start))
    const end = Math.min(23, Math.ceil(range.end)) // end is exclusive in our generation decision below
    const hours: number[] = []
    // create starting hours from start .. end - 1 (for example 8..16 for 8-17)
    for (let h = start; h < end; h++) {
      hours.push(h)
    }
    return hours
  }, [selectedDate, selectedDoctor])

  const minuteOptions = [0, 15, 30, 45]

  // generate time string HH:MM from hour and minute
  const formatTime = (h: number, m: number) => {
    const hh = String(h).padStart(2, "0")
    const mm = String(m).padStart(2, "0")
    return `${hh}:${mm}`
  }

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
      setStep(3)
    }
  }

  const onBack = () => setStep((s) => Math.max(0, s - 1))

  const onSubmit = async (values: AppointmentFormValues) => {
    try {
      // Final validation handled by resolver; form.handleSubmit wraps this
      // Here you would call your API to create the appointment
      console.log("Creating appointment", values)
      toast.success("Cita creada (simulada)")
      setOpen(false)
      form.reset()
      setStep(0)
    } catch (err) {
      console.error(err)
      toast.error("Error al crear la cita")
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { form.reset(); setStep(0) } }}>
      <DialogTrigger asChild>
        <Button className="w-[200px]">Agendar Cita</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[520px]">
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
            </div>

            {/* STEP 0 - Specialty */}
            {step === 0 && (
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="specialty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Especialidad (opcional)</FormLabel>
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
                        <Popover>
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
                                          // reset date/time when changing doctor
                                          form.setValue("dateScheduled", "")
                                          form.setValue("timeScheduled", "")
                                        }}
                                      >
                                        {d.name}
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

            {/* STEP 2 - Date & Time */}
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
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* STEP 2 - Date & Time */}
            {step === 3 && (
              <div className="space-y-3">
                {/* Date picker */}
               <FormField
                    control={form.control}
                    name="timeScheduled"
                    render={({ field }) => {
                      // derive selected hour & minute from field.value if present
                      const [hh = "", mm = ""] = (field.value || "").split(":")
                      return (
                        <FormItem>
                          <FormLabel>Hora</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <Select
                                value={hh || undefined}
                                onValueChange={(h) => {
                                  const minute = mm || "00"
                                  if (h) field.onChange(`${h}:${minute}`)
                                  else field.onChange("")
                                }}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="HH" />
                                </SelectTrigger>
                                <SelectContent>
                                  {hourOptions.length === 0 && <SelectItem value="">-</SelectItem>}
                                  {hourOptions.map((h) => (
                                    <SelectItem key={h} value={String(h).padStart(2, "0")}>
                                      {String(h).padStart(2, "0")}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>

                              <Select
                                value={mm || undefined}
                                onValueChange={(m) => {
                                  const hour = hh || (hourOptions[0] !== undefined ? String(hourOptions[0]).padStart(2, "0") : "00")
                                  if (hour) field.onChange(`${hour}:${m}`)
                                  else field.onChange("")
                                }}
                              >
                                <SelectTrigger className="w-28">
                                  <SelectValue placeholder="MM" />
                                </SelectTrigger>
                                <SelectContent>
                                  {minuteOptions.map((m) => (
                                    <SelectItem key={m} value={String(m).padStart(2, "0")}>
                                      {String(m).padStart(2, "0")}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )
                    }}
                  />
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
                {step < 3 && (
                  <Button onClick={onNext} type="button">
                    Siguiente
                  </Button>
                )}

                {step === 3 && (
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
