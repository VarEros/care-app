"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarPlus, Circle, Clock, FileSearch, MessageSquare, UserCog } from "lucide-react"

export default function App() {
  return (
    <div className="sm:p-6">
      {/* Page header */}
      <header className="flex flex-col xs:flex-row items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl">
            JP
          </div>
          <div>
            <CardTitle>Dr. Juan Pérez</CardTitle>
            <CardDescription>Cardiología · ID: #D-10234</CardDescription>
          </div>
        </div>

        <div className="text-right flex flex-row gap-4 xs:flex-col xs:gap-0">
            <CardTitle className="self-baseline">Estado</CardTitle>
            <CardDescription className="text-green-600">Activo</CardDescription>
        </div>
      </header>

      {/* Top metrics */}
      <section className="grid grid-cols-1 xs:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <CardDescription>Pacientes hoy</CardDescription>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold">12</span>
            <span className="text-sm text-green-600">+8% vs ayer</span>
          </div>
        </Card>

        <Card className="p-4">
          <CardDescription>Citas Programadas</CardDescription>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold">34</span>
            <span className="text-sm text-muted-foreground">Semana</span>
          </div>
        </Card>

        <Card className="p-4">
          <CardDescription>Consultas Realizadas</CardDescription>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold">28</span>
            <span className="text-sm text-muted-foreground">Semana anterior</span>
          </div>
        </Card>

        <Card className="p-4">
          <CardDescription>Tasa de asistencia</CardDescription>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold">91%</span>
            <span className="text-sm text-muted-foreground">Último mes</span>
          </div>
        </Card>

      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 xl:gap-6">
        {/* Left column: upcoming appointments */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-medium">Próximas citas</h2>
                <div className="text-sm text-muted-foreground">Hoy · 12 citas</div>
              </div>

              <ul className="divide-y">
                <li className="py-3 flex items-center justify-between border-b last:border-0">
                  <div className="flex items-center gap-3">
                    {/* Avatar / Initials */}
                    <div className="w-10 h-10 rounded-full bg-slate-400 text-white flex items-center justify-center font-medium">
                      KP
                    </div>
                    {/* Patient info */}
                    <div>
                      <p className="text-sm font-medium">Karla Paredes</p>
                      <p className="text-xs text-muted-foreground">Control</p>
                    </div>
                  </div>
                  {/* Appointment time */}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-medium">10:30 AM</span>
                  </div>
                </li>

                <li className="py-3 flex items-center justify-between border-b last:border-0">
                  <div className="flex items-center gap-3">
                    {/* Avatar / Initials */}
                    <div className="w-10 h-10 rounded-full bg-slate-400 text-white flex items-center justify-center font-medium">
                      JA
                    </div>
                    {/* Patient info */}
                    <div>
                      <p className="text-sm font-medium">Jose Aguilar</p>
                      <p className="text-xs text-muted-foreground">Primaria</p>
                    </div>
                  </div>
                  {/* Appointment time */}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-medium">03:50 PM</span>
                  </div>
                </li>

                <li className="py-3 flex items-center justify-between border-b last:border-0">
                  <div className="flex items-center gap-3">
                    {/* Avatar / Initials */}
                    <div className="w-10 h-10 rounded-full bg-slate-400 text-white flex items-center justify-center font-medium">
                      MG
                    </div>
                    {/* Patient info */}
                    <div>
                      <p className="text-sm font-medium">Marcos Gutierrez</p>
                      <p className="text-xs text-muted-foreground">Primaria</p>
                    </div>
                  </div>
                  {/* Appointment time */}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-medium">03:30 PM</span>
                  </div>
                </li>
              </ul>
              <div className="mt-4 text-right">
                <Button variant="ghost" className="text-sm">Ver todas las citas</Button>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-medium">Consultas Realizadas</h2>
                <div className="text-sm text-muted-foreground">Hoy · 3 consultas</div>
              </div>

              <ul className="divide-y">
                <li className="py-3 flex items-center justify-between border-b last:border-0">
                  <div className="flex items-center gap-3">
                    {/* Avatar / Initials */}
                    <div className="w-10 h-10 rounded-full bg-slate-400 text-white flex items-center justify-center font-medium">
                      KP
                    </div>
                    {/* Patient info */}
                    <div>
                      <p className="text-sm font-medium">Karla Paredes</p>
                      <p className="text-xs text-muted-foreground">Control</p>
                    </div>
                  </div>
                  {/* Appointment time */}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">10:30 AM</span>
                  </div>
                </li>

                <li className="py-3 flex items-center justify-between border-b last:border-0">
                  <div className="flex items-center gap-3">
                    {/* Avatar / Initials */}
                    <div className="w-10 h-10 rounded-full bg-slate-400 text-white flex items-center justify-center font-medium">
                      KP
                    </div>
                    {/* Patient info */}
                    <div>
                      <p className="text-sm font-medium">Jose Aguilar</p>
                      <p className="text-xs text-muted-foreground">Primaria</p>
                    </div>
                  </div>
                  {/* Appointment time */}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">03:50 PM</span>
                  </div>
                </li>

                <li className="py-3 flex items-center justify-between border-b last:border-0">
                  <div className="flex items-center gap-3">
                    {/* Avatar / Initials */}
                    <div className="w-10 h-10 rounded-full bg-slate-400 text-white flex items-center justify-center font-medium">
                      KP
                    </div>
                    {/* Patient info */}
                    <div>
                      <p className="text-sm font-medium">Marcos Gutierrez</p>
                      <p className="text-xs text-muted-foreground">Primaria</p>
                    </div>
                  </div>
                  {/* Appointment time */}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">03:30 PM</span>
                  </div>
                </li>
              </ul>

              <div className="mt-4 text-right">
                <Button variant="ghost" className="text-sm">Ver todas las consultas</Button>
              </div>
            </Card>
          </div>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Accesos Directos</h2>
            </div>
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
                <Button className="h-10">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Realizar Consulta
                </Button>
                <Button className="h-10">
                  <CalendarPlus className="h-4 w-4 mr-2" />
                  Agregar Cita
                </Button>
                <Button className="h-10">
                  <UserCog className="h-4 w-4 mr-2" />
                  Actualizar Perfil
                </Button>
                <Button className="h-10">
                  <FileSearch className="h-4 w-4 mr-2" />
                  Revisar Examen
                </Button>
            </div>
          </Card>
        </div>

        {/* Right column: schedule summary & settings */}
        <aside className="space-y-4 xl:mt-0 mt-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-md font-medium">Horario semanal</h3>
              <Button variant="ghost" className="text-sm">Editar</Button>
            </div>

            <ul className="text-sm text-muted-foreground space-y-1">
              <li className="flex justify-between"><span>Lunes</span><span>08:00 - 17:00</span></li>
              <li className="flex justify-between"><span>Martes</span><span>08:00 - 17:00</span></li>
              <li className="flex justify-between"><span>Miércoles</span><span>08:00 - 17:00</span></li>
              <li className="flex justify-between"><span>Jueves</span><span>08:00 - 17:00</span></li>
              <li className="flex justify-between"><span>Viernes</span><span>08:00 - 17:00</span></li>
              <li className="flex justify-between"><span>Sábado</span><span className="text-disabled">Cerrado</span></li>
              <li className="flex justify-between"><span>Domingo</span><span className="text-disabled">Cerrado</span></li>
            </ul>
          </Card>

        </aside>
      </div>
    </div>
  )
}
