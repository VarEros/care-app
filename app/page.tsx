"use client";

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

  function listDoctors() {
    client.models.Doctor.observeQuery().subscribe({
      next: (data) => setDoctors([...data.items]),
    });
  }

  useEffect(() => {
    listDoctors();
  }, []);

  function createDoctor() {
    client.models.Doctor.create({
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
    <main>
      <h1>My doctors</h1>
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
  );
}
