// app/Sidebar.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
// import { useAuthenticator } from "@aws-amplify/ui-react";
// import { fetchAuthSession } from "aws-amplify/auth";

export default function Sidebar() {
  // Local state to hold Cognito groups from the access token payload
  const [groups, setGroups] = useState<string[]>([]);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        // 🔑 Auth v6: use fetchAuthSession to access JWT tokens
        // const { tokens } = await fetchAuthSession();
        // console.log(tokens?.idToken?.payload["cognito:groups"]);

        // // Read groups from the access token payload; might be undefined
        // const gs =
        //   (tokens?.accessToken?.payload["cognito:groups"] as string[] | undefined) ??
        //   [];

        if (alive) setGroups(["Admins"]);
      } catch (err) {
        console.error("Failed to fetch auth session:", err);
        if (alive) setGroups([]);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // Build the menu based on groups
  const items = useMemo(() => {
    const base = [
      { label: "Dashboard", href: "/" },
      { label: "Perfil", href: "/profile" },
    ];

    if (groups.includes("Patients")) {
      base.push(
        { label: "Mis Citas", href: "/my-appointments" },
        { label: "Mis Recetas", href: "/my-recipes" }
      );
    }

    // Show to Doctors
    if (groups.includes("Doctors")) {
      base.push(
        { label: "Pacientes", href: "/patients" },
        { label: "Citas", href: "/appointments" },
        { label: "Recetas", href: "/recipes" }
      );
    }

    // Show to Admins
    if (groups.includes("Admins")) {
      base.push(
        { label: "Administración", href: "/admin" },
        { label: "Citas", href: "/appointments" },
        { label: "Doctores", href: "/doctors" },
        { label: "Consultas", href: "/consultations" }
      );
    }

    return base;
  }, [groups]);

  return (
    <aside className="w-64 h-screen bg-slate-900 text-white p-4">
      <h2 className="text-lg font-bold mb-4">Menú</h2>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              className="block hover:bg-gray-700 p-2 rounded"
              href={item.href}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Optional: show current groups for debugging */}
      {/* <pre className="mt-4 text-xs opacity-70">{JSON.stringify(groups, null, 2)}</pre> */}
    </aside>
  );
}
