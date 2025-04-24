import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const consultaId = searchParams.get("consultaId");
  const tipo = searchParams.get("tipo");

  try {
    const solicitudes = await db.getLaboratorios(consultaId, tipo);
    const examenes = await db.getExamenes();

    const map = new Map();
    solicitudes.forEach((s: any) => {
      map.set(s.solicitud_id, { ...s, examenes: [] });
    });
    examenes.forEach((e: any) => {
      map.get(e.solicitud_id)?.examenes.push(e);
    });

    return NextResponse.json(Array.from(map.values()));
  } catch (error) {
    console.error("Error al obtener laboratorios:", error);
    return NextResponse.json({ error: "Error al obtener laboratorios" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { solicitud, examenes } = await req.json();

    if (!solicitud || !examenes) {
      return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 });
    }

    const nuevaSolicitud = await db.crearLaboratorio(solicitud, examenes);
    return NextResponse.json(nuevaSolicitud, { status: 201 });
  } catch (error) {
    console.error("Error al crear solicitud:", error);
    return NextResponse.json({ error: "Error al crear solicitud" }, { status: 500 });
  }
}
