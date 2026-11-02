import { NextResponse } from "next/server";
import { obtenerFechaMexico } from "@/services/date.service";
import type { Client } from "@/models/customer.model";
import { guardarClientes } from "@/repositories/customer.repository";

export async function GET() {
  try {
    let pagina = 1;
    const clientes: Client[] = [];

    while (true) {
      const url = new URL("https://fakeapi.dev/api/v1/users");
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

      const clientesPagina: Client[] = resultado.data.map(
        (usuario: Client) => ({
          id: usuario.id,
          name: usuario.name,
          email: usuario.email,
          phone: usuario.phone,
          dob: usuario.dob.slice(0, 10),
          created_at: obtenerFechaMexico(usuario.created_at),
        }),
      );

      clientes.push(...clientesPagina);

      if (!resultado.meta.has_more) {
        break;
      }

      pagina++;
    }

    console.log(clientes[0]);
    const respuestaBD = await guardarClientes(clientes);

    return NextResponse.json(
      {
        codigo: respuestaBD.codigo,
        mensaje: respuestaBD.mensaje,
        paginasConsultadas: pagina,
      },
      {
        status: respuestaBD.codigo,
      },
    );
  } catch (error) {
    console.error("Error al consultar FakeAPI:", error);

    return NextResponse.json(
      { Mensaje: "No se pudieron obtener los usuarios" },
      { status: 500 },
    );
  }
}
