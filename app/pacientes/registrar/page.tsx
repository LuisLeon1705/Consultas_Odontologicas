"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { registrarPaciente, getEstados, getCiudadesPorEstado, getMunicipiosPorCiudad } from "@/lib/actions"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"

export default function RegistrarPaciente() {
  const router = useRouter()
  const [estadoSeleccionado, setEstadoSeleccionado] = useState(null)
  const [ciudadSeleccionada, setCiudadSeleccionada] = useState(null)
  const [tipoCedula, setTipoCedula] = useState("V")
  const [cedula, setCedula] = useState("")
  const [cedulaError, setCedulaError] = useState("")

  // Validar cédula
  const validarCedula = (valor: string) => {
    setCedula(valor)

    if (tipoCedula === "V") {
      if (valor.length < 5 || valor.length > 8) {
        setCedulaError("La cédula venezolana debe tener entre 5 y 8 dígitos")
      } else {
        setCedulaError("")
      }
    } else if (tipoCedula === "E") {
      if (valor.length > 20) {
        setCedulaError("La cédula extranjera no puede tener más de 20 dígitos")
      } else {
        setCedulaError("")
      }
    }
  }

  // Manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (cedulaError) {
      toast({
        title: "Error de validación",
        description: cedulaError,
        variant: "destructive",
      })
      return
    }

    const form = e.currentTarget
    const formData = new FormData(form)

    try {
      await registrarPaciente(formData)
      toast({
        title: "Paciente registrado",
        description: "El paciente ha sido registrado exitosamente",
      })
      router.push("/pacientes")
    } catch (error) {
      toast({
        title: "Error al registrar",
        description: error.message || "Ha ocurrido un error al registrar el paciente",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-sans mb-6">Registrar Nuevo Paciente</h1>

      <Card>
        <CardHeader>
          <CardTitle>Información del Paciente</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input id="nombre" name="nombre" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apellido">Apellido</Label>
                <Input id="apellido" name="apellido" required />
              </div>

              <div className="space-y-2">
                <Label>Tipo de Cédula</Label>
                <RadioGroup
                  defaultValue="V"
                  className="flex space-x-4"
                  name="tipo_cedula"
                  onValueChange={setTipoCedula}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="V" id="cedula-v" />
                    <Label htmlFor="cedula-v">Venezolano (V)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="E" id="cedula-e" />
                    <Label htmlFor="cedula-e">Extranjero (E)</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cedula">Cédula</Label>
                <Input
                  id="cedula"
                  name="cedula"
                  type="number"
                  required
                  value={cedula}
                  onChange={(e) => validarCedula(e.target.value)}
                  className={cedulaError ? "border-red-500" : ""}
                />
                {cedulaError && <p className="text-red-500 text-sm">{cedulaError}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="genero">Género</Label>
                <Select name="genero" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar género" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="femenino">Femenino</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
                <Input id="fecha_nacimiento" name="fecha_nacimiento" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input id="direccion" name="direccion" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input id="telefono" name="telefono" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.push("/pacientes")}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-[#00489b] hover:bg-[#0056b3]">
                Registrar Paciente
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
