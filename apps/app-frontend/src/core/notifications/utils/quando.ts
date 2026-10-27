// src/core/notifications/utils/quando.ts

/** Quando è nato un avviso: "oggi, 08:16", "ieri, 18:02", "24 ott, 08:16" (con l'anno se non è quest'anno) */
export function quandoNotifica(iso: string, adesso = new Date()): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const ora = d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  const giorno = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const fa = Math.round((giorno(adesso) - giorno(d)) / 86400000);
  if (fa === 0) return `oggi, ${ora}`;
  if (fa === 1) return `ieri, ${ora}`;
  const data = d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', ...(d.getFullYear() !== adesso.getFullYear() ? { year: 'numeric' } : {}) });
  return `${data}, ${ora}`;
}
