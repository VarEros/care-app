import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { postConfirmation } from "../auth/post-confirmation/resource";

export const schema = a.schema({
  Doctor: a
    .model({
      name: a.string().required(),
      email: a.email().required(),
      birthdate: a.date().required(),
      gender: a.string().required(),
      specialty: a.string(),
      status: a.enum(["Activo", "Inactivo"]),
      appointments: a.hasMany("Appointment", "doctorId"), // relación con Appointment
    })
    .authorization((allow) => [
      allow.ownerDefinedIn("id"),
    ]),

  Patient: a
    .model({
      email: a.email(),
      name: a.string().required(),
      birthdate: a.date().required(),
      gender: a.string().required(),
      appointments: a.hasMany("Appointment", "patientId"), // relación con Appointment
      recipes: a.hasMany("Recipe", "patientId"), // relación con Recipe
    })
    .authorization((allow) => [
      allow.ownerDefinedIn("id"),
      allow.groups(["Doctors"])
    ]),

  Appointment: a
    .model({
      doctorId: a.id().required(), // FK → Doctor
      patientId: a.id().required(), // FK → Patient
      scheduledOn: a.datetime().required(),
      type: a.enum(["Primaria", "Seguimiento", "Preventiva"]),
      status: a.enum(["Programada", "Completada", "Cancelada"]),
      doctor: a.belongsTo("Doctor", "doctorId"),
      patient: a.belongsTo("Patient", "patientId"),
      consultation: a.hasOne("Consultation", "appointmentId"),
    })
    .secondaryIndexes((index) => [
      index("doctorId").sortKeys(["status","scheduledOn"]),
      index("patientId").sortKeys(["status", "scheduledOn"])
    ])
    .authorization((allow) => [
      allow.ownerDefinedIn("doctorId"), // el doctor asignado puede ver
      allow.ownerDefinedIn("patientId"), // el paciente asignado puede ver
    ]),

  Consultation: a
    .model({
      appointmentId: a.id().required(), // FK → Appointment
      reason: a.string(),
      diagnosis: a.string(),
      treatment: a.string(),
      observations: a.string(),
      startedAt: a.datetime().required(),
      endedAt: a.datetime(),
      appointment: a.belongsTo("Appointment", "appointmentId"),
      recipes: a.hasMany("Recipe", "consultationId"), // relación con Recipe
    })
    .authorization((allow) => [
      allow.groups(["Doctors"]),
      //allow.ownerDefinedIn("appointment.doctorId"), // el doctor asignado puede ver
      //allow.ownerDefinedIn("appointment.patientId"), // el paciente asignado puede ver
    ]),

    Recipe: a
    .model({
      consultationId: a.id().required(), // FK → Consultation
      patientId: a.id().required(), // FK → Patient
      medication: a.string().required(),
      dosage: a.string().required(),
      frequency: a.string().required(),
      duration: a.string().required(),
      notes: a.string(),
      consultation: a.belongsTo("Consultation", "consultationId"),
      patient: a.belongsTo("Patient", "patientId"),
      createdAt: a.datetime()
    })
    .secondaryIndexes((index) => [
      index("patientId").sortKeys(["createdAt"])
    ])
    .authorization((allow) => [
      allow.ownerDefinedIn("patientId"), // el paciente asignado puede ver
      //allow.ownerDefinedIn("consultation.appointment.doctorId"), // el doctor asignado puede ver
    ]),
})
.authorization((allow) => [allow.resource(postConfirmation)]);

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
