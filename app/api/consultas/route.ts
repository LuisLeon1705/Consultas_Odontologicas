import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET para obtener todas las consultas
export async function GET(request: NextRequest) {
  try {
    const consultas = await db.getConsultas()
    return NextResponse.json(consultas)
  } catch (error) {
    console.error("Error al obtener consultas:", error)
    return NextResponse.json({ error: "Error al obtener consultas" }, { status: 500 })
  }
}

// POST para crear una nueva consulta
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validar datos
    if (!data.paciente_id || !data.odontologo_id || !data.motivo) {
      return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 })
    }

    // Crear la consulta en la base de datos
    const nuevaConsulta = await db.agregarConsulta(data)

    return NextResponse.json(nuevaConsulta, { status: 201 })
  } catch (error) {
    console.error("Error al crear consulta:", error)
    return NextResponse.json({ error: "Error al crear consulta" }, { status: 500 })
  }
}
