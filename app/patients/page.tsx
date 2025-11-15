"use client"

import React, { useEffect, useState } from "react"
import { Loader2, Eye } from "lucide-react"
import { client } from "@/lib/amplifyClient"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { PatientRecord } from "@/lib/types"
import { PatientSheet } from "@/components/patientSheet"
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item"


export default function PatientsPage() {
  const [patients, setPatients] = useState<PatientRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [patient, setPatient] = useState<PatientRecord | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (patients.length > 0) return;
    const loadPatients = async () => {
      setLoading(true)
      try {
        const { data, errors } = await client.models.Patient.list({ selectionSet: ["id", "name", "cedula", "email", "birthdate", "gender", "bloodType", "background", "allergies", "exams"] })
        if (errors) console.error(errors)
        else setPatients(data ?? [])
      } catch (err) {
        console.error("Failed to load patients:", err)
        setPatients([])
      } finally {
        setLoading(false)
      }
    }
    loadPatients()
  }, [])

  const openRecord = (p: PatientRecord) => {
    setPatient(p)
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
            <Item key={p.id} variant="outline" className="bg-card">
              <ItemContent>
                <ItemTitle className="truncate">{p.name}</ItemTitle>
                <ItemDescription className="flex items-center gap-2 text-sm text-muted-foreground truncate">
                  <span className="truncate">{p.cedula ?? "—"}</span>
                  <Separator orientation="vertical" className="mx-2 h-4" />
                  <span className="truncate">{p.email ?? "—"}</span>
                </ItemDescription>
              </ItemContent>

              <ItemActions>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openRecord(p)}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Revisar expediente
                </Button>
              </ItemActions>
            </Item>
          ))}
        </ul>
      )}
      <PatientSheet open={open} setOpen={setOpen} patient={patient} />
    </div>
  )
}
