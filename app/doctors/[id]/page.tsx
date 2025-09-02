'use client'

import { client } from "@/lib/amplifyClient";

const selectionSet = ["name", "specialty", "appointments.id", "appointments.patient.name", "appointments.type"] as const;

export default async function DoctorPage({ params }: { params: { id: string } }) {
  const doctor = await client.models.Doctor.get({ id: params.id }, {selectionSet});

  if (!doctor.data) return <p>Doctor no encontrado</p>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">{doctor.data.name}</h1>
      <p>Especialidad: {doctor.data.specialty}</p>

      <h2 className="mt-4 font-semibold">Citas</h2>
      <ul>
        {doctor.data.appointments?.map((appt) => (
          <li key={appt.id}>{appt.patient.name} – {appt.type}</li>
        ))}
      </ul>
    </div>
  );
}
