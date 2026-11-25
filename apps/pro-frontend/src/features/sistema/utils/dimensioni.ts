// src/features/sistema/utils/dimensioni.ts — spazio occupato in parole

/** "26 byte", "820 KB", "1,4 MB", "2,1 GB" */
export function dimensioneLeggibile(byte: number): string {
  if (byte < 1024) return `${byte} byte`;
  if (byte < 1024 ** 2) return `${Math.round(byte / 1024).toLocaleString('it-IT')} KB`;
  if (byte < 1024 ** 3) return `${(byte / 1024 ** 2).toLocaleString('it-IT', { maximumFractionDigits: 1 })} MB`;
  return `${(byte / 1024 ** 3).toLocaleString('it-IT', { maximumFractionDigits: 1 })} GB`;
}
