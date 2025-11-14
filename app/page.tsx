"use client";

import React, { useEffect, useState } from "react";
import { fetchAuthSession, signOut } from "aws-amplify/auth"// adjust to your auth utilities
import DoctorDashboard from "@/components/doctorDashboard"; // create/replace with your component
import { Button } from "@/components/ui/button";
import PatientProfilePage from "./profile/page";

/**
 * RoleBasedDashboard
 * - fetches the current authenticated user's groups from the Cognito token
 * - renders different components depending on group membership
 *
 * Behavior:
 * 1. If user is in "Admins" => show AdminDashboard
 * 2. Else if user is in "Doctors" => show DoctorDashboard
 * 3. Else if user is in "Patients" => show PatientDashboard
 * 4. Else show a fallback / unauthorized view
 *
 * Notes:
 * - Amplify Auth returns the JWT in user.signInUserSession.accessToken.payload
 *   where group membership is typically in claim "cognito:groups".
 * - We use Auth.currentAuthenticatedUser() for a robust client-side check.
 */
export default function App(): JSX.Element {
  const [loading, setLoading] = useState<boolean>(true);
  const [groups, setGroups] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchGroups() {
      setLoading(true);
      setError(null);
      try {
        const { tokens } = await fetchAuthSession()
        // tokens?.accessToken?.payload["cognito:groups"] or tokens?.idToken?.payload depending on your setup
        const gs =
          (tokens?.accessToken?.payload?.["cognito:groups"] as string[] | undefined) ??
          (tokens?.idToken?.payload?.["cognito:groups"] as string[] | undefined) ??
          []

        // Normalize to string[] or null

        if (mounted) {
          setGroups(gs);
          setLoading(false);
        }
      } catch (err: any) {
        console.error("Error checking user groups:", err);
        if (mounted) {
          setError(err?.message ?? "No authenticated user");
          setGroups(null);
          setLoading(false);
        }
      }
    }

    fetchGroups();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Cargando usuario…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-600 mb-4">Error: {error}</div>
        <div>
          <Button onClick={() => signOut()}>Cerrar sesión</Button>
        </div>
      </div>
    );
  }

  // Helper to check group membership
  const inGroup = (g: string) => !!groups?.includes(g);

  if (inGroup("Doctors")) {
    return <DoctorDashboard />;
  }

  if (inGroup("Patients")) {
    return <PatientProfilePage />;
  }

  // Fallback: user has no group recognized
  return (
    <div className="p-6">
      <h2 className="text-lg font-medium">Acceso denegado</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Tu cuenta no tiene asignado un rol con acceso a esta página. Contacta al administrador.
      </p>
      <div className="mt-4">
        <Button variant="ghost" onClick={() => signOut()}>
          Cerrar sesión
        </Button>
      </div>
    </div>
  );
}
