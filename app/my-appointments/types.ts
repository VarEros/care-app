import { Nullable } from "@aws-amplify/data-schema"

export type Appointment = {
    readonly status: "Registrada" | "Aprobada" | "Completada" | "Cancelada" | null;
    readonly scheduledOn: string;
    readonly doctor: {
        readonly name: string;
        readonly specialty: Nullable<string>;
    }
}

export type Doctor = {
  id: string
  name: string
  specialty: string
  businessHours?: Record<
    string,
    {
      start: number
      end: number
    }
  >
}

export const doctorList = [
  {
    id: "1",
    name: "Juan Perez",
    email: "juanperez@gmail.com",
    specialty: "Neurologia",
    gender: "Femenino",
    businessHours: {
      monday: { start: "09:40", end: "17:00" },
      tuesday: { start: "09:00", end: "17:00" },
      wednesday: { start: "09:00", end: "17:00" },
      thursday: { start: "09:00", end: "17:00" },
      friday: { start: "09:00", end: "17:20" },
    }
  },
  {
    id: "2",
    name: "Juan Bolivar",
    email: "juanbolivar@gmail.com",
    gender: "Masculino",
    businessHours: {
      monday: { start: "08:00", end: "17:00" },
      tuesday: { start: "08:00", end: "17:00" },
      wednesday: { start: "08:00", end: "17:00" },
      thursday: { start: "09:00", end: "17:00" },
      friday: { start: "09:00", end: "17:00" },
      saturday: { start: "09:00", end: "17:00" },
    }
  }
]