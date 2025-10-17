"use client";

import "./globals.css";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import Sidebar from "../components/sidebar";
import { Toaster } from "@/components/ui/sonner"

Amplify.configure(outputs);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* <Authenticator>
          {({ signOut, user }) => (
            <> */}
            <Toaster />
            <div className="flex">
              {/* Left side menu filtered by Cognito groups */}
              <Sidebar />

              {/* Main content */}
              <div className="flex-1 min-h-screen bg-gray-50">
                <header className="flex justify-between p-4 bg-white border-b">
                  <span>Bienvenido Juan Perez</span>
                  <button
                    onClick={undefined}
                    className="px-3 py-1 rounded bg-gray-900 text-white"
                  >
                    Cerrar sesión
                  </button>
                </header>
                <main className="p-6">{children}</main>
              </div>
            </div>
            {/* </>
          )}
        </Authenticator> */}
      </body>
    </html>
  );
}
