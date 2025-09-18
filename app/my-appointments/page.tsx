"use client";

import { useEffect, useState } from "react";
import { fetchAuthSession } from "aws-amplify/auth";
import { client } from "@/lib/amplifyClient"; // 👈 adjust path if different
import type { Schema } from "@/amplify/data/resource";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<
    Array<Schema["Appointment"]["type"]>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        // 1. Get current Cognito user session
        const { tokens } = await fetchAuthSession();
        const patientId = tokens?.idToken?.payload["sub"] as string; // 👈 Cognito user id

        if (!patientId) {
          console.warn("No patientId found in Cognito session");
          setLoading(false);
          return;
        }

        // 2. Fetch appointments where patientId = current user's sub
        const { data, errors } = await client.models.Appointment.list({
          filter: {
            patientId: { eq: patientId },
          },
        });

        if (errors) {
          console.error("Error fetching appointments:", errors);
        } else {
          setAppointments(data);
        }
      } catch (err) {
        console.error("Failed to load appointments:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, []);

  if (loading) return <p className="p-4">Loading appointments...</p>;

  if (appointments.length === 0)
    return <p className="p-4">No appointments found</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">My Appointments</h1>
      <ul className="space-y-2">
        {appointments.map((appt) => (
          <li
            key={appt.id}
            className="border rounded p-3 bg-white shadow-sm flex justify-between"
          >
            <div>
              <p className="font-medium">{appt.patient?.name ?? "Unknown"}</p>
              <p className="text-sm text-gray-600">
                {appt.type} – {appt.status}
              </p>
            </div>
            <span className="text-sm text-gray-800">
              {new Date(appt.scheduledOn).toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
