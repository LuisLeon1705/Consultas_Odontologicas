"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getConsultas } from "@/lib/actions"
import { Plus, Search } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function ConsultasOdontologicas() {
  const [consultas, setConsultas] = useState([])
  const [busqueda, setBusqueda] = useState("")
  const [cargando, setCargando] = useState(true)

  // Cargar consultas al montar el componente
  useEffect(() => {
    const fetchConsultas = async () => {
      try {
        const data = await getConsultas()
        setConsultas(data)
        setCargando(false)
      } catch (error) {
        console.error("Error al cargar consultas:", error)
        setCargando(false)
      }
    }

    fetchConsultas()
  }, [])

  // Filtrar consultas según la búsqueda
  const consultasFiltradas = consultas.filter(
    (consulta) =>
      consulta.paciente.toLowerCase().includes(busqueda.toLowerCase()) ||
      consulta.motivo.toLowerCase().includes(busqueda.toLowerCase()) ||
      consulta.fecha.includes(busqueda),
  )

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Historial de Consultas Odontológicas</h1>
        <Link href="/consultas-odontologicas/nueva">
          <Button className="bg-[#007bff] hover:bg-[#0056b3]">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Consulta
          </Button>
        </Link>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Buscar Consultas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por paciente, motivo o fecha..."
                className="pl-8"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Consultas Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          {cargando ? (
            <p className="text-center py-4">Cargando consultas...</p>
          ) : consultasFiltradas.length === 0 ? (
            <p className="text-center py-4">No se encontraron consultas</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Odontólogo</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {consultasFiltradas.map((consulta: any) => (
                  <TableRow key={consulta.id}>
                    <TableCell>{consulta.id}</TableCell>
                    <TableCell>{consulta.paciente}</TableCell>
                    <TableCell>{consulta.fecha.toLocaleDateString()}</TableCell>
                    <TableCell>{consulta.motivo}</TableCell>
                    <TableCell>{consulta.odontologo}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Link href={`/consultas-odontologicas/${consulta.id}`}>
                          <Button variant="outline" size="sm">
                            Ver
                          </Button>
                        </Link>
                        <Link href={`/consultas-odontologicas/${consulta.id}/editar`}>
                          <Button variant="outline" size="sm">
                            Editar
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
