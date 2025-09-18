"use client";

import { useState } from "react";
import { client } from "@/lib/amplifyClient";
import type { Schema } from "@/amplify/data/resource";
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

interface Props {
  doctorId: string;
  onCreated: (appt: Schema["Appointment"]["type"]) => void;
}

export default function CreateAppointmentDialog({ doctorId, onCreated }: Props) {
  const [patientId, setPatientId] = useState("");
  const [scheduledOn, setScheduledOn] = useState("");
  const [type, setType] = useState<Schema["Appointment"]["type"]["type"]>("Primaria");
  const [open, setOpen] = useState(false);

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
        onCreated(data);
        setOpen(false);
        // reset form
        setPatientId("");
        setScheduledOn("");
        setType("Primaria");
      }
    } catch (err) {
      console.error("Create failed:", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
              <SelectTrigger className="w-full">
                <span>{type || "Select type"}</span>
              </SelectTrigger>
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
  );
}
