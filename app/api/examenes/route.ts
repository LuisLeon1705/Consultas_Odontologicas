// app/api/examenes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const solicitudId = searchParams.get("solicitudId");

    const examenes = await db.getExamenes(solicitudId);
    return NextResponse.json(examenes);
  } catch (error) {
    console.error("Error fetching exams:", error);
    return NextResponse.json({ error: "Error fetching exams" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { solicitud_id, tipo_prueba_id, fecha } = await req.json();
    const result = await db.crearExamen({ solicitud_id, tipo_prueba_id, fecha });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Error creating examen" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { examen_id, tipo_prueba_id, fecha } = await req.json();
    await db.actualizarExamen({ examen_id, tipo_prueba_id, fecha });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Error updating examen" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { examen_id } = await req.json();
    await db.eliminarExamen(examen_id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Error deleting examen" }, { status: 500 });
  }
}