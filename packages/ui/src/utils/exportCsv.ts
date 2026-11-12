// src/utils/exportCsv.ts
//
// Esportazione CSV di un elenco, lato browser, per Excel in italiano: lo apre
// bene con un doppio clic. Stesse regole del CSV generato dai servizi
// (vigilo-service, resoconti/csv.ts):
//   - UTF-8 con BOM, punto e virgola come separatore, righe con CRLF;
//   - numeri con la virgola decimale e senza separatore delle migliaia;
//   - le celle di testo che comincerebbero con = + - @ (una formula per
//     Excel) si fanno precedere da un apostrofo;
//   - le date si scrivono gg/mm/aaaa (csvDate).
// Per elenchi che il browser ha già o legge in poche pagine; per i dettagli
// lunghi il CSV lo genera il servizio.

/** Il valore di una cella: testo, numero (scritto con la virgola) o vuoto */
export type CsvValue = string | number | null | undefined;

export interface CsvColumn<T> {
  header: string;
  accessor: (item: T) => CsvValue;
}

export interface ExportCsvOptions<T> {
  /** Nome del file, senza estensione (si aggiunge ".csv") */
  filename: string;
  columns: CsvColumn<T>[];
  data: T[];
}

const SEPARATORE = ';';
const A_CAPO = '\r\n';

/** Una cella pronta: numeri con la virgola, testo protetto dalle formule e tra virgolette se serve (pura) */
export function csvCell(valore: CsvValue): string {
  if (valore === null || valore === undefined) return '';
  if (typeof valore === 'number') return Number.isFinite(valore) ? String(valore).replace('.', ',') : '';
  let testo = valore;
  if (/^[=+\-@\t\r]/.test(testo)) testo = `'${testo}`;
  return /[";\r\n]/.test(testo) ? `"${testo.replace(/"/g, '""')}"` : testo;
}

/** Una data (giorno "aaaa-mm-gg", istante ISO o Date) come gg/mm/aaaa; vuota se manca (pura) */
export function csvDate(valore: string | Date | null | undefined): string {
  if (!valore) return '';
  const giorno = typeof valore === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(valore) ? valore : null;
  if (giorno) return `${giorno.slice(8, 10)}/${giorno.slice(5, 7)}/${giorno.slice(0, 4)}`;
  const d = valore instanceof Date ? valore : new Date(valore);
  if (Number.isNaN(d.getTime())) return '';
  const due = (n: number) => String(n).padStart(2, '0');
  return `${due(d.getDate())}/${due(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/** Il testo del CSV, con il BOM in testa (pura) */
export function csvText<T>(columns: CsvColumn<T>[], data: T[]): string {
  const righe = [columns.map(c => csvCell(c.header)), ...data.map(item => columns.map(c => csvCell(c.accessor(item))))];
  return `\uFEFF${righe.map(r => r.join(SEPARATORE)).join(A_CAPO)}${A_CAPO}`;
}

/** Genera il CSV e ne avvia il download */
export function exportTableToCsv<T>({ filename, columns, data }: ExportCsvOptions<T>): void {
  const blob = new Blob([csvText(columns, data)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1024);
}
