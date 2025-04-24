"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { Plus, Search } from "lucide-react"
import { getPacientes, buscarPacientes } from "@/lib/actions"

export default function Pacientes() {
  const [pacientes, setPacientes] = useState([])
  const [busqueda, setBusqueda] = useState("")
  const [cargando, setCargando] = useState(true)

  // Cargar pacientes al montar el componente
  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        const data = await getPacientes()
        setPacientes(data)
        setCargando(false)
      } catch (error) {
        console.error("Error al cargar pacientes:", error)
        setCargando(false)
      }
    }

    fetchPacientes()
  }, [])

  // Manejar la búsqueda
  const handleBuscar = async () => {
    if (!busqueda.trim()) {
      // Si la búsqueda está vacía, cargar todos los pacientes
      const data = await getPacientes()
      setPacientes(data)
      return
    }

    try {
      const resultados = await buscarPacientes(busqueda)
      setPacientes(resultados)
    } catch (error) {
      console.error("Error al buscar pacientes:", error)
    }
  }

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-sans">Gestión de Pacientes</h1>
        <Link href="/pacientes/registrar">
          <Button className="bg-[#00489b] hover:bg-[#0056b3]">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Paciente
          </Button>
        </Link>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Buscar Pacientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por nombre, apellido o cédula..."
                className="pl-8"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleBuscar()}
              />
            </div>
            <Button className="bg-[#00489b] hover:bg-[#0056b3]" onClick={handleBuscar}>
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Pacientes</CardTitle>
        </CardHeader>
        <CardContent>
          {cargando ? (
            <p className="text-center py-4">Cargando pacientes...</p>
          ) : pacientes.length === 0 ? (
            <p className="text-center py-4">No se encontraron pacientes</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Apellido</TableHead>
                  <TableHead>Cédula</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pacientes.map((paciente: any) => (
                  <TableRow key={paciente.id}>
                    <TableCell>{paciente.id}</TableCell>
                    <TableCell>{paciente.nombre}</TableCell>
                    <TableCell>{paciente.apellido}</TableCell>
                    <TableCell>
                      {paciente.tipo_cedula}-{paciente.cedula}
                    </TableCell>
                    <TableCell>{paciente.telefono}</TableCell>
                    <TableCell>{paciente.email}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Link href={`/pacientes/${paciente.id}`}>
                          <Button variant="outline" size="sm">
                            Ver
                          </Button>
                        </Link>
                        <Link href={`/pacientes/${paciente.id}/editar`}>
                          <Button variant="outline" size="sm">
                            Editar
                          </Button>
                        </Link>
                        <Link href={`/consultas-odontologicas/nueva?paciente=${paciente.id}`}>
                          <Button variant="outline" size="sm">
                            Nueva Consulta
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
