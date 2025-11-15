"use client"

import { useEffect, useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { FileText, ImageIcon, Loader2 } from "lucide-react"
import { PatientRecord } from "@/lib/types"
import { client } from "@/lib/amplifyClient"
import { Nullable } from "@aws-amplify/data-schema"
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "./ui/item"
import { Button } from "./ui/button"
import { getUrl } from "aws-amplify/storage"
import { toast } from "sonner"

interface PatientSheetProps {
  open: boolean
  setOpen: (open: boolean) => void
  patient: PatientRecord | null
}

type Biometric = {
    readonly createdAt: string;
    readonly weight: Nullable<number>;
    readonly height: Nullable<number>;
    readonly temperature: Nullable<number>;
    readonly heartRate: Nullable<number>;
    readonly diastolicPressure: Nullable<number>;
    readonly systolicPressure: Nullable<number>;
};

export function PatientSheet({ open, setOpen, patient }: PatientSheetProps) {
  const [biometric, setBiometric] = useState<Biometric | null>(null)
  useEffect(() => {
    if (!patient) return
    const loadBiometric = async () => {
      try {
        const { data, errors } = await client.models.Biometric.list({patientId: patient.id ,limit: 1, sortDirection: "DESC", selectionSet: ["height", "weight", "temperature", "heartRate", "systolicPressure", "diastolicPressure", "createdAt"]})
        if (errors) console.error("Failed to load biometric data:", errors)
        else if (data.length) setBiometric(data[0])
      } catch (err) {
        console.error("Failed to load biometric data:", err)
      }
    }
    loadBiometric()
  }, [patient])

  const handleView = async (key: string) => {
    try {
      // retrieve signed url (protected level)
      const data = await getUrl({
        path: `patients/${patient!.id}/exams/${key}`,
      });
      // open new tab
      console.log(data.url)
      // open href
      window.open(data.url.href, "_blank");
    } catch (err) {
      console.error("Failed to get file url:", err)
      toast.error("No se pudo obtener el archivo. Verifica permisos/configuración de Storage.")
    }
  }
  
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

            {/* Biometric Data */}
            {biometric ? (
              <div className="border-t pt-4">
                <p className="text-sm font-semibold mb-2">Signos Vitales</p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Peso</p>
                    <p className="font-medium">
                      {biometric.weight ? `${biometric.weight} kg` : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Altura</p>
                    <p className="font-medium">
                      {biometric.height ? `${biometric.height} cm` : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Temperatura</p>
                    <p className="font-medium">
                      {biometric.temperature ? `${biometric.temperature} °C` : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Ritmo cardiaco</p>
                    <p className="font-medium">
                      {biometric.heartRate ? `${biometric.heartRate} bpm` : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Presión diastólica</p>
                    <p className="font-medium">
                      {biometric.diastolicPressure
                        ? `${biometric.diastolicPressure} mmHg`
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Presión sistólica</p>
                    <p className="font-medium">
                      {biometric.systolicPressure
                        ? `${biometric.systolicPressure} mmHg`
                        : "—"}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mt-2">
                  Medido el:{" "}
                  {new Date(biometric.createdAt).toLocaleString("es-ES")}
                </p>
              </div>
            ) : (
              <div className="border-t pt-4 text-sm text-muted-foreground">
                No hay datos biométricos recientes.
              </div>
            )}
            {/* Exams */}
            <div className="border-t pt-4">
              <p className="text-sm font-semibold mb-3">Exámenes</p>

              {patient.exams && patient.exams.length > 0 ? (
                <ul className="divide-y divide-border">
                  {patient.exams.map((key) => {
                    const filename = key.split("/").pop() ?? key
                    const isImage = /\.(jpg|jpeg|png)$/i.test(filename)
                    const extension = filename.split(".").pop() ?? "desconocida"

                    return (
                      <li key={key} className="py-3">
                        <Item variant="outline">
                          <ItemMedia variant="icon" className="bg-muted/40 rounded-md">
                            {isImage ? <ImageIcon className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                          </ItemMedia>

                          <ItemContent>
                            <ItemTitle className="truncate">{filename}</ItemTitle>
                            <ItemDescription className="text-sm">
                              Formato: {isImage ? "Imagen" : "Documento"} — Extensión: {extension}
                            </ItemDescription>
                          </ItemContent>

                          <ItemActions>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleView(key)}>
                                Ver
                              </Button>
                            </div>
                          </ItemActions>
                        </Item>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No hay exámenes registrados.</p>
              )}
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
