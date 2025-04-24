import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET para obtener todos los odontólogos
export async function GET(request: NextRequest) {
  try {
    const odontologos = await db.getOdontologos();
    return NextResponse.json(odontologos);
  } catch (error) {
    console.error("Error al obtener odontólogos:", error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Error al obtener odontólogos" }, { status: 500 });
  }
}

// POST para crear un nuevo odontólogo
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validar datos
    if (!data.nombre || !data.apellido || !data.cedula) {
      return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 })
    }

    // Crear el odontólogo en la base de datos
    const nuevoOdontologo = await db.agregarOdontologo(data)

    return NextResponse.json(nuevoOdontologo, { status: 201 })
  } catch (error) {
    console.error("Error al crear odontólogo:", error)
    return NextResponse.json({ error: "Error al crear odontólogo" }, { status: 500 })
  }
}
