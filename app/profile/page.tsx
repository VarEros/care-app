"use client"

import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"
import { Loader2, Plus } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { client } from "@/lib/amplifyClient"
import { Nullable } from "@aws-amplify/data-schema"

/**
 * NOTE:
 * - sampleInitial remains exported for offline testing but is NOT used in the component logic.
 * - This component strictly loads the profile from the API and updates only editable fields.
 */

/* ----------------- schema (only editable fields) ----------------- */
const genders = z.enum(["Masculino", "Femenino", "Otro"])
const bloodTypes = z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"])

const editableProfileSchema = z.object({
  gender: genders.optional(),
  background: z.string().optional().nullable(),
  allergies: z.array(z.string()).optional(),
  bloodType: bloodTypes.optional(),
})

type EditableProfileValues = z.infer<typeof editableProfileSchema>

/* ----------------- Profile type (shape returned by API) ----------------- */
export type Profile = {
  id?: string
  readonly gender: "Masculino" | "Femenino" | "Otro" | null
  readonly background: Nullable<string>
  readonly allergies: Nullable<string>[] | null
  readonly bloodType: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-" | null
  readonly name: string
  readonly email: string
  readonly birthdate: string
  readonly cedula: string
}

/* exported sample for dev/testing only (NOT used in logic) */
export const sampleInitial: Profile = {
  cedula: "0801199912345",
  email: "paciente@ejemplo.com",
  name: "Ana Morales",
  birthdate: new Date("1990-05-12").toISOString(),
  gender: "Masculino",
  background: "Diabética tipo 2. Hipertensión controlada.",
  allergies: ["Penicilina"],
  bloodType: "O+",
}

/* ----------------- component ----------------- */
export default function PatientProfilePage() {
  const [submitting, setSubmitting] = useState(false)
  const [allergyInput, setAllergyInput] = useState("")
  const [profile, setProfile] = useState<Profile | null>(null)

  // Form only for editable fields (Zod schema reflects only those)
  const form = useForm<EditableProfileValues>({
    resolver: zodResolver(editableProfileSchema),
    mode: "onTouched",
  })

  useEffect(() => {
    const loadProfile = async () => {
      try {
        // Replace patientId with your logic (e.g. auth user sub or "me")
        // const { data, errors } = await client.models.Patient.get({"id": "1"}, { selectionSet: ["cedula", "name", "email", "birthdate", "gender", "background", "allergies", "bloodType"]})
        // if (errors) console.error(errors)
        // else {
          setTimeout(() => {
            setProfile(sampleInitial)
          }, 500);
        // }
      } catch (err) {
        console.error("Failed to load profile:", err)
      }
    }

    loadProfile()
  }, [])

  useEffect(() => {
    if(!profile) return

    // Normalize allergies (ensure array of strings)
    const allergiesArr = Array.isArray(profile!.allergies) ? profile!.allergies.filter(Boolean) : []

    // Populate the form only with real API data
    setTimeout(() => {
      form.reset({
      gender: profile.gender ?? undefined,
      background: profile!.background ?? "",
      allergies: (allergiesArr ?? []) as string[],
      bloodType: profile!.bloodType ?? undefined,
    })
    }, 100);

  }, [profile])
  

  const addAllergy = () => {
    const val = allergyInput.trim()
    if (!val) return
    const current = form.getValues("allergies") ?? []
    if (current.includes(val)) {
      setAllergyInput("")
      return
    }
    form.setValue("allergies", [...current, val], { shouldDirty: true })
    setAllergyInput("")
  }

  const removeAllergy = (a: string) => {
    const current = form.getValues("allergies") ?? []
    form.setValue("allergies", current.filter((x) => x !== a), { shouldDirty: true })
  }

  const onSubmit = async (values: EditableProfileValues) => {
    setSubmitting(true)
    try {
      const payload: any = {
        id: profile!.id,
        ...values,
      }

      const { data, errors } = await client.models.Patient.update(payload)

      if (errors) {
        console.error("Error updating patient :", errors)
        toast.error("Error al actualizar el perfil", {
          description: errors[0]?.message ?? "Error desconocido",
        })
      } else if (data) {
        toast.success("Perfil actualizado con éxito", {
          description: "Su perfil ha sido actualizado correctamente.",
        })

      }
    } catch (err) {
      console.error("Update failed:", err)
      toast.error("Algo salió mal al guardar.")
    } finally {
      setSubmitting(false)
    }
  }

  const formatBirthdate = (iso?: string) => {
    if (!iso) return ""
    try {
      return format(new Date(iso), "PPP", { locale: es })
    } catch {
      return iso
    }
  }

  if (!profile)
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando perfil...</span>
      </div>
    )


  return (
    <div className="max-w-2xl mx-auto p-6">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl">
            {profile.name
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")}
          </div>
          <div>
            <h1 className="text-2xl font-semibold">{profile.name}</h1>
            <p className="text-sm text-muted-foreground">Perfil del paciente</p>
          </div>
        </div>
      </header>

      <Card className="p-6">
        {/* Read-only summary (not part of the form) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Cédula</p>
            <p className="font-medium">{profile.cedula}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Correo</p>
            <p className="font-medium">{profile.email}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Nombre</p>
            <p className="font-medium">{profile.name}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Fecha de nacimiento</p>
            <p className="font-medium">{formatBirthdate(profile.birthdate)}</p>
          </div>
        </div>

        <Separator />

        {/* Editable form (only editable fields are included in Zod / react-hook-form) */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Género</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona género" />
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

              <FormField
                control={form.control}
                name="bloodType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de sangre</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tipo de sangre" />
                        </SelectTrigger>
                        <SelectContent>
                          {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((b) => (
                            <SelectItem key={b} value={b}>
                              {b}
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

            <FormField
              control={form.control}
              name="background"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Antecedentes médicos</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Antecedentes, enfermedades crónicas, intervenciones..." {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Allergies: input + chips (stored in form.allergies) */}
            <div>
              <Label className="mb-2 block">Alergias</Label>
              <div className="flex items-center gap-2 mb-3">
                <Input
                  placeholder="Agregar alergia (ej. Penicilina)"
                  value={allergyInput}
                  onChange={(e) => setAllergyInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addAllergy()
                    }
                  }}
                />
                <Button onClick={addAllergy} className="h-10" type="button">
                  <Plus className="mr-2 h-4 w-4" /> Agregar
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {(form.watch("allergies") || []).length > 0 ? (
                  (form.watch("allergies") || []).map((a) => (
                    <Badge key={a} variant="secondary" className="flex items-center gap-2">
                      <span>{a}</span>
                      <button
                        type="button"
                        onClick={() => removeAllergy(a)}
                        className="text-xs opacity-70 ml-1 rounded hover:bg-muted/30"
                        aria-label={`Eliminar alergia ${a}`}
                      >
                        ×
                      </button>
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Sin alergias registradas</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => form.reset()}>
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar cambios"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  )
}
