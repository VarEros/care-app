"use client"

import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Loader2, Plus, ClipboardList } from "lucide-react"

import { client } from "@/lib/amplifyClient"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"

const schema = z.object({
  name: z.string().min(2, "El nombre es requerido"),
})

type FormValues = z.infer<typeof schema>

export default function SpecialtiesPage() {
  const [specialties, setSpecialties] = useState<Array<string>>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
  })

  useEffect(() => {
    let alive = true
    const load = async () => {
      setLoading(true)
      try {
        const { data, errors } = await client.models.Catalog.list({
          filter: { type: { eq: "Especialidades" } },
          selectionSet: ["value"],
        })
        if (!alive) return
        if (errors) {
          console.error("Failed to load specialties:", errors)
          toast.error("No se pudo cargar especialidades")
          setSpecialties([])
        } else {
          setSpecialties(data.map((s) => s.value))
        }
      } catch (err) {
        console.error("Load failed:", err)
        toast.error("Error al cargar especialidades")
        setSpecialties([])
      } finally {
        if (alive) setLoading(false)
      }
    }

    load()
    return () => {
      alive = false
    }
  }, [])

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true)
    try {
      const payload: any = {
        value: values.name.trim(),
        type: "Especialidades",
        createdAt: new Date().toISOString(),
      }
      const { data, errors } = await client.models.Catalog.create(payload)
      if (errors) {
        console.error("Create error:", errors)
        toast.error("No se pudo crear la especialidad")
      } else if (data) {
        setSpecialties((s) => [payload.value, ...s])
        toast.success("Especialidad agregada")
        form.reset()
      }
    } catch (err) {
      console.error("Failed to create specialty:", err)
      toast.error("Error al agregar especialidad")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Catálogo — Especialidades</h1>
          <p className="text-sm text-muted-foreground">
            Lista simple de especialidades. Añade nuevas desde abajo.
          </p>
        </div>
      </header>

      {/* Form to add new specialty */}
      <Card className="p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-3 items-start">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel className="sr-only">Nombre de especialidad</FormLabel>
                  <FormControl>
                    <Input placeholder="Nueva especialidad (ej. Cardiología)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="h-10" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" /> Agregar
                </>
              )}
            </Button>
          </form>
        </Form>
      </Card>

      {/* List of specialties */}
      <Card className="p-4">
        <h2 className="text-lg font-medium mb-3 flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-muted-foreground" />
          Especialidades registradas
        </h2>
        <Separator className="mb-4" />

        {loading ? (
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Cargando especialidades...</span>
          </div>
        ) : specialties.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay especialidades registradas.</p>
        ) : (
          <ul className="divide-y divide-border">
            {specialties.map((s, idx) => (
              <li key={idx} className="py-3 flex items-center justify-between">
                <span className="font-medium">{s}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
