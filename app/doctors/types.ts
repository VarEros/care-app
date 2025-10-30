import { Schema } from "@/amplify/data/resource";

export type DoctorSchema = Schema["Doctor"]["type"]

export type BusinessHoursForm = {
  [key: string]: {
    enabled: boolean
    start: string
    end: string
  }
}

export type BusinessHoursData = {
  [key: string]: {
    start: string
    end: string
  }
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
    specialty: "Neurologia",
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