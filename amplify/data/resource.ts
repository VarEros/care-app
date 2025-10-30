import { type ClientSchema, a, defineData, defineFunction } from "@aws-amplify/backend";
import { postConfirmation } from "../auth/post-confirmation/resource";

export const createDoctorWithUserHandler = defineFunction({
  name: 'create-doctor-with-user',
  entry: './createDoctorWithUser/handler.ts',
})

export const createConsultationWithRecipesHandler = defineFunction({
  name: "create-consultation-with-recipes",
  entry: "./createConsultationWithRecipes/handler.ts", 
});

const dosageFormats = a.enum(["mg", "ml", "pastilla", "gota", "tableta", "cápsula"])
const frequencyTypes = a.enum(["Horas", "Dias", "Semanas"])
const genders =  a.enum(["Masculino", "Femenino", "Otro"])

const baseDoctor = {
  name: a.string().required(),
  email: a.email().required(),
  birthdate: a.date().required(),
  gender: genders,
  specialty: a.string().required()
}

const baseRecipe = {
  medication: a.string().required(),
  dosage: a.integer().required(),
  dosageFormat: dosageFormats,
  frequency: a.string().required(),
  frequencyType: frequencyTypes,
  until: a.datetime().required(),
  notes: a.string(),
}

const baseConsultation = {
  doctorId: a.id().required(), // FK → Appointment
  appointmentScheduledOn: a.datetime().required(),
  diagnosis: a.string().required(),
  treatment: a.string(),
  observations: a.string(),
  startedAt: a.datetime(),
  endedAt: a.datetime()
}

export const schema = a.schema({
  Doctor: a
    .model({
      ...baseDoctor,
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
      gender: genders,
      exames: a.string(),
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
      reason: a.string().required().authorization((allow) => allow.group("Patients").to(["read"])),
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
      ...baseConsultation,
      record: a.json(),
      appointment: a.belongsTo("Appointment", ["doctorId", "appointmentScheduledOn"]),
      recipes: a.hasMany("Recipe", "consultationId"), // relación con Recipe
    })
    .authorization((allow) => [
      allow.group("Patients").to(["read"]),
      allow.ownerDefinedIn("doctorId").to(["read", "create"]) // doctor
    ]),

    Recipe: a
    .model({
      consultationId: a.id().required(), // FK → Consultation
      patientId: a.id().required(), // FK → Patient
      ...baseRecipe,
      consultation: a.belongsTo("Consultation", "consultationId"),
      patient: a.belongsTo("Patient", "patientId"),
      createdAt: a.datetime().required()
    })
    .identifier(["patientId", "createdAt"])
    .authorization((allow) => [
      allow.ownerDefinedIn("patientId").to(["read"]), // doctor
      allow.group("Doctors").to(["read", "create"]),
    ]),


    createDoctorWithUser: a
      .mutation()
      .arguments(baseDoctor)
      .returns(a.ref("Doctor"))
      .authorization((allow) => [allow.groups(["Admins"])])
      .handler(a.handler.function(createDoctorWithUserHandler)), // only admins create doctors 

    BaseRecipe: a.customType(baseRecipe),
    BaseConsultation: a.customType(baseConsultation),
    
    createConsultationWithRecipes: a
      .mutation()
      .arguments({
        consultation: a.ref("BaseConsultation").required(),
        recipes: a.ref("BaseRecipe").array().required(),
      })
      .returns(a.ref("Appointment")) // return the created consultation
      .authorization((allow) => [
        allow.group("Doctors"),
      ])
      .handler(a.handler.function(createConsultationWithRecipesHandler)),

    Catalog: a.model ({
      type: a.string().required(),
      value: a.string().required(),
      status: a.enum(["Activo", "Inactivo"]),
      createdAt: a.datetime().required(),
    })
    .identifier(["type", "createdAt"])
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
