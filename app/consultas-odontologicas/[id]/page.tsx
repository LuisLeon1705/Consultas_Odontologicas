"use client"

import Laboratorios from "@/components/Laboratorios"
import { Odontodiagrama } from "@/components/odontodiagrama"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { eliminarConsulta } from "@/lib/actions"
import { AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function VerConsulta() {
  const params = useParams()
  const router = useRouter()
  const [consulta, setConsulta] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [eliminando, setEliminando] = useState(false)
  const [usingMemory, setUsingMemory] = useState(false)

  // Verificar el estado de la base de datos
  useEffect(() => {
    const checkDbStatus = async () => {
      try {
        const response = await fetch("/api/db-status")
        const data = await response.json()
        setUsingMemory(data.usingMemory)

        if (data.usingMemory) {
          console.warn("Usando datos en memoria en lugar de base de datos")
        }
      } catch (error) {
        console.error("Error al verificar el estado de la base de datos:", error)
        setUsingMemory(true)
      }
    }

    checkDbStatus()
  }, [])

  useEffect(() => {
    const fetchConsulta = async () => {
      try {
        const response = await fetch(`/api/consultas/${params.id}`)
        if (!response.ok) {
          throw new Error("No se pudo cargar la consulta")
        }
        const data = await response.json()
        setConsulta(data)
      } catch (error) {
        console.error("Error al cargar la consulta:", error)
        setError("Error al cargar la consulta. Por favor, inténtelo de nuevo.")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchConsulta()
    }
  }, [params.id])

  const handleEliminar = async () => {
    setEliminando(true)
    try {
      await eliminarConsulta(Number(params.id))
      router.push("/consultas-odontologicas")
    } catch (error) {
      console.error("Error al eliminar la consulta:", error)
      alert("Error al eliminar la consulta. Por favor, inténtelo de nuevo.")
      setEliminando(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Cargando datos de la consulta...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-sans">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    )
  }

  if (!consulta) {
    return (
      <div className="container mx-auto">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-sans">Aviso: </strong>
          <span className="block sm:inline">No se encontró la consulta solicitada.</span>
        </div>
      </div>
    )
  }

  // Formatear la fecha
  const fecha = new Date(consulta.fecha)
  const fechaFormateada = fecha.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <div className="container mx-auto">
      {usingMemory && (
        <Alert variant="warning" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Modo de datos en memoria</AlertTitle>
          <AlertDescription>
            El sistema está funcionando con datos en memoria debido a problemas de conexión con la base de datos. Los
            cambios no serán persistentes.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-sans">Consulta #{consulta.id}</h1>
        <div className="flex gap-2">
          <Link href="/consultas-odontologicas">
            <Button variant="outline">Volver</Button>
          </Link>
          <Link href={`/consultas-odontologicas/${consulta.id}/editar`}>
            <Button>Editar</Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={eliminando}>
                {eliminando ? "Eliminando..." : "Eliminar"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Se eliminará permanentemente la consulta y todos sus datos
                  asociados.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleEliminar} className="bg-red-600 hover:bg-red-700">
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Información del paciente */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Información del Paciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-medium">Nombre:</p>
              <p>{consulta.paciente}</p>
            </div>
            <div>
              <p className="font-medium">Cédula:</p>
              <p>{consulta.paciente_cedula}</p>
            </div>
            <div>
              <p className="font-medium">Fecha de Consulta:</p>
              <p>{fechaFormateada}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información del odontólogo */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Odontólogo Asignado</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{consulta.odontologo || "No asignado"}</p>
        </CardContent>
      </Card>

      {/* Motivo de la consulta */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Motivo de la Consulta</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{consulta.motivo}</p>
        </CardContent>
      </Card>

      {/* Odontodiagrama */}
      {consulta.odontodiagrama && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Odontodiagrama</CardTitle>
          </CardHeader>
          <CardContent>
            <Odontodiagrama initialData={consulta.odontodiagrama} readOnly={true} onChange={() => {}} />
          </CardContent>
        </Card>
      )}

      {/* Laboratorios */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Laboratorios</CardTitle>
        </CardHeader>
        <CardContent>
          <Laboratorios
            mode="view"
            initialData={consulta?.solicitudes}
          />
        </CardContent>
      </Card>
    </div>
  )
}
