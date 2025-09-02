"use client";

import { client } from "@/lib/amplifyClient";

export default function DoctorsPage() {
  const createDoctor = async () => {
    await client.models.Doctor.create({
        name: "Dr. Smith",
        email: "drexample@gmail.com",
        birthdate: new Date("1980-01-01").toISOString(),
        gender: "Masculino",
        specialty: "Cardiology",
    });
  };

  return (
    <div className="p-4">
      <button onClick={createDoctor} className="bg-blue-500 text-white px-4 py-2 rounded">
        Crear Doctor
      </button>
    </div>
  );
}