import { data } from "../resource"; // Adjust path to your backend data export
import { Amplify } from 'aws-amplify';
import type { Schema } from "../resource";
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { generateClient } from 'aws-amplify/data';
import { env } from '$amplify/env/create-complete-consultation'; // replace with your function name

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);

Amplify.configure(resourceConfig, libraryOptions);

const schemaClient = generateClient<Schema>();
type Handler = Schema["createCompleteConsultation"]["functionHandler"]

export const handler: Handler = async (event) => {
    const {
        consultation,
        recipes,
        biometric
    } = event.arguments;

    try {
      // Step 1: Create Consultation
      const consultationResponse = await schemaClient.models.Consultation.create(consultation);
      if (consultationResponse.errors) {
          console.error("Error creating consultation:", consultationResponse.errors);
          throw new Error("Failed to create consultation");
      }

      const appointmentResponse = await schemaClient.models.Appointment.update({
          doctorId: consultation.doctorId, 
          scheduledOn: consultation.scheduledOn,
          status: "Completada"
      })

      const consultationId = consultationResponse.data!.id;
      const patientId = appointmentResponse.data!.patientId;
      // Step 2: Create related Recipes
      if (recipes && recipes.length > 0) {
        for (const recipe of recipes) {
          await schemaClient.models.Recipe.create({
              ...recipe!,
              consultationId,
              patientId,
          });
        }
      }
      if (biometric) {
        await schemaClient.models.Biometric.create(biometric!)
      }
      return consultationResponse.data!.id;
      
    } catch (err) {
      console.error("createConsultationWithRecipes failed:", err);
      throw err;
    }

  };
