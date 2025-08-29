import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { postConfirmation } from "../auth/post-confirmation/resource";

export const schema = a.schema({
  Doctor: a
    .model({
      id: a.id().required(),
      userId: a.id().required(),
      name: a.string().required(),
      specialty: a.string(),
      appointments: a.hasMany("Appointment", "doctorId"), // 👈 relación con join table
    })
    .authorization((allow) => [
      allow.ownerDefinedIn("userId"),
      allow.ownerDefinedIn("appointments.patient.userId"), // los pacientes asignados pueden ver
    ]),

  Patient: a
    .model({
      id: a.id().required(),
      userId: a.id().required(),
      email: a.email(),
      name: a.string().required(),
      birthdate: a.string().required(),
      appointments: a.hasMany("Appointment", "patientId"), // 👈 relación con join table
    })
    .authorization((allow) => [
      allow.ownerDefinedIn("userId"),
      allow.ownerDefinedIn("appointments.doctor.userId"), // el doctor asignado puede ver
    ]),

  Appointment: a
    .model({
      id: a.id().required(),
      doctorId: a.id().required(), // FK → Doctor
      patientId: a.id().required(), // FK → Patient
      date: a.datetime().required(),
      type: a.enum(["Primaria", "Seguimiento", "Preventiva"]),
      status: a.enum(["Programada", "Completada", "Cancelada"]),
      doctor: a.belongsTo("Doctor", "doctorId"),
      patient: a.belongsTo("Patient", "patientId"),
    }),

  Consultation: a
    .model({
      id: a.id().required(),
      appointmentId: a.id().required(), // FK → Appointment
      date: a.datetime().required(),
      reason: a.string(),
      diagnosis: a.string(),
      treatment: a.string(),
      observations: a.string(),
      appointment: a.belongsTo("Appointment", "appointmentId"),
    }),
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
