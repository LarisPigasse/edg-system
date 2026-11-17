// src/features/vigilo/utils/esportaRifornimenti.ts
//
// I rifornimenti di un mezzo in PDF e CSV (report, 2026-11-12): le colonne
// della scheda e chi li ha registrati. Importo e prezzo al litro solo a chi
// segue i costi. Nel CSV litri, importi e letture sono numeri.
import { csvDate, type CsvColumn, type PdfColumn } from '@edg/ui';

import type { Rifornimento } from '../types/rifornimenti';
import { giornoBreve } from './giorni';
import { euroEsatti, letturaTesto, litriTesto, prezzoLitroTesto } from './rifornimenti';

export const colonnePdfRifornimenti = (conImporto: boolean): PdfColumn<Rifornimento>[] => [
  { header: 'Data', accessor: r => giornoBreve(r.fattoIl) },
  { header: 'Voce', accessor: r => r.nomeVoce },
  { header: 'Litri', accessor: r => (r.litri != null ? litriTesto(r.litri) : '—'), align: 'right' },
  ...(conImporto
    ? [
        { header: 'Importo', accessor: (r: Rifornimento) => (r.importo != null ? euroEsatti(r.importo) : '—'), align: 'right' as const },
        { header: '€/l', accessor: (r: Rifornimento) => (r.prezzoAlLitro != null ? prezzoLitroTesto(r.prezzoAlLitro) : '—'), align: 'right' as const },
      ]
    : []),
  { header: 'Km / ore', accessor: r => (r.lettura ? letturaTesto(r.lettura) : '—'), align: 'right' },
  { header: 'Fornitore e riferimento', accessor: r => [r.fornitore?.nome, r.riferimento].filter(Boolean).join(' · ') || '—' },
  { header: 'Registrato da', accessor: r => r.registratoDa ?? '—' },
];

export const colonneCsvRifornimenti = (conImporto: boolean): CsvColumn<Rifornimento>[] => [
  { header: 'Data', accessor: r => csvDate(r.fattoIl) },
  { header: 'Voce', accessor: r => r.nomeVoce },
  { header: 'Litri', accessor: r => r.litri },
  ...(conImporto
    ? [
        { header: 'Importo (€)', accessor: (r: Rifornimento) => r.importo ?? null },
        { header: 'Prezzo al litro (€)', accessor: (r: Rifornimento) => r.prezzoAlLitro ?? null },
      ]
    : []),
  { header: 'Lettura', accessor: r => r.lettura?.valore ?? null },
  { header: 'Unità', accessor: r => (r.lettura ? (r.lettura.unita === 'km' ? 'km' : 'ore') : null) },
  { header: 'Lettura anomala', accessor: r => (r.lettura ? (r.lettura.anomala ? 'Sì' : 'No') : null) },
  { header: 'Fornitore', accessor: r => r.fornitore?.nome },
  { header: 'Riferimento', accessor: r => r.riferimento },
  { header: 'Registrato da', accessor: r => r.registratoDa },
  { header: 'Note', accessor: r => r.note },
];
