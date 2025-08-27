import { defineFunction } from "@aws-amplify/backend";

export const createDoctorDynamo = defineFunction({
  name: "create-doctor-dynamo",
  entry: "./create_doctor_dynamo/handler.ts"
});