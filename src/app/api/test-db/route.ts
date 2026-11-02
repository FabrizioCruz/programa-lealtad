import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const result = await sql`SELECT NOW() AS fecha`;

    return NextResponse.json({
      mensaje: "Conexión exitosa con PostgreSQL",
      fecha: result[0].fecha,
    });
  } catch (error) {
    console.error("Error de conexión", error);

    return NextResponse.json(
      {
        mensaje: "Error al conectar con PostgreSQL",
      },
      { status: 500 },
    );
  }
}
