"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Loader2, Mail } from "lucide-react"

const helpSchema = z.object({
  name: z.string().min(2, "El nombre es requerido"),
  email: z.string().email("Correo inválido"),
  message: z.string().min(10, "El mensaje debe tener al menos 10 caracteres"),
})

export default function HelpPage() {
  const form = useForm<z.infer<typeof helpSchema>>({
    resolver: zodResolver(helpSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  })

  const [loading, setLoading] = useState(false)

  async function onSubmit(values: z.infer<typeof helpSchema>) {
    setLoading(true)
    try {
      // Simulate sending email
      await new Promise((res) => setTimeout(res, 1200))

      console.log("📩 Email sent to developers:", values)
      toast.success("Tu mensaje fue enviado correctamente.")
      form.reset()
    } catch (err) {
      toast.error("No se pudo enviar el mensaje. Intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Centro de Ayuda</h1>
        <p className="text-sm text-muted-foreground">
          ¿Tienes algún problema o sugerencia? Envíanos un mensaje y nuestro equipo de desarrollo se pondrá en contacto contigo.
        </p>
      </header>

      <Card className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Tu nombre" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo electrónico</FormLabel>
                  <FormControl>
                    <Input placeholder="tu@correo.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mensaje</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe tu problema o envía tus comentarios..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" variant="outline" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Enviar mensaje
                </>
              )}
            </Button>
          </form>
        </Form>
      </Card>
    </div>
  )
}
