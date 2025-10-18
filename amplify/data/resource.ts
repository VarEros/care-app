import { type ClientSchema, a, defineData, defineFunction } from "@aws-amplify/backend";
import { postConfirmation } from "../auth/post-confirmation/resource";

export const createDoctorWithUserHandler = defineFunction({
  name: 'create-doctor-with-user',
  entry: './createDoctorWithUser/handler.ts',
})

export const schema = a.schema({
  Doctor: a
    .model({
      name: a.string().required(),
      email: a.email().required(),
      birthdate: a.date().required(),
      gender: a.enum(["Masculino", "Femenino", "Otro"]),
      specialty: a.string(),
      businessHours: a.json(),
      status: a.enum(["Activo", "Inactivo"]),
      appointments: a.hasMany("Appointment", "doctorId"), // relación con Appointment
    })
    .authorization((allow) => [
      allow.group("Admins").to(["read", "create", "update"]),
      allow.group("Patients").to(["read"]),
      allow.ownerDefinedIn("id").to(["read", "create", "update"])
    ]),

  Patient: a
    .model({
      cedula: a.string().required(),
      email: a.email(),
      name: a.string().required(),
      birthdate: a.date().required(),
      gender: a.enum(["Masculino", "Femenino", "Otro"]),
      appointments: a.hasMany("Appointment", "patientId"), // relación con Appointment
      recipes: a.hasMany("Recipe", "patientId"), // relación con Recipe
    })
    .secondaryIndexes((index) => [index("cedula")])
    .authorization((allow) => [
      allow.ownerDefinedIn("id").to(["read", "create", "update"]), // patient
      allow.group("Doctors").to(["read"])
    ]),

  Appointment: a
    .model({
      doctorId: a.id().required(), // FK → Doctor
      patientId: a.id().required(), // FK → Patient
      scheduledOn: a.datetime().required(),
      type: a.enum(["Primaria", "Seguimiento", "Preventiva"]),
      status: a.enum(["Registrada", "Aprobada", "Completada", "Cancelada"]),
      doctor: a.belongsTo("Doctor", "doctorId"),
      patient: a.belongsTo("Patient", "patientId"),
      consultation: a.hasOne("Consultation", ["doctorId", "appointmentScheduledOn"]),
    })
    .identifier(["doctorId", "scheduledOn"])
    .secondaryIndexes((index) => [
      index("patientId").sortKeys(["scheduledOn"])
    ])
    .authorization((allow) => [
      allow.ownerDefinedIn("doctorId").to(["read", "create", "update"]), // patient or doctor
      allow.group("Patients").to(["read", "create"])
    ]),

  Consultation: a
    .model({
      doctorId: a.id().required(), // FK → Appointment
      appointmentScheduledOn: a.datetime().required(),
      reason: a.string(),
      diagnosis: a.string(),
      treatment: a.string(),
      observations: a.string(),
      startedAt: a.datetime().required(),
      endedAt: a.datetime(),
      record: a.json(),
      appointment: a.belongsTo("Appointment", ["doctorId", "appointmentScheduledOn"]),
      recipes: a.hasMany("Recipe", "consultationId"), // relación con Recipe
    })
    .authorization((allow) => [
      allow.group("Patients").to(["read"]),
      allow.ownerDefinedIn("doctorId").to(["read", "create", "update"]) // doctor
    ]),

    Recipe: a
    .model({
      consultationId: a.id().required(), // FK → Consultation
      patientId: a.id().required(), // FK → Patient
      medication: a.string().required(),
      dosage: a.integer().required(),
      frequency: a.string().required(),
      frequencyType: a.enum(["Hora", "Dia", "Semana"]),
      until: a.datetime().required(),
      notes: a.string(),
      consultation: a.belongsTo("Consultation", "consultationId"),
      patient: a.belongsTo("Patient", "patientId"),
      createdAt: a.datetime().required()
    })
    .identifier(["patientId", "createdAt"])
    .authorization((allow) => [
      allow.ownerDefinedIn("patientId").to(["read"]), // doctor
      allow.group("Doctors").to(["read", "create", "update"]),
    ]),

    createDoctorWithUser: a
      .mutation()
      .arguments({
        name: a.string().required(),
        email: a.string().required(),
        birthdate: a.date().required(),
        gender: a.string().required(),
        specialty: a.string(),
      })
      .returns(a.ref("Doctor"))
      .authorization((allow) => [allow.groups(["Admins"])])
      .handler(a.handler.function(createDoctorWithUserHandler)), // only admins create doctors 
})
.authorization((allow) => [allow.resource(postConfirmation),
  allow.resource(createDoctorWithUserHandler)]);

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  name: "care-app",
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
}); 
