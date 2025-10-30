"use client"

import { useEffect, useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { client } from "@/lib/amplifyClient"
import { toast } from "sonner"
import { BusinessHoursData, BusinessHoursForm, DoctorSchema } from "../types"
import { dataToForm, dayLabels } from "../helpers/businessHours"

const defaultHours: BusinessHoursForm = {
  monday: { enabled: true, start: "09:00", end: "17:00" },
  tuesday: { enabled: true, start: "09:00", end: "17:00" },
  wednesday: { enabled: true, start: "09:00", end: "17:00" },
  thursday: { enabled: true, start: "09:00", end: "17:00" },
  friday: { enabled: true, start: "09:00", end: "17:00" },
  saturday: { enabled: false, start: "09:00", end: "13:00" },
  sunday: { enabled: false, start: "09:00", end: "13:00" },
}

export function DoctorScheduleSheet({
  openSheet,
  setOpenSheet,
  doctor
}: {
  openSheet: boolean
  setOpenSheet: (open: boolean) => void
  doctor: DoctorSchema
}) {
  const [hours, setHours] = useState<BusinessHoursForm>(defaultHours)
  const [saving, setSaving] = useState(false)

  const handleToggleDay = (day: string) => {
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], enabled: !prev[day].enabled },
    }))
  }

  const handleTimeChange = (day: string, field: "start" | "end", value: string) => {
    const minutes = parseInt(value.split(":")[1], 10)
    // Only accept 00, 20, 40 minutes
    if ([0, 20, 40].includes(minutes)) {
      setHours((prev) => ({
        ...prev,
        [day]: { ...prev[day], [field]: value },
      }))
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
        const { data, errors } = await client.models.Doctor.update({id: doctor.id, businessHours: JSON.stringify(hours)});
      if (errors) {
        console.error("Error creating updating:", errors)
        toast.error("Error al guardar horario de atencion", {
          description: errors[0]["message"]
        })
      } else if (data) {
        setOpenSheet(false)
        toast.success("Horario de atención guardado con exito", {
          description: "Se ha actualizado el horario del Dr. " + doctor.name
        })
      }
    } catch (err) {
      console.error("Create failed:", err)
      toast.error("Algo salio mal...")
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if(!doctor || !doctor.businessHours) return;
    setHours(dataToForm(doctor.businessHours as BusinessHoursData))
  }, [doctor])
  
  return (
    <Sheet open={openSheet} onOpenChange={setOpenSheet}>
      <SheetContent className="flex flex-col space-y-4">
        <SheetHeader>
          <SheetTitle>Horario de atención</SheetTitle>
          <SheetDescription>
            Define los horarios de atención correspondiente al Dr. {doctor.name}, los pacientes podran agendar sus citas en el horario asignado.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 space-y-4">
          {Object.entries(hours).map(([day, { enabled, start, end }]) => (
            <div
              key={day}
              className="flex items-center justify-between border rounded-md p-3"
            >
              <div className="flex flex-col">
                <Label className="font-medium">{dayLabels[day]}</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    type="time"
                    value={start}
                    onChange={(e) => handleTimeChange(day, "start", e.target.value)}
                    disabled={!enabled}
                    className="w-28"
                  />
                  <span>-</span>
                  <Input
                    type="time"
                    value={end}
                      onChange={(e) => {
                        const value = e.target.value
                        const minutes = parseInt(value.split(":")[1], 10)
                        // Only accept 00, 20, 40 minutes
                        if ([0, 20, 40].includes(minutes)) {
                          handleTimeChange(day, "end", value)
                        }
                      }}
                    step={1200} // 20 minutes = 1200 seconds
                    
                    disabled={!enabled}
                    className="w-28"
                  />
                </div>
              </div>

              <Switch checked={enabled} onCheckedChange={() => handleToggleDay(day)} />
            </div>
          ))}
        </div>

        <SheetFooter className="mt-auto space-x-2">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Guardando..." : "Guardar Cambios"}
          </Button>
          <SheetClose asChild>
            <Button variant="outline">Cancelar</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
