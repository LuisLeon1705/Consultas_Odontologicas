"use client"


import { Odontodiagrama } from "@/components/odontodiagrama"
import { OdontologoSelector } from "@/components/odontologo-selector"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { actualizarConsulta } from "@/lib/actions"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function EditarConsulta() {
  const params = useParams()
  const router = useRouter()
  const [consulta, setConsulta] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [motivo, setMotivo] = useState("")
  const [odontologoId, setOdontologoId] = useState<number | null>(null)
  const [odontodiagrama, setOdontodiagrama] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchConsulta = async () => {
      try {
        // Usar una URL absoluta para evitar problemas de parseo
        const baseUrl = window.location.origin
        const response = await fetch(`${baseUrl}/api/consultas/${params.id}`)
        if (!response.ok) {
          throw new Error("No se pudo cargar la consulta")
        }
        const data = await response.json()
        setConsulta(data)
        setMotivo(data.motivo)
        setOdontologoId(data.odontologo_id)
        if (data.odontodiagrama) {
          setOdontodiagrama(data.odontodiagrama)
        }
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
  }, [])

  const handleSubmit = async () => {

    if (!odontologoId) {
      alert("Debe seleccionar un odontólogo")
      return
    }

    if (!motivo) {
      alert("Debe ingresar el motivo de la consulta")
      return
    }

    setSubmitting(true)

    try {
      await actualizarConsulta(Number(params.id), {
        odontologo_id: odontologoId,
        motivo,
        odontodiagrama,
      })

      router.push(`/consultas-odontologicas/${params.id}`)
    } catch (error) {
      console.error("Error al actualizar la consulta:", error)
      alert("Error al actualizar la consulta. Por favor, inténtelo de nuevo.")
    } finally {
      setSubmitting(false)
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
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    )
  }

  if (!consulta) {
    return (
      <div className="container mx-auto">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Aviso: </strong>
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Editar Consulta #{consulta.id}</h1>
        <Link href={`/consultas-odontologicas/${consulta.id}`}>
          <Button type="button" variant="outline">Cancelar</Button>
        </Link>
      </div>

      <form onSubmit={e => e.preventDefault()}>
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

        {/* Odontólogo */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Odontólogo Asignado</CardTitle>
          </CardHeader>
          <CardContent>
            <OdontologoSelector value={odontologoId} onChange={setOdontologoId} />
          </CardContent>
        </Card>

        {/* Motivo de la consulta */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Motivo de la Consulta</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Describa el motivo de la consulta"
              className="min-h-[100px]"
              required
            />
          </CardContent>
        </Card>

        {/* Odontodiagrama */}
        {odontodiagrama && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Odontodiagrama</CardTitle>
            </CardHeader>
            <CardContent>
              <Odontodiagrama initialData={odontodiagrama} onChange={setOdontodiagrama} />
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end gap-4">
          <Link href={`/consultas-odontologicas/${consulta.id}`}>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
          <Button disabled={submitting} type="button" onClick={() => handleSubmit()}>
            {submitting ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </div>
  )
}
