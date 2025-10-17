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
  specialty: z.string().optional().or(z.literal("")),
})

type DoctorFormValues = z.infer<typeof doctorSchema>
type DoctorSchema = Schema["Doctor"]["type"]

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Array<DoctorSchema>>([])
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorSchema | null>(null)
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [openSheet, setOpenSheet] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Setup form
  const form = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      name: "",
      email: "",
      birthdate: "",
      gender: undefined,
      specialty: "",
    },
  })

  // Load doctors on mount
  useEffect(() => {
    const loadDoctors = async () => {
      try {
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
          ] as DoctorSchema[];
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

    loadDoctors()
  }, [])

  const handleBusinessHours = (doc: DoctorSchema) => {
    //setSelectedDoctor(doc)
    setOpenSheet(true)
  }

  const handleEditDoctor = (doc: DoctorSchema) => {
    // setSelectedDoctor(doc)
    setOpenDialog(true)
  }

  // Handle doctor creation
  const onSubmit = async (values: DoctorFormValues) => {
    setSubmitting(true)
    if (!values.specialty) values.specialty = undefined
    try {
      const { data, errors } = await client.mutations.createDoctorWithUser(values)
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
    <div className="p-6">
      <DoctorScheduleSheet openSheet={openSheet} setOpenSheet={setOpenSheet}/>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Doctores</h1>

        {/* Dialog for adding new doctor */}
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="w-[200px]">Agregar Doctor</Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Registro de Doctor</DialogTitle>
              <DialogDescription>
                Llena el formulario para crear un doctor junto a su perfil de usuario, el nuevo doctor podra entrar al sistema sin necesidad de introduccir contraseña.
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
                        <Input type="email" placeholder="doctor@ejemplo.com" {...field} />
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
                        <Input placeholder="Cardiologia" {...field} />
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
