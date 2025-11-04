"use client"

import React, { useEffect, useState } from "react"
import { Loader2, Eye } from "lucide-react"
import { client } from "@/lib/amplifyClient"

import { Nullable } from "@aws-amplify/data-schema"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

/**
 * PatientsView
 * - lists patient records (compact items)
 * - action "Revisar expediente" opens a read-only dialog with the record details
 *
 * Assumes `client.models.Patient.list()` exists and returns { data, errors }.
 * Adjust selectionSet to your API model if necessary.
 */

type PatientRecord = {
    readonly name: string;
    readonly email: string;
    readonly birthdate: string;
    readonly gender: "Masculino" | "Femenino" | "Otro" | null;
    readonly id: string;
    readonly cedula: string;
    readonly background: Nullable<string>;
    readonly allergies: Nullable<string>[] | null;
    readonly bloodType: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-" | null;
}

export default function PatientsView() {
  const [patients, setPatients] = useState<PatientRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState<PatientRecord | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let alive = true
    const load = async () => {
      setLoading(true)
      try {
        const { data, errors } = await client.models.Patient.list({ selectionSet: ["id", "name", "cedula", "email", "birthdate", "gender", "bloodType", "background", "allergies"] })
        if (!alive) return
        if (errors) {
          console.error("Failed to load patients:", errors)
          setPatients([])
        } else {
          setPatients(data ?? [])
        }
      } catch (err) {
        console.error("Failed to load patients:", err)
        setPatients([])
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => {
      alive = false
    }
  }, [])

  const openRecord = (p: PatientRecord) => {
    setActive(p)
    setOpen(true)
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Pacientes</h1>
          <p className="text-sm text-muted-foreground">Lista de pacientes y acceso rápido a su expediente</p>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-3">Cargando pacientes...</span>
        </div>
      ) : patients.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-sm text-muted-foreground">No hay pacientes registrados.</p>
        </Card>
      ) : (
        <ul className="space-y-3">
          {patients.map((p) => (
            <li key={p.id} className="border rounded-lg bg-card">
              <div className="flex items-center justify-between p-4 gap-4">
                <div className="flex items-center gap-4 min-w-0">

                  <div className="min-w-0">
                    <p className="font-medium truncate">{p.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground truncate">
                      <span className="truncate">{p.cedula ?? "—"}</span>
                      <Separator orientation="vertical" className="mx-2 h-4" />
                      <span className="truncate">{p.email ?? "—"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {p.bloodType && <Badge variant="secondary">{p.bloodType}</Badge>}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openRecord(p)}
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Revisar expediente
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Read-only dialog for patient details */}
      <Dialog open={open} onOpenChange={(v) => { if (!v) setActive(null); setOpen(v) }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Expediente del paciente</DialogTitle>
          </DialogHeader>

          {active ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl">
                  {active.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <p className="text-lg font-medium">{active.name}</p>
                  <p className="text-sm text-muted-foreground">{active.email ?? "—"}</p>
                  <p className="text-sm text-muted-foreground">Cédula: {active.cedula ?? "—"}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Fecha de nacimiento</p>
                  <p className="font-medium">{active.birthdate ? new Date(active.birthdate).toLocaleDateString("es-ES") : "—"}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Género</p>
                  <p className="font-medium">{active.gender ?? "—"}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Tipo de sangre</p>
                  <p className="font-medium">{active.bloodType ?? "—"}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Alergias</p>
                  <p className="font-medium">{active.allergies && active.allergies.length ? active.allergies.join(", ") : "—"}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Antecedentes</p>
                <p className="whitespace-pre-line">{active.background ?? "—"}</p>
              </div>

              <div className="pt-2 text-right">
                <Button variant="ghost" onClick={() => setOpen(false)}>Cerrar</Button>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
