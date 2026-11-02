import { NextResponse } from "next/server";
import { guardarPagos } from "@/repositories/payment.repository";
import { obtenerFechaMexico } from "@/services/date.service";
import { convertirAMXN, monedaPermitida } from "@/services/currency.service";
import type { Payment } from "@/models/payment.model";

const FECHA_CORTE = "2026-04-30";

export async function GET() {
  try {
    let pagina = 1;
    const pagos: Payment[] = [];

    while (true) {
      const url = new URL("https://fakeapi.dev/api/v1/payments");
      const apiKey = process.env.FAKEAPI_KEY;

      url.searchParams.set("page", pagina.toString());
      url.searchParams.set("per_page", "100");

      if (apiKey) {
        url.searchParams.set("api_key", apiKey);
      }

      const response = await fetch(url, {
        method: "GET",
        cache: "no-store",
      });

      const resultado = await response.json();

      if (!response.ok) {
        return NextResponse.json(
          { mensaje: resultado.message ?? "Error en FakeAPI" },
          { status: response.status },
        );
      }

      const pagosPagina: Payment[] = resultado.data
        .filter((pago: { currency: string }) => monedaPermitida(pago.currency))

        .map(
          (pago: {
            id: number;
            amount: number;
            currency: string;
            status: string;
            paid_at: string | null;
            created_at: string;
            metadata: { order_id: number };
            user: { id: number };
          }) => ({
            id: pago.id,
            order_id: pago.metadata.order_id,
            user_id: pago.user.id,
            amount: Number(pago.amount),
            currency: pago.currency,
            amount_mxn: convertirAMXN(Number(pago.amount), pago.currency),
            status: pago.status,
            paid_at: pago.paid_at ? obtenerFechaMexico(pago.paid_at) : null,
            created_at: obtenerFechaMexico(pago.created_at),
          }),
        )

        // Descarta pagos posteriores a la fecha de corte.
        .filter((pago: Payment) => {
          const fecha = (pago.paid_at ?? pago.created_at).slice(0, 10);
          return fecha <= FECHA_CORTE;
        });

      pagos.push(...pagosPagina);

      if (!resultado.meta.has_more) {
        break;
      }

      pagina++;
    }

    const resultadoGuardado = await guardarPagos(pagos);

    return NextResponse.json(
      {
        mensaje: resultadoGuardado.mensaje,
        codigo: resultadoGuardado.codigo,
        pagosRecibidos: pagos.length,
      },
      {
        status: resultadoGuardado.codigo,
      },
    );
  } catch (error) {
    console.error("Error al consultar FakeAPI:", error);

    return NextResponse.json(
      { mensaje: "No se pudieron obtener los pagos" },
      { status: 500 },
    );
  }
}
