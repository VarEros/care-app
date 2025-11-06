import { type ClientSchema, a, defineData, defineFunction } from "@aws-amplify/backend";
import { postConfirmation } from "../auth/post-confirmation/resource";

export const createDoctorWithUserHandler = defineFunction({
  name: 'create-doctor-with-user',
  entry: './createDoctorWithUser/handler.ts',
})

export const createCompleteConsultationHandler = defineFunction({
  name: "create-complete-consultation",
  entry: "./createCompleteConsultation/handler.ts", 
});

const dosageFormats = a.enum(["mg", "ml", "pastilla", "gota", "tableta", "capsula"])
const frequencyTypes = a.enum(["Horas", "Dias", "Semanas"])
const genders =  a.enum(["Masculino", "Femenino", "Otro"])
const appointmentTypes = a.enum(["Primaria", "Seguimiento", "Preventiva"])
const bloodTypes = a.enum(["A_POSITIVO", "A_NEGATIVO", "B_POSITIVO", "B_NEGATIVO", "AB_POSITIVO", "AB_NEGATIVO", "O_POSITIVO", "O_NEGATIVO"])
const appointmentStatuses = a.enum(["Registrada", "Aprobada", "Completada", "Cancelada"])
const simpleStatuses = a.enum(["Activo", "Inactivo"])

const baseDoctor = {
  name: a.string().required(),
  email: a.email().required(),
  birthdate: a.date().required(),
  gender: genders,
  specialty: a.string().required()
}

const baseBiometric = {
  patientId: a.id().required(),
  validatedOn: a.datetime().required(),
  weight: a.integer(),
  height: a.integer(),
  temperature: a.integer(),
  heartRate: a.integer(),
  diastolicPressure: a.integer(),
  systolicPressure: a.integer(),
}

const baseRecipe = {
  medication: a.string().required(),
  dosage: a.integer().required(),
  dosageFormat: dosageFormats,
  frequency: a.integer().required(),
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
  startedAt: a.datetime().required(),
  endedAt: a.datetime().required()
}

export const schema = a.schema({
  Doctor: a
    .model({
      ...baseDoctor,
      businessHours: a.json(),
      status: simpleStatuses,
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
      email: a.email().required(),
      name: a.string().required(),
      birthdate: a.date().required(),
      gender: genders,
      exams: a.string(),
      background: a.string(),
      allergies: a.string().array(),
      bloodType: bloodTypes,
      appointments: a.hasMany("Appointment", "patientId"), // relación con Appointment
      recipes: a.hasMany("Recipe", "patientId"), // relación con Recipe
      biometrics: a.hasMany("Biometric", "patientId")
    })
    .authorization((allow) => [
      allow.ownerDefinedIn("id").to(["read", "create", "update"]), // patient
      allow.group("Doctors").to(["read"])
    ]),

  Biometric: a
    .model({
      ...baseBiometric,
      patient: a.belongsTo("Patient", "patientId"),
    })
    .authorization((allow) => [
      allow.ownerDefinedIn("patientId").to(["read"]), // patient
      allow.group("Doctors").to(["read", "create"])
    ]),

  Appointment: a
    .model({
      doctorId: a.id().required(), // FK → Doctor
      patientId: a.id().required(), // FK → Patient
      scheduledOn: a.datetime().required(),
      type: appointmentTypes,
      motive: a.string(),
      reason: a.string().authorization((allow) => allow.group("Patients").to(["read"])),
      status: appointmentStatuses,
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
      patient: a.belongsTo("Patient", "patientId")
    })
    .authorization((allow) => [
      allow.ownerDefinedIn("patientId").to(["read"]), // doctor
      allow.group("Doctors").to(["read", "create"]),
    ]),


    createDoctorWithUser: a
      .mutation()
      .arguments(baseDoctor)
      .returns(a.ref("Doctor"))
      .authorization((allow) => [allow.group("Admins")])
      .handler(a.handler.function(createDoctorWithUserHandler)), // only admins create doctors 

    BaseRecipe: a.customType(baseRecipe),
    BaseConsultation: a.customType(baseConsultation),
    BaseBiometric: a.customType(baseBiometric),
    
    createCompleteConsultation: a
      .mutation()
      .arguments({
        consultation: a.ref("BaseConsultation").required(),
        recipes: a.ref("BaseRecipe").array(),
        biometric: a.ref("BaseBiometric"),
      })
      .returns(a.ref("Appointment")) // return the created consultation
      .authorization((allow) => [
        allow.group("Doctors"),
      ])
      .handler(a.handler.function(createCompleteConsultationHandler)),

    Catalog: a.model ({
      type: a.string().required(),
      value: a.string().required(),
      status: simpleStatuses,
      createdAt: a.datetime().required(),
    })
    .identifier(["type", "createdAt"])
    .authorization((allow) => [
        allow.group("Admins").to(["read", "create", "update"]),
        allow.groups(["Doctors", "Patients"]).to(["read"]),
      ])
})
.authorization((allow) => [
  allow.resource(postConfirmation),
  allow.resource(createDoctorWithUserHandler),
  allow.resource(createCompleteConsultationHandler),
]);

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
