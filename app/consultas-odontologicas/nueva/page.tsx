"use client";

import { BuscarPaciente } from "@/components/buscar-paciente";
import Laboratorios from "@/components/Laboratorios";
import { Odontodiagrama } from "@/components/odontodiagrama";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { guardarConsulta } from "@/lib/actions";
import { useState } from "react";
// Importar el componente OdontologoSelector
import { OdontologoSelector } from "@/components/odontologo-selector";
import Link from "next/link";

export default function NuevaConsulta() {
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<any>(null);
  // Añadir el estado para el odontólogo
  const [odontologoId, setOdontologoId] = useState<number | null>(null);
  const [odontodiagrama, setOdontodiagrama] = useState({});
  const [motivo, setMotivo] = useState("");
  const [laboratorios, setLaboratorios] = useState<any[]>([]);

  // Modificar la función handleSubmit para incluir el odontólogo seleccionado
  const handleSubmit = async () => {
    if (!pacienteSeleccionado) {
      alert("Debe seleccionar un paciente");
      return;
    }

    if (!odontologoId) {
      alert("Debe seleccionar un odontólogo");
      return;
    }

    if (!motivo) {
      alert("Debe ingresar el motivo de la consulta");
      return;
    }
    if (laboratorios.length > 0) {
      for (const lab of laboratorios) {
        if (lab.examenes.length === 0) {
          alert("Debe ingresar al menos un examen");
          return;
        }
      }
    }

    const formData = {
      paciente_id: pacienteSeleccionado.id.toString(),
      odontologo_id: odontologoId.toString(),
      motivo,
      odontodiagrama: odontodiagrama,
      laboratorios: laboratorios,
    };

    try {
      await guardarConsulta(formData);
      alert("Consulta guardada exitosamente");
      window.location.href = "/consultas-odontologicas";
    } catch (error) {
      console.log("Error al guardar la consulta:", error);
      alert(
        "Error al guardar la consulta. Por favor, inténtelo de nuevo." + error
      );
    }
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">Nueva Consulta Odontológica</h1>

      <form className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Información del Paciente</CardTitle>
          </CardHeader>
          <CardContent>
            <BuscarPaciente onSelect={setPacienteSeleccionado} />

            {pacienteSeleccionado && (
              <div className="mt-4 p-4 border rounded-md bg-gray-50">
                <h3 className="font-medium">Paciente seleccionado:</h3>
                <p>
                  Nombre: {pacienteSeleccionado.nombre}{" "}
                  {pacienteSeleccionado.apellido}
                </p>
                <p>Cédula: {pacienteSeleccionado.cedula}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Odontólogo */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Odontólogo Asignado</CardTitle>
          </CardHeader>
          <CardContent>
            <OdontologoSelector
              value={odontologoId}
              onChange={(id) => setOdontologoId(id)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Motivo de la Consulta</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Describa el motivo de la consulta"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              required
              className="min-h-[100px]"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Odontodiagrama</CardTitle>
          </CardHeader>
          <CardContent>
            <Odontodiagrama onChange={setOdontodiagrama} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Laboratorios</CardTitle>
          </CardHeader>
          <CardContent>
            <Laboratorios
              mode="new"
              onChange={setLaboratorios}
              initialData={[]}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href={`/consultas-odontologicas`}>
            <Button type="button" variant="outline" type="button">
              Cancelar
            </Button>
          </Link>
          <Button
            className="bg-[#007bff] hover:bg-[#0056b3]"
            onClick={() => handleSubmit()}
            type="button"
          >
            Guardar Consulta
          </Button>
        </div>
      </form>
    </div>
  );
}
