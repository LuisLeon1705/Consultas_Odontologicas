import { db } from "@/lib/db";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const consultas = await db.getConsultas();
    return NextResponse.json(consultas);
  } catch (error) {
    console.error("Error al obtener consultas:", error);
    return NextResponse.json({ error: "Error al obtener consultas" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('initializing POST request');
    const data = await request.json();
    console.log("Consulta creada:", data);
    if (!data.paciente_id || !data.odontologo_id || !data.motivo) {
      return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 });
    }

    // Save the consultation
    const nuevaConsulta = await db.crearConsulta(data);
    // Save associated laboratories if provided
    if (data.laboratorios && Array.isArray(data.laboratorios)) {
      for (const laboratorio of data.laboratorios) {
        const solicitud = {
          paciente_id: data.paciente_id,
          medico_id: data.odontologo_id,
          motivo: laboratorio.motivo,
          estado: "Pendiente",
          fecha: new Date().toISOString(),
          observacion: laboratorio.observacion,
          consulta_id: nuevaConsulta.id,
          tipo_consulta: "odontologica",
        };

        const examenes = laboratorio.examenes || [];
        await db.crearLaboratorio(solicitud, examenes);
      }
    }

    return NextResponse.json(nuevaConsulta, { status: 201 });
  } catch (error) {
    console.error("Error al crear consulta:", error);
    return NextResponse.json({ error: "Error al crear consulta" }, { status: 500 });
  }
}
