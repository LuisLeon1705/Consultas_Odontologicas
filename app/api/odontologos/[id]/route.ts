import { db } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

// GET para obtener un odontólogo específico
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params

    // Obtener el odontólogo de la base de datos
    const odontologo = await db.getOdontologoPorId(Number(id))

    if (!odontologo) {
      return NextResponse.json({ error: "Odontólogo no encontrado" }, { status: 404 })
    }

    return NextResponse.json(odontologo)
  } catch (error) {
    console.error("Error al obtener odontólogo:", error)
    return NextResponse.json({ error: "Error al obtener odontólogo" }, { status: 500 })
  }
}

// PUT para actualizar un odontólogo
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params
    const data = await request.json()

    // Validar datos
    if (!data.nombre || !data.apellido) {
      return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 })
    }

    // Actualizar el odontólogo en la base de datos
    const odontologoActualizado = await db.actualizarOdontologo(Number(id), data)

    if (!odontologoActualizado) {
      return NextResponse.json({ error: "Odontólogo no encontrado" }, { status: 404 })
    }

    return NextResponse.json(odontologoActualizado)
  } catch (error) {
    console.error("Error al actualizar odontólogo:", error)
    return NextResponse.json({ error: "Error al actualizar odontólogo" }, { status: 500 })
  }
}

// DELETE para eliminar un odontólogo
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params

    // Eliminar el odontólogo de la base de datos
    const resultado = await db.eliminarOdontologo(Number(id))

    if (!resultado) {
      return NextResponse.json({ error: "Odontólogo no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al eliminar odontólogo:", error)
    return NextResponse.json({ error: "Error al eliminar odontólogo" }, { status: 500 })
  }
}
