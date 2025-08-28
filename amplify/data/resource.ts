import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { postConfirmation } from "../auth/post-confirmation/resource";

/*== STEP 1 ===============================================================
The section below creates a Todo database table with a "content" field. Try
adding a new "isDone" field as a boolean. The authorization rule below
specifies that any user authenticated via an API key can "create", "read",
"update", and "delete" any "Todo" records.
=========================================================================*/
const schema = a.schema({
  UserProfile: a
      .model({
        id: a.id().required(),
        email: a.string()
      })
      .authorization((allow) => [
        allow.ownerDefinedIn("id"),
      ]),
  Doctor: a
    .model({
      id: a.id().required(),
      userId: a.id().required(),  // foreign key
      name: a.string().required(),
      specialty: a.string(),
      patients: a.hasMany("Patient", "doctorId"), // 1 doctor → many patients
    })
    .authorization((allow) => [allow.publicApiKey()]),
  Patient: a
    .model({
      id: a.id().required(),
      userId: a.id().required(),  // foreign key
      doctorId: a.id().required(),  // foreign key
      name: a.string().required(),
      age: a.integer(),
      condition: a.string(),
      doctor: a.belongsTo("Doctor", "doctorId"), // patient → doctor link
    })
    .authorization((allow) => [allow.publicApiKey()]),
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

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server 
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
