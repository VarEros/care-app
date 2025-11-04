"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { PatientRecord } from "@/lib/types"

interface PatientSheetProps {
  open: boolean
  setOpen: (open: boolean) => void
  patient: PatientRecord | null
}

export function PatientSheet({ open, setOpen, patient }: PatientSheetProps) {
  return (
    <Sheet
      open={open}
      onOpenChange={setOpen}
    >
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Expediente del paciente</SheetTitle>
        </SheetHeader>

        {patient ? (
          <div className="space-y-4 mt-4">
            {/* Avatar + Basic Info */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl">
                {patient.name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div>
                <p className="text-lg font-medium">{patient.name}</p>
                <p className="text-sm text-muted-foreground">
                  {patient.email ?? "—"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Cédula: {patient.cedula ?? "—"}
                </p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Fecha de nacimiento</p>
                <p className="font-medium">
                  {patient.birthdate
                    ? new Date(patient.birthdate).toLocaleDateString("es-ES")
                    : "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Género</p>
                <p className="font-medium">{patient.gender ?? "—"}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Tipo de sangre</p>
                <p className="font-medium">{patient.bloodType ?? "—"}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Alergias</p>
                <p className="font-medium">
                  {patient.allergies && patient.allergies.length
                    ? patient.allergies.join(", ")
                    : "—"}
                </p>
              </div>
            </div>

            {/* Background */}
            <div>
              <p className="text-xs text-muted-foreground">Antecedentes</p>
              <p className="whitespace-pre-line">
                {patient.background ?? "—"}
              </p>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
