import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const tipoPruebas = await db.getTipoPruebas();
    return NextResponse.json(tipoPruebas);
  } catch (err) {
    console.error("Error fetching test types:", err);
    return NextResponse.json({ error: "Error fetching test types" }, { status: 500 });
  }
}
