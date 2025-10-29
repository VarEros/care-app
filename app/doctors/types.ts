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