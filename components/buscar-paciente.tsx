"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { buscarPacientes } from "@/lib/actions"
import Link from "next/link"

interface BuscarPacienteProps {
  onSelect: (paciente: any) => void
}

export function BuscarPaciente({ onSelect }: BuscarPacienteProps) {
  const [query, setQuery] = useState("")
  const [resultados, setResultados] = useState<any[]>([])
  const [buscando, setBuscando] = useState(false)

  const handleSearch = async () => {
    if (!query) return

    setBuscando(true)
    try {
      const pacientes = await buscarPacientes(query)
      setResultados(pacientes)
    } catch (error) {
      console.error("Error al buscar pacientes:", error)
    } finally {
      setBuscando(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nombre, apellido o cédula..."
            className="pl-8"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <Button type="button" onClick={handleSearch} disabled={buscando} className="bg-[#007bff] hover:bg-[#0056b3]">
          {buscando ? "Buscando..." : "Buscar"}
        </Button>
      </div>

      {resultados.length > 0 ? (
        <div className="border rounded-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2 text-left">Apellido</th>
                <th className="px-4 py-2 text-left">Cédula</th>
                <th className="px-4 py-2 text-left">Acción</th>
              </tr>
            </thead>
            <tbody>
              {resultados.map((paciente) => (
                <tr key={paciente.id} className="border-t">
                  <td className="px-4 py-2">{paciente.nombre}</td>
                  <td className="px-4 py-2">{paciente.apellido}</td>
                  <td className="px-4 py-2">
                    {paciente.tipo_cedula}-{paciente.cedula}
                  </td>
                  <td className="px-4 py-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => onSelect(paciente)}>
                      Seleccionar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : query && !buscando ? (
        <div className="text-center p-4 border rounded-md">
          <p>No se encontraron pacientes con esa búsqueda.</p>
          <Link href="/pacientes/registrar">
            <Button className="mt-2 bg-[#007bff] hover:bg-[#0056b3]">Registrar Nuevo Paciente</Button>
          </Link>
        </div>
      ) : null}
    </div>
  )
}
