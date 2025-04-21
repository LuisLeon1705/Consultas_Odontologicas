import { NextResponse } from "next/server"
import { db } from "@/lib/db";

export async function GET() {
  try {
    const status = await db.testConnection()

    return NextResponse.json(status)
  } catch (error) {
    console.error("Error al verificar el estado de la base de datos:", error)

    return NextResponse.json(
      {
        connected: false,
        error: error instanceof Error ? error.message : "Error desconocido",
        usingMemoryData: true,
      },
      { status: 500 },
    )
  }
}
