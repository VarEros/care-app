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
  ItemTitle,
} from "@/components/ui/item"
import { toast } from "sonner"
import { DoctorScheduleSheet } from "./components/sheet"
import { doctorList, DoctorSchema } from "./types"

const doctorSchema = z.object({
  name: z.string().min(2, "El nombre es requerido"),
  email: z.string().email("El correo no es invalido"),
  birthdate: z
    .string()
    .nonempty("La fecha de nacimiento requerida")
    .refine((val) => !isNaN(Date.parse(val)), "La fecha es invalida"),
  gender: z.enum(["Masculino", "Femenino", "Otro"], {
    required_error: "El genero es requerido",
  }),
  specialty: z.string().nonempty("La especialidad requerida"),
})

type DoctorFormValues = z.infer<typeof doctorSchema>

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Array<DoctorSchema>>([])
  const [specialties, setSpecialties] = useState<Array<string>>([])
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorSchema | null>(null)
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [openSheet, setOpenSheet] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const formDefaultValues = {
    name: "",
    email: "",
    birthdate: "",
    gender: undefined,
    specialty: "",
  }
  // Setup form
  const form = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorSchema),
    defaultValues: formDefaultValues,
  })

  // Load doctors on mount
  useEffect(() => {
    const loadDoctors = async () => {
      try {
        // setTimeout(() => {
        //   const doctors = doctorList as DoctorSchema[];
        //   setDoctors(doctors);
        //   setLoading(false);
        // }, 2000);
        const { data, errors } = await client.models.Doctor.list()
        if (errors) console.error(errors)
        else setDoctors(data)
      } catch (err) {
        console.error("Failed to load doctors:", err)
      } finally {
        setLoading(false)
      }
    }

    loadDoctors()
  }, [])

  useEffect(() => {
    const loadSpecialties = async () => {
      try {
        const { data, errors } = await client.models.Catalog.list({ type: "Especialidades", selectionSet: ["value"]})
        if (errors) console.error(errors)
        else setSpecialties(data.map(catalog => catalog.value))
        // setTimeout(() => {
        //   setSpecialties(["Neurologia", "Ojontologo"])
        //   if (selectedDoctor){
        //     form.setValue("specialty", selectedDoctor!.specialty)
        //   }
        // }, 1000);
      } catch (err) {
        console.error("Failed to load doctors:", err)
      } finally {
        setLoading(false)
      }
    }
    if (openDialog) {
      if (specialties.length !== 0) return
      loadSpecialties()
    }
    if (!openDialog && selectedDoctor) {
      setTimeout(() => {
        setSelectedDoctor(null)
        form.reset(formDefaultValues)
      }, 500);
    }
  }, [openDialog])
  

  const handleBusinessHours = (doc: DoctorSchema) => {
    setSelectedDoctor(doc)
    setOpenSheet(true)
  }

  const handleEditDoctor = (doc: DoctorSchema) => {
    setSelectedDoctor(doc)
    // Map the doctor values to the form shape. Ensure birthdate is in yyyy-mm-dd for the <input type="date" />
    form.reset({
      name: doc.name ?? "",
      email: doc.email ?? "",
      birthdate: doc.birthdate
        ? // if birthdate is a Date or ISO string, normalize to yyyy-mm-dd
          (() => {
            const d = typeof doc.birthdate === "string" ? new Date(doc.birthdate) : (doc.birthdate as unknown as Date)
            return isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10)
          })()
        : "",
      gender: (doc.gender as DoctorFormValues["gender"]) ?? undefined,
      specialty: doc.specialty ?? "",
    })

    setOpenDialog(true)
  }

  // Handle doctor creation
  const onSubmit = async (values: DoctorFormValues) => {
    setSubmitting(true)
    try {
        let data, errors;

        if (selectedDoctor) {
          const { email, ...restValues } = values;
          const payload = { ...restValues, id: selectedDoctor.id };
          ({ data, errors } = await client.models.Doctor.update(payload));
        } else {
          ({ data, errors } = await client.mutations.createDoctorWithUser(values));
        }
      if (errors) {
        console.error("Error creating doctor:", errors)
        toast.error("Error al crear al doctor", {
          description: errors[0]["message"]
        })
      } else if (data) {
        setDoctors((prev) => [...prev, data])
        setOpenDialog(false)
        toast.success("Doctor creado con exito", {
          description: values.email + " ya puede ingresar al sistema."
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
        <span className="ml-2">Cargando doctores...</span>
      </div>
    )

  return (
    <div className="sm:p-6">
      {selectedDoctor && <DoctorScheduleSheet openSheet={openSheet} setOpenSheet={setOpenSheet} doctor={selectedDoctor!}/>}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Doctores</h1>

        {/* Dialog for adding new doctor */}
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="w-[200px]">Agregar Doctor</Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{selectedDoctor ? "Edición de Doctor" : "Registro de Doctor"}</DialogTitle>
              <DialogDescription>
                {selectedDoctor ? "Actualiza los datos del doctor desde esta ventana" : "Llena el formulario para crear un doctor junto a su perfil de usuario, el nuevo doctor podra entrar al sistema sin necesidad de introduccir contraseña."}
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input placeholder="Juan Perez" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input disabled={selectedDoctor ? true : false} type="email" placeholder="doctor@ejemplo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Birthdate */}
                <FormField
                  control={form.control}
                  name="birthdate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Nacimiento</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Gender */}
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Genero</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar Genero" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Masculino">Masculino</SelectItem>
                            <SelectItem value="Femenino">Femenino</SelectItem>
                            <SelectItem value="Otro">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Specialty */}
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
                <Button onClick={() => handleBusinessHours(doc)} variant="outline" size="sm">
                  Horario
                </Button>
                <Button onClick={() => handleEditDoctor(doc)} variant="secondary" size="sm">
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
