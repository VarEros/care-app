"use client"

import React from "react"
import "./globals.css"
import { Authenticator } from "@aws-amplify/ui-react"
import "@aws-amplify/ui-react/styles.css"
import { Amplify } from "aws-amplify"
import outputs from "@/amplify_outputs.json"
import Sidebar from "../components/sidebar"
import { Toaster } from "@/components/ui/sonner"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu, Moon, Sun } from "lucide-react"
import { ThemeProvider } from "@/components/theme-provider"

Amplify.configure(outputs)

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
        {/* <Authenticator>
          {({ signOut, user }) => ( */}
            <>
              <Toaster />
              <div className="flex">
                {/* Desktop sidebar (visible on large screens) */}
                <div className="hidden lg:block">
                  <Sidebar />
                </div>

                {/* Mobile sidebar (Sheet controlled by trigger in header) */}
                {/* The SheetTrigger is also used in the header below */}
                <Sheet>
                  <SheetTrigger asChild>
                    {/* Invisible trigger here — we render a visible trigger in the header.
                        This placeholder keeps the Sheet API consistent; actual trigger button
                        is rendered in the header (see below). */}
                    <span />
                  </SheetTrigger>
                  <SheetContent side="left" className="w-72 lg:hidden p-0">
                    {/* Reuse the Sidebar component inside the Sheet for mobile */}
                    <Sidebar />
                  </SheetContent>
                </Sheet>

                {/* Main content area */}
                <div className="flex-1 overflow-auto h-screen">
                  <header className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-3">
                      {/* Mobile: show menu button to open sidebar */}
                      <div className="lg:hidden">
                        {/* Button that triggers the same Sheet used above */}
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button variant="ghost" className="p-2">
                              <Menu className="h-5 w-5" />
                            </Button>
                          </SheetTrigger>

                          <SheetContent side="left" className="w-72 lg:hidden p-0">
                            <Sidebar />
                          </SheetContent>
                        </Sheet>
                      </div>

                      <span className="text-base">Inicio</span>
                    </div>
                  </header>

                  <main className="p-6">{children}</main>
                </div>
              </div>
            </>
          {/* )}
        </Authenticator> */}
        </ThemeProvider>
      </body>
    </html>
  )
}
