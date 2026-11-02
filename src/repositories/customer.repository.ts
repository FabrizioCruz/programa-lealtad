import { sql } from "@/lib/db";
import type { ResponseDb } from "@/models/response.model";
import type { Client } from "@/models/customer.model";

export async function guardarClientes(clientes: Client[]): Promise<ResponseDb> {
  const resultado = await sql`
        CALL sp_customers_upsert(
            ${JSON.stringify(clientes)}::jsonb,
            NULL,
            NULL
        );
    `;

  return {
    codigo: Number(resultado[0].p_codigo),
    mensaje: resultado[0].p_mensaje,
  };
}
