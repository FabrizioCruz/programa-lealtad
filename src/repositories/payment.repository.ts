import { sql } from "@/lib/db";
import type { Payment } from "@/models/payment.model";

export async function guardarPagos(pagos: Payment[]) {
  const resultado = await sql`
    CALL sp_payments_upsert(
      ${JSON.stringify(pagos)}::jsonb,
      NULL,
      NULL
    );
  `;

  return {
    codigo: Number(resultado[0].p_codigo),
    mensaje: resultado[0].p_mensaje,
  };
}
