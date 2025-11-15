"use client"

import React, { useEffect, useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Loader2, UploadCloud, FileText, Image as ImageIcon } from "lucide-react"
import { toast } from "sonner"
import { remove, uploadData, getUrl } from 'aws-amplify/storage';

import { client } from "@/lib/amplifyClient"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { fetchAuthSession } from "aws-amplify/auth"
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item"

/**
 * ExamsPage (patient)
 *
 * - Patient model contains `exams: string[]` where each string is an S3 object key.
 * - Upload flow:
 *   1. User selects a PDF / image file.
 *   2. We upload it to S3 using Amplify Storage.put with a patient-scoped key.
 *   3. We update the Patient.exams array (prepend new key) via client.models.Patient.update(...)
 *   4. UI shows list of exam keys; "Ver" retrieves a signed URL via Storage.get and opens it.
 *
 * Notes:
 * - Adjust client.models.Patient.update/get shape to match your generated client if needed.
 * - Storage level used is 'protected' (private to the user); change to 'public' if your bucket is public.
 */

export default function ExamsPage() {
  const [exams, setExams] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [patientId, setPatientId] = useState<string | null>(null)

  const [deleteKey, setDeleteKey] = useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let alive = true
    const load = async () => {
      setLoading(true)
      try {
        // get current user sub and load patient record
        const { tokens } = await fetchAuthSession()
        const sub = tokens?.idToken?.payload["sub"] as string | undefined
        if (!sub) {
          toast.error("No se pudo obtener el usuario autenticado")
          if (alive) setLoading(false)
          return
        }
        setPatientId(sub)

        // fetch patient (adjust selectionSet to your client implementation)
        const { data, errors } = await client.models.Patient.get({ id: sub }, { selectionSet: ["exams"] })
        if (errors) {
          console.error("Failed to load patient exams:", errors)
          toast.error("No se pudieron cargar los exámenes")
          if (alive) {
            setExams([])
          }
        } else if (data) {
          if (alive) setExams(Array.isArray(data.exams) ? data.exams.filter(Boolean) : [])
        } else {
          if (alive) setExams([])
        }
      } catch (err) {
        console.error("Load failed:", err)
        toast.error("Error al cargar exámenes")
        if (alive) setExams([])
      } finally {
        if (alive) setLoading(false)
      }
    }

    load()
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    if (!file) {
      setPreview(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const onFileChange = (f: File | null) => {
    setFile(f)
    setName(f?.name ?? "")
  }

  const clearForm = () => {
    setFile(null)
    setName("")
    setPreview(null)
  }

  const uploadAndAttach = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!file) {
      toast.error("Selecciona un archivo (.pdf, .jpg, .png)")
      return
    }
    if (!patientId) {
      toast.error("Paciente no autenticado")
      return
    }

    const allowed = ["application/pdf", "image/jpeg", "image/jpg", "image/png"]
    if (!allowed.includes(file.type)) {
      toast.error("Formato no soportado. Usa PDF o JPG/PNG.")
      return
    }

    setUploading(true)
    try {
      // build key: patients/{patientId}/exams/{timestamp}_{filename}
      const safeName = name.replace(/\s+/g, "_")
      const path = `patients/${patientId}/exams/${safeName}`

      // upload to S3 (protected to ensure only owner access). adjust level if needed.
      uploadData({
            path,
            data: file,
            options: {
              contentType: file.type,
            },
        })

      // update Patient.exams array (prepend)
      const newExams = [safeName, ...exams]
      const { data, errors } = await client.models.Patient.update({ id: patientId, exams: newExams })
      if (errors) {
        console.error("Failed to attach exam key to patient:", errors)
        toast.error("No se pudo asociar el examen al paciente")
        // optionally try to delete uploaded object to keep consistency
      } else {
        // update UI with server response if available; otherwise use local newExams
        setExams(Array.isArray(data?.exams) ? data.exams.filter(Boolean) : newExams)
        toast.success("Examen subido y asociado correctamente")
        clearForm()
        setOpen(false)
      }
    } catch (err) {
      console.error("Upload failed:", err)
      toast.error("Error al subir el archivo")
    } finally {
      setUploading(false)
    }
  }

  const handleView = async (key: string) => {
    try {
      // retrieve signed url (protected level)
      const data = await getUrl({
        path: `patients/${patientId}/exams/${key}`,
      });
      // open new tab
      window.open(data.url, "_blank", "noopener")
    } catch (err) {
      console.error("Failed to get file url:", err)
      toast.error("No se pudo obtener el archivo. Verifica permisos/configuración de Storage.")
    }
  }

 // open delete modal
  const handleDelete = (key: string) => {
    setDeleteKey(key)
    setDeleteOpen(true)
  }

  // confirm delete (modal)
  const confirmDelete = async () => {
    if (!patientId || !deleteKey) return
    setDeleting(true)
    try {
      const key = deleteKey
      // remove key from patient.exams
      const newExams = exams.filter((k) => k !== key)
      const { data, errors } = await client.models.Patient.update({ id: patientId, exams: newExams })
      if (errors) {
        console.error("Failed to remove exam key from patient:", errors)
        toast.error("No se pudo eliminar el examen")
      } else {
        setExams(Array.isArray(data?.exams) ? data.exams!.filter(Boolean) : newExams)
        // delete S3 object (best-effort)
        try {
          await remove({path: `patients/${patientId}/exams/${key}`});
        } catch (err) {
          console.warn("Failed to delete s3 object (non-fatal):", err)
        }
        toast.success("Examen eliminado")
      }
    } catch (err) {
      console.error("Delete failed:", err)
      toast.error("No se pudo eliminar el examen")
    } finally {
      setDeleting(false)
      setDeleteOpen(false)
      setDeleteKey(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Exámenes</h1>
          <p className="text-sm text-muted-foreground">Sube y consulta exámenes (PDF / JPG / PNG).</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <UploadCloud className="mr-2 h-4 w-4" /> Agregar Examen
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Subir examen (PDF / JPG / PNG)</DialogTitle>
            </DialogHeader>

            <form onSubmit={uploadAndAttach} className="space-y-4 py-2">
              <div>
                <label className="block text-sm mb-1">Nombre (opcional)</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Laboratorio - Hemograma" />
              </div>

              <div>
                <label className="block text-sm mb-1">Archivo</label>
                <input
                  accept=".pdf,image/*"
                  type="file"
                  onChange={(ev) => onFileChange(ev.target.files ? ev.target.files[0] : null)}
                  className="block w-full text-sm"
                />
              </div>

              {preview && file?.type.startsWith("image/") && (
                <div className="border rounded p-2">
                  <img src={preview} alt="preview" className="max-h-48 w-auto mx-auto" />
                </div>
              )}

              {file && file.type === "application/pdf" && (
                <div className="text-sm text-muted-foreground">PDF seleccionado: {file.name}</div>
              )}

              <DialogFooter>
                <div className="flex items-center justify-between w-full gap-2">
                  <div>
                    <Button variant="outline" onClick={() => { clearForm(); setOpen(false) }} disabled={uploading}>
                      Cancelar
                    </Button>
                  </div>

                  <div>
                    <Button type="submit" disabled={uploading}>
                      {uploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Subiendo...
                        </>
                      ) : (
                        <>
                          <UploadCloud className="mr-2 h-4 w-4" /> Subir
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </header>


        {loading ? (
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Cargando exámenes...</span>
          </div>
        ) : exams.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay exámenes registrados.</p>
        ) : (
          <ul className="divide-y divide-border">
            {exams.map((key) => {
              const isImage = /\.(jpg|jpeg|png)$/i.test(key)
              const extension = key.split('.').pop() || "desconocida"
              const filename = key.split("/").pop() ?? key

              return (
                <li key={key} className="py-3">
                  <Item variant="outline">
                    <ItemMedia  variant="icon" className="bg-muted/40 rounded-md">
                      {isImage ? <ImageIcon className="h-1 w-5" /> : <FileText className="h-5 w-5" />}
                    </ItemMedia>

                    <ItemContent>
                      <ItemTitle className="truncate">{filename}</ItemTitle>
                      <ItemDescription className="text-sm">
                        Formato: {isImage ? "Imagen" : "Documento"} — Extensión: {extension}
                      </ItemDescription>
                    </ItemContent>

                    <ItemActions>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleView(key)}>
                          Ver
                        </Button>

                        <Button variant="destructive" size="sm" onClick={() => handleDelete(key)}>
                          Eliminar
                        </Button>
                      </div>
                    </ItemActions>
                  </Item>
                </li>
              )
            })}
          </ul>
        )}

      {/* Delete confirmation dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm">
              ¿Eliminar este examen? Esta acción no se puede deshacer.
            </p>
            <p className="mt-2 text-xs text-muted-foreground break-words">{deleteKey}</p>
          </div>

          <DialogFooter>
            <div className="flex items-center justify-between w-full gap-2">
              <div>
                <Button variant="outline" onClick={() => { setDeleteOpen(false); setDeleteKey(null); }} disabled={deleting}>
                  Cancelar
                </Button>
              </div>

              <div>
                <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
                  {deleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Eliminando...
                    </>
                  ) : (
                    "Eliminar"
                  )}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}