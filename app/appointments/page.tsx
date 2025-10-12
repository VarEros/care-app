"use client";

import { useEffect, useState } from "react";
import { fetchAuthSession } from "aws-amplify/auth";
import { client } from "@/lib/amplifyClient";
import type { Schema } from "@/amplify/data/resource";

// shadcn/ui components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<
    Array<Schema["Appointment"]["type"]>
  >([]);
  const [loading, setLoading] = useState(true);
  const [doctorId, setDoctorId] = useState<string | null>(null);

  // Form state
  const [patientId, setPatientId] = useState("");
  const [scheduledOn, setScheduledOn] = useState("");
  const [type, setType] = useState<Schema["Appointment"]["type"]["type"]>("Primaria");

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const { tokens } = await fetchAuthSession();
        const sub = tokens?.idToken?.payload["sub"] as string;
        setDoctorId(sub);

        if (!sub) {
          setLoading(false);
          return;
        }

        const { data, errors } = await client.models.Appointment.list({
          filter: { doctorId: { eq: sub } },
        });

        if (errors) console.error(errors);
        else setAppointments(data);
      } catch (err) {
        console.error("Failed to load appointments:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, []);

  const handleCreate = async () => {
    if (!doctorId || !patientId || !scheduledOn) return;

    try {
      const { data, errors } = await client.models.Appointment.create({
        doctorId,
        patientId,
        scheduledOn: new Date(scheduledOn).toISOString(),
        type,
        status: "Programada",
      });

      if (errors) {
        console.error("Error creating appointment:", errors);
      } else if (data) {
        setAppointments((prev) => [...prev, data]);
        // reset form
        setPatientId("");
        setScheduledOn("");
        setType("Primaria");
      }
    } catch (err) {
      console.error("Create failed:", err);
    }
  };

  if (loading) return <p className="p-4">Loading appointments...</p>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">My Appointments</h1>
        {/* Dialog to add appointment */}
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 text-white">Add Appointment</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Appointment</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="patientId">Patient ID</Label>
                <Input
                  id="patientId"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  placeholder="Enter patient ID"
                />
              </div>

              <div>
                <Label htmlFor="scheduledOn">Date & Time</Label>
                <Input
                  id="scheduledOn"
                  type="datetime-local"
                  value={scheduledOn}
                  onChange={(e) => setScheduledOn(e.target.value)}
                />
              </div>

              <div>
                <Label>Type</Label>
                <Select value={type ?? undefined} onValueChange={(value) => setType(value as Schema["Appointment"]["type"]["type"])}>
                  <SelectTrigger className="w-full" />
                  <SelectContent>
                    <SelectItem value="Primaria">Primaria</SelectItem>
                    <SelectItem value="Seguimiento">Seguimiento</SelectItem>
                    <SelectItem value="Preventiva">Preventiva</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleCreate} className="w-full">
                Save Appointment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {appointments.length === 0 ? (
        <p>No appointments found</p>
      ) : (
        <ul className="space-y-2">
          {appointments.map((appt) => (
            <li
              key={appt.id}
              className="border rounded p-3 bg-white shadow-sm flex justify-between"
            >
              <div>
                <p className="font-medium">
                  {appt.patient?.name ?? appt.patientId}
                </p>
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
      )}
    </div>
  );
}
