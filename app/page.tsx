"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardTitle } from "@/components/ui/card"
import { Circle, Clock } from "lucide-react"

export default function App() {
  return (
    <div className="sm:p-6">
      {/* Page header */}
      <header className="flex flex-col sm:flex-row items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Circle className="h-14 w-14">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-blue-600 text-white">
              JD
            </div>
          </Circle>
          <div>
            <CardTitle>Dr. Juan Pérez</CardTitle>
            <CardDescription>Cardiología · ID: #D-10234</CardDescription>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" className="px-3">Perfil</Button>
          <Button>Agregar cita</Button>
        </div>
      </header>

      {/* Top metrics */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
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
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Clock className="h-4 w-4 text-muted-foreground" />
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
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Clock className="h-4 w-4 text-muted-foreground" />
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
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Clock className="h-4 w-4 text-muted-foreground" />
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
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
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
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
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
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">03:30 PM</span>
                  </div>
                </li>
              </ul>

              <div className="mt-4 text-right">
                <Button variant="ghost" className="text-sm">Ver todas las citas</Button>
              </div>
            </Card>
          </div>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-medium">Pacientes recientes</h2>
              <div className="text-sm text-muted-foreground">Últimas 7 días</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-2 border rounded">
                <Circle className="h-10 w-10">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-indigo-500 text-white">AM</div>
                </Circle>
                <div>
                  <p className="text-sm font-medium">Ana Morales</p>
                  <p className="text-xs text-muted-foreground">Cardiología</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2 border rounded">
                <Circle className="h-10 w-10">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-sky-500 text-white">RC</div>
                </Circle>
                <div>
                  <p className="text-sm font-medium">Rosa Campos</p>
                  <p className="text-xs text-muted-foreground">Teleconsulta</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2 border rounded">
                <Circle className="h-10 w-10">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-emerald-500 text-white">JL</div>
                </Circle>
                <div>
                  <p className="text-sm font-medium">Javier López</p>
                  <p className="text-xs text-muted-foreground">Control</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2 border rounded">
                <Circle className="h-10 w-10">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-pink-500 text-white">SC</div>
                </Circle>
                <div>
                  <p className="text-sm font-medium">Sofía Cruz</p>
                  <p className="text-xs text-muted-foreground">Consulta</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right column: schedule summary & settings */}
        <aside className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-md font-medium">Horario semanal</h3>
              <Button variant="ghost" className="text-sm">Editar</Button>
            </div>

            <ul className="text-sm text-gray-700 dark:text-gray-500 space-y-1">
              <li className="flex justify-between"><span>Lunes</span><span>08:00 - 17:00</span></li>
              <li className="flex justify-between"><span>Martes</span><span>08:00 - 17:00</span></li>
              <li className="flex justify-between"><span>Miércoles</span><span>08:00 - 17:00</span></li>
              <li className="flex justify-between"><span>Jueves</span><span>08:00 - 17:00</span></li>
              <li className="flex justify-between"><span>Viernes</span><span>08:00 - 17:00</span></li>
              <li className="flex justify-between"><span>Sábado</span><span className="text-muted-foreground">Cerrado</span></li>
              <li className="flex justify-between"><span>Domingo</span><span className="text-muted-foreground">Cerrado</span></li>
            </ul>
          </Card>



          <Card className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-md font-medium">Estado</h3>
              <p className="text-sm text-green-600 font-medium">Disponible</p>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  )
}
