"use client";

import { useEffect, useState } from "react";
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
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Array<Schema["Doctor"]["type"]>>([]);
  const [loading, setLoading] = useState(true);

  // form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [gender, setGender] = useState("Masculino");
  const [specialty, setSpecialty] = useState("");

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const { data, errors } = await client.models.Doctor.list();

        if (errors) console.error(errors);
        else setDoctors(data);
      } catch (err) {
        console.error("Failed to load doctors:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDoctors();
  }, []);

  const handleCreate = async () => {
    console.log(gender);
    
    if (!name || !email || !birthdate || !gender) return;

    try {
      const { data, errors } = await client.mutations.createDoctorWithUser({
        name,
        email,
        birthdate,
        gender,
        specialty
      });

      if (errors) {
        console.error("Error creating doctor:", errors);
      } else if (data) {
        setDoctors((prev) => [...prev, data]);
        // reset form
        setName("");
        setEmail("");
        setBirthdate("");
        setGender("Masculino");
        setSpecialty("");
      }
    } catch (err) {
      console.error("Create failed:", err);
    }
  };

  if (loading) return <p className="p-4">Loading doctors...</p>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Doctors</h1>

        {/* Dialog to add doctor */}
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 text-white">Add Doctor</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Doctor</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Doctor name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Doctor email"
                />
              </div>
              <div>
                <Label htmlFor="birthdate">Birthdate</Label>
                <Input
                  id="birthdate"
                  type="date"
                  value={birthdate}
                  onChange={(e) => setBirthdate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Masculino">Masculino</SelectItem>
                    <SelectItem value="Femenino">Femenino</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="specialty">Specialty</Label>
                <Input
                  id="specialty"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  placeholder="Specialty"
                />
              </div>
              <Button onClick={handleCreate} className="w-full">
                Save Doctor
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {doctors.length === 0 ? (
        <p>No doctors found</p>
      ) : (
        <ul className="space-y-2">
          {doctors.map((doc) => (
            <li
              key={doc.id}
              className="border rounded p-3 bg-white shadow-sm flex justify-between"
            >
              <div>
                <p className="font-medium">{doc.name}</p>
                <p className="text-sm text-gray-600">
                  {doc.specialty ?? "No specialty"}
                </p>
                <p className="text-sm text-gray-500">{doc.email}</p>
              </div>
              <span className="text-sm text-gray-800">{doc.status}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
