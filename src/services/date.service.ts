export function obtenerFechaMexico(fechaUtc: string): string {
  const fecha = new Date(fechaUtc);

  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Etc/GMT+6",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  })
    .format(fecha)
    .replace(" ", "T");
}
