import { NextResponse } from "next/server";
import type { Order } from "@/models/order.model";
import { guardarOrdenes } from "@/repositories/order.respository";
import { obtenerFechaMexico } from "@/services/date.service";

const FECHA_CORTE = "2026-04-30";

export async function GET() {
  try {
    let pagina = 1;
    const ordenes: Order[] = [];

    while (true) {
      const url = new URL("https://fakeapi.dev/api/v1/orders");
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

      const ordenesPagina: Order[] = resultado.data
        .map(
          (orden: {
            id: number;
            status: string;
            payment_status: string;
            total: string;
            user: { id: number };
            created_at: string;
          }) => ({
            id: orden.id,
            status: orden.status,
            payment_status: orden.payment_status,
            total: Number(orden.total),
            user_id: orden.user.id,
            created_at: obtenerFechaMexico(orden.created_at),
          }),
        )
        .filter((orden: Order) => {
          const fechaLocal = orden.created_at.slice(0, 10);
          return fechaLocal <= FECHA_CORTE;
        });

      ordenes.push(...ordenesPagina);

      if (!resultado.meta.has_more) {
        break;
      }

      pagina++;
    }

    const resultadoGuardado = await guardarOrdenes(ordenes);

    return NextResponse.json(
      {
        mensaje: resultadoGuardado.mensaje,
        codigo: resultadoGuardado.codigo,
        paginasConsultadas: pagina,
      },
      {
        status: resultadoGuardado.codigo,
      },
    );

    //return NextResponse.json(resultado);
  } catch (error) {
    console.error("Error al consultar FakeAPI:", error);

    return NextResponse.json(
      { mensaje: "No se pudieron obtener los pedidos" },
      { status: 500 },
    );
  }
}
