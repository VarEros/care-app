"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Biometric } from "../type"

/**
 * Biometric drawer component that **does not perform persistence itself**.
 * Instead it calls `setBiometric` (provided by the parent) with the validated payload.
 *
 * Validation: each numeric field is optional. If provided, it is validated with:
 *   z.coerce.number().int().positive().lte(999, "Numero muy largo")
 *
 * This converts string inputs into numbers, enforces integer & positive & <= 999.
 *
 * Props:
 *  - open: boolean
 *  - onOpenChange: (open: boolean) => void
 *  - setBiometric: (payload: BiometricPayload) => Promise<void> | void
 *
 * The form will call setBiometric(payload) on successful validation and close the sheet.
 */

const biometricSchema = z.object({
  weight: z.coerce.number().int().positive().lte(999, "Numero muy largo").optional(), // kg
  height: z.coerce.number().int().positive().lte(999, "Numero muy largo").optional(), // cm
  temperature: z.coerce.number().int().positive().lte(999, "Numero muy largo").optional(), // °C (integer)
  heartRate: z.coerce.number().int().positive().lte(999, "Numero muy largo").optional(), // bpm
  diastolicPressure: z.coerce.number().int().positive().lte(999, "Numero muy largo").optional(), // mmHg
  systolicPressure: z.coerce.number().int().positive().lte(999, "Numero muy largo").optional() // mmHg
})

type BiometricFormValues = z.infer<typeof biometricSchema>

export default function BiometricDrawer({
  open,
  onOpenChange,
  setBiometric,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  setBiometric: (payload: Biometric | null) => void
}) {
    const defaultValues = {
        weight: undefined,
        height: undefined,
        temperature: undefined,
        heartRate: undefined,
        diastolicPressure: undefined,
        systolicPressure: undefined,
    }
    const form = useForm<BiometricFormValues>({
        resolver: zodResolver(biometricSchema),
        defaultValues
    })

    const handleSubmit = (values: BiometricFormValues) => {
        console.log(values);
        setBiometric(values)
        toast.success("Datos biométricos listos")
        onOpenChange(false)
    }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        {/* parent can render a trigger separately — keep here as placeholder */}
        <span />
      </SheetTrigger>

      <SheetContent side="right" className="w-[420px]">
        <SheetHeader>
          <SheetTitle>Agregar datos biométricos</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="grid grid-cols-1 gap-4 py-4">
            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Peso (kg)</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" placeholder="Ej. 72"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="height"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Altura (cm)</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" placeholder="Ej. 175" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="temperature"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Temperatura (°C)</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" placeholder="Ej. 36" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="heartRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frecuencia cardíaca (lpm)</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" placeholder="Ej. 72" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="systolicPressure"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Presión sistólica</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" placeholder="Ej. 120"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="diastolicPressure"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Presión diastólica</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" placeholder="Ej. 80" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex items-center justify-between pt-2">
                <Button
                    type="button"
                    variant="outline"
                    disabled={!form.formState.isDirty}
                    onClick={() => {
                        form.reset(defaultValues)
                        setBiometric(null)
                        onOpenChange(false)
                    }}
                >
                  Descartar
                </Button>

                <Button type="submit">
                  Guardar Datos
                </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
