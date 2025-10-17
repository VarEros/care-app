"use client"

import { useState } from "react"
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

type BusinessHours = {
  [key: string]: {
    enabled: boolean
    start: string
    end: string
  }
}

const defaultHours: BusinessHours = {
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
  doctorName = "Juan Pérez",
}: {
  openSheet: boolean
  setOpenSheet: (open: boolean) => void
  doctorName?: string
}) {
  const [hours, setHours] = useState<BusinessHours>(defaultHours)
  const [saving, setSaving] = useState(false)

  const handleToggleDay = (day: string) => {
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], enabled: !prev[day].enabled },
    }))
  }

  const handleTimeChange = (day: string, field: "start" | "end", value: string) => {
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Simulate API save
      console.log("Saving hours:", hours)
      // await api.updateDoctorSchedule(doctorId, hours)
    } finally {
      setSaving(false)
      setOpenSheet(false)
    }
  }

  const dayLabels: Record<string, string> = {
    monday: "Lunes",
    tuesday: "Martes",
    wednesday: "Miércoles",
    thursday: "Jueves",
    friday: "Viernes",
    saturday: "Sábado",
    sunday: "Domingo",
  }

  return (
    <Sheet open={openSheet} onOpenChange={setOpenSheet}>
      <SheetContent className="flex flex-col space-y-4">
        <SheetHeader>
          <SheetTitle>Horario de atención</SheetTitle>
          <SheetDescription>
            Define los horarios de atención para el Dr. {doctorName}
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
                    onChange={(e) => handleTimeChange(day, "end", e.target.value)}
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
