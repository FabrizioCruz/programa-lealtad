const TIPOS_CAMBIO: Record<string, number> = {
  USD: 18.5,
  EUR: 20.0,
  GBP: 23.5,
  CAD: 13.5,
  AUD: 12.0,
};

export function monedaPermitida(moneda: string): boolean {
  return TIPOS_CAMBIO[moneda] !== undefined;
}

export function convertirAMXN(importe: number, moneda: string): number {
  const tipoCambio = TIPOS_CAMBIO[moneda];

  return Math.round(importe * tipoCambio * 100) / 100;
}
