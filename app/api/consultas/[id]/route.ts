import { db } from "@/lib/db";
import { type NextRequest, NextResponse } from "next/server";

// GET para obtener una consulta específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params

    // Obtener la consulta de la base de datos
    const consulta = await db.getConsultaPorId(Number(id));

    if (!consulta) {
      return NextResponse.json(
        { error: "Consulta no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(consulta);
  } catch (error) {
    console.error("Error al obtener consulta:", error);
    return NextResponse.json(
      { error: "Error al obtener consulta" },
      { status: 500 }
    );
  }
}

// PUT para actualizar una consulta
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    // Validar datos
    if (!data.odontologo_id || !data.motivo) {
      return NextResponse.json(
        { error: "Faltan datos requeridos" },
        { status: 400 }
      );
    }

    // Actualizar la consulta en la base de datos
    const consultaActualizada = await db.actualizarConsulta(Number(id), data);

    if (!consultaActualizada) {
      return NextResponse.json(
        { error: "Consulta no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(consultaActualizada);
  } catch (error) {
    console.error("Error al actualizar consulta:", error);
    return NextResponse.json(
      { error: "Error al actualizar consulta" },
      { status: 500 }
    );
  }
}

// DELETE para eliminar una consulta
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    // Eliminar la consulta de la base de datos
    const resultado = await db.eliminarConsulta(Number(id));

    if (!resultado) {
      return NextResponse.json(
        { error: "Consulta no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar consulta:", error);
    return NextResponse.json(
      { error: "Error al eliminar consulta" },
      { status: 500 }
    );
  }
}
