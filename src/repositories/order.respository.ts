import { sql } from "@/lib/db";
import type { Order } from "@/models/order.model";

export async function guardarOrdenes(ordenes: Order[]) {
  if (ordenes.length === 0) {
    return {
      codigo: 200,
      mensaje: "No hay órdenes para sincronizar",
    };
  }

  const resultado = await sql`
    CALL sp_orders_upsert(
      ${JSON.stringify(ordenes)}::jsonb,
      NULL,
      NULL
    );
  `;

  return {
    codigo: Number(resultado[0].p_codigo),
    mensaje: resultado[0].p_mensaje,
  };
}
