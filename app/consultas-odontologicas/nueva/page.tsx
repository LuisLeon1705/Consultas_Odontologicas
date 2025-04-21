"use client";


import { BuscarPaciente } from "@/components/buscar-paciente";
import { Odontodiagrama } from "@/components/odontodiagrama";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { guardarConsulta } from "@/lib/actions";
import { useState } from "react";
// Importar el componente OdontologoSelector
import { OdontologoSelector } from "@/components/odontologo-selector";

export default function NuevaConsulta() {
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<any>(null);
  // Añadir el estado para el odontólogo
  const [odontologoId, setOdontologoId] = useState<number | null>(null);
  const [odontodiagrama, setOdontodiagrama] = useState({});
  const [motivo, setMotivo] = useState("");

  // Modificar la función handleSubmit para incluir el odontólogo seleccionado
  const handleSubmit = () => {

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

    const formData = new FormData();
    formData.append("paciente_id", pacienteSeleccionado.id.toString());
    formData.append("odontologo_id", odontologoId.toString());
    formData.append("motivo", motivo);
    formData.append("odontodiagrama", JSON.stringify(odontodiagrama));

    guardarConsulta(formData);
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

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline">
            Cancelar
          </Button>
          <Button
            className="bg-[#007bff] hover:bg-[#0056b3]"
            onClick={() => handleSubmit()}
          >
            Guardar Consulta
          </Button>
        </div>
      </form>
    </div>
  );
}
