"use client";

import { fetchUserAttributes, FetchUserAttributesOutput } from 'aws-amplify/auth';
import { Authenticator } from "@aws-amplify/ui-react";
import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import "./../app/app.css";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";

Amplify.configure(outputs);

const client = generateClient<Schema>();

export default function App() {
  const [doctors, setDoctors] = useState<Array<Schema["Doctor"]["type"]>>([]);
  const [attributes, setAttributes] = useState<FetchUserAttributesOutput>({});

  function listDoctors() {
    client.models.Doctor.observeQuery().subscribe({
      next: (data) => setDoctors([...data.items]),
    });
  }

  useEffect(() => {
    const loadUserAttributes = async () => {
      try {
        // Fetch the signed-in user's attributes
        const userAttributes = await fetchUserAttributes();
        setAttributes(userAttributes);
      } catch (err) {
        console.error("Error fetching user attributes:", err);
      }
    };

    loadUserAttributes();
    listDoctors();
  }, []);

  function createDoctor() {
    client.models.Doctor.create({
      userId: attributes.sub!, // foreign key
      name: window.prompt("Doctor name") ?? "John",
      specialty: window.prompt("Doctor speciality"),
    });
  }

  function toggleDoctor(doctor: Schema["Doctor"]["type"]) {
    client.models.Doctor.update({
      id: doctor.id,
      specialty: window.prompt("Doctor speciality")
    });
  }

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <main>
          <h1>Doctor of {attributes.name}</h1>
          <button onClick={createDoctor}>+ new</button>
          <ul>
            {doctors.map((doctor) => (
              <li key={doctor.id}
                  onClick={() => toggleDoctor(doctor)}
              >{doctor.name} especialista en  {doctor.specialty}</li>
            ))}
          </ul>
          <div>
            🥳 App successfully hosted. Try creating a new doctor.
            <br />
            <a href="https://docs.amplify.aws/nextjs/start/quickstart/nextjs-app-router-client-components/">
              Review next steps of this tutorial.
            </a>
          </div>
        </main>
      )}
    </Authenticator>
  );
}
