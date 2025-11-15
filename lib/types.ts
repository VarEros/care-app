import { Nullable } from "@aws-amplify/data-schema"

export type PatientRecord = {
    readonly name: string;
    readonly email: string;
    readonly birthdate: string;
    readonly gender: "Masculino" | "Femenino" | "Otro" | null;
    readonly id: string;
    readonly cedula: string;
    readonly background: Nullable<string>;
    readonly allergies: Nullable<string>[] | null;
    readonly bloodType: "A_POSITIVO" | "A_NEGATIVO" | "B_POSITIVO" | "B_NEGATIVO" | "AB_POSITIVO" | "AB_NEGATIVO" | "O_POSITIVO" | "O_NEGATIVO" | null;
    readonly exams: string[] | null;
}