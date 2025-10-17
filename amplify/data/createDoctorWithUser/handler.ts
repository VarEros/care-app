import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminAddUserToGroupCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import type { Schema } from "../../data/resource";
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { env } from '$amplify/env/create-doctor-with-user'; // replace with your function name

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);

Amplify.configure(resourceConfig, libraryOptions);

const schemaClient = generateClient<Schema>();
const cognitoClient = new CognitoIdentityProviderClient({});

export const handler = async (event: any) => {
  const { name, email, birthdate, gender, specialty } = event.arguments;
  console.log("createDoctorWithUser event:", event);
  const userpool_id = env.CARE_APP_USERPOOL_ID;

  try {
    // 1. Create Cognito user
    const createRes = await cognitoClient.send(
      new AdminCreateUserCommand({
        UserPoolId: userpool_id,
        Username: email,
        UserAttributes: [
          { Name: "email", Value: email },
          { Name: "birthdate", Value: birthdate},
          { Name: "email_verified", Value: "true" },
        ],
        TemporaryPassword: Math.random().toString(36).slice(-8) + "Aa1!", // temp password
      })
    );

    const userSub =
      createRes.User?.Attributes?.find((a) => a.Name === "sub")?.Value;
    if (!userSub) throw new Error("No sub returned from Cognito");

    // 2. Add to Doctors group
    await cognitoClient.send(
      new AdminAddUserToGroupCommand({
        UserPoolId: userpool_id,
        Username: email,
        GroupName: "Doctors",
      })
    );

    // 3. Create Dynamo Doctor record
    const { data: doctor } = await schemaClient.models.Doctor.create({
      id: userSub, // keep consistent with Cognito sub
      name,
      email,
      birthdate,
      gender,
      specialty,
      status: "Activo",
    });

    return doctor;
  } catch (err) {
    console.error("createDoctorWithUser failed:", err);
    throw err;
  }
};
