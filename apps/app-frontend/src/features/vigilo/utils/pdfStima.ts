// src/features/vigilo/utils/pdfStima.ts
//
// La stima dei costi di un servizio in PDF (2026-11-17, fase 2) e le righe
// della sua scomposizione, uguali a video e nel PDF: mezzo, conducente,
// pedaggi, extra, costi aziendali, con il dettaglio di come si calcola
// ciascuna. In fondo i valori usati e da dove vengono. Regole pure.
import type { ExportReportOptions } from '@edg/ui';

import type { CalcoloStima, Fonte } from '../types/stima';
import { giornoCon } from './giorni';
import { costoUnita, euroCentesimi } from './resoconti';
import { nomeFileDi } from './testo';

const numero = (n: number) => n.toLocaleString('it-IT', { maximumFractionDigits: 1 });
const conteggio = (n: number, uno: string, molti: string) => `${numero(n)} ${n === 1 ? uno : molti}`;

export interface RigaStima {
  chiave: 'mezzo' | 'conducente' | 'pedaggi' | 'extra' | 'aziendali';
  voce: string;
  dettaglio: string;
  importo: number;
}

/** Le righe della scomposizione (pura) */
export function righeStima(c: CalcoloStima, nomeConducente = 'Conducente'): RigaStima[] {
  const r = c.risultato;
  const v = r.voci;
  const aKm = r.kmTotali !== null;
  const mezzo = c.usati.mezzo?.nome;
  return [
    {
      chiave: 'mezzo',
      voce: mezzo ? `Mezzo · ${mezzo}` : 'Mezzo',
      dettaglio: `${aKm ? `${numero(v.mezzo.quantita)} km` : conteggio(v.mezzo.quantita, 'ora', 'ore')} × ${v.mezzo.unitario === null ? '—' : costoUnita(v.mezzo.unitario, aKm ? 'km' : 'ore')}`,
      importo: v.mezzo.totale,
    },
    {
      chiave: 'conducente',
      voce: c.usati.persona ? `${nomeConducente} · ${c.usati.persona.nome}` : nomeConducente,
      dettaglio: [
        `${conteggio(v.conducente.ore, 'ora', 'ore')} × ${v.conducente.costoOrario === null ? '—' : `${euroCentesimi(v.conducente.costoOrario)}/h`}`,
        v.conducente.pernottamenti ? `${conteggio(v.conducente.pernottamenti, 'pernottamento', 'pernottamenti')} × ${v.conducente.diaria === null ? '—' : euroCentesimi(v.conducente.diaria)}` : null,
      ]
        .filter(Boolean)
        .join(' + '),
      importo: v.conducente.totale,
    },
    { chiave: 'pedaggi', voce: 'Pedaggi', dettaglio: v.pedaggi.stimati ? `stimati a ${euroCentesimi(c.usati.parametri.pedaggioKm ?? 0)}/km` : v.pedaggi.totale ? 'noti' : '—', importo: v.pedaggi.totale },
    { chiave: 'extra', voce: 'Extra', dettaglio: v.extra.voci.map(e => e.descrizione || 'voce').join(', ') || '—', importo: v.extra.totale },
    {
      chiave: 'aziendali',
      voce: 'Costi aziendali',
      dettaglio: `${conteggio(v.aziendali.ore, 'ora', 'ore')} × ${v.aziendali.perOra === null ? '—' : `${euroCentesimi(v.aziendali.perOra)}/h`}${c.usati.anno ? ` (${c.usati.anno.anno}, ${c.usati.anno.stato})` : ''}`,
      importo: v.aziendali.totale,
    },
  ];
}

/** "1.024 km · 16 h di guida · 2 giorni · 18 h di servizio" (pura) */
export function sintesiStima(c: CalcoloStima): string {
  const r = c.risultato;
  return [
    r.kmTotali !== null && `${numero(r.kmTotali)} km`,
    r.oreGuida !== null && `${numero(r.oreGuida)} h di guida`,
    conteggio(r.giorni, 'giorno', 'giorni'),
    `${numero(r.oreServizio)} h di servizio`,
  ]
    .filter(Boolean)
    .join(' · ');
}

const FONTI: Record<Fonte, string> = { manuale: 'scritto a mano', mezzo: 'dal mezzo (ultimi 12 mesi)', persona: 'dalla persona', media: 'costo medio dei parametri', mancante: 'non noto' };

/** Le opzioni del PDF (pura) */
export function stimaPdf(c: CalcoloStima, descrizione: string, oggi: string): ExportReportOptions {
  const r = c.risultato;
  const aKm = r.kmTotali !== null;
  const p = c.usati.parametri;
  return {
    filename: `stima-costi-${nomeFileDi(descrizione || (aKm ? 'trasporto' : 'lavoro'))}-${oggi}`,
    title: `Stima dei costi${descrizione ? ` · ${descrizione}` : ''}`,
    subtitle: `${aKm ? 'Trasporto a km' : 'Lavoro a ore'} · ${sintesiStima(c)} · stima ${giornoCon('a', oggi)}`,
    summary: [
      { label: 'Totale stimato', value: euroCentesimi(r.totale) },
      ...(r.perKm !== null ? [{ label: 'Per km', value: euroCentesimi(r.perKm) }] : []),
      ...(r.perOra !== null ? [{ label: 'Per ora di servizio', value: euroCentesimi(r.perOra) }] : []),
    ],
    sections: [
      {
        title: 'Scomposizione',
        head: ['Voce', 'Come si calcola', 'Importo'],
        body: righeStima(c, aKm ? 'Conducente' : 'Operatore').map(x => [x.voce, x.dettaglio, euroCentesimi(x.importo)]),
        foot: ['Totale', '', euroCentesimi(r.totale)],
        rightAligned: [2],
      },
      {
        title: 'Valori usati',
        head: ['Valore', 'Quanto', 'Da dove'],
        body: [
          ['Costo del mezzo', c.usati.costoMezzo === null ? '—' : costoUnita(c.usati.costoMezzo, aKm ? 'km' : 'ore'), FONTI[c.usati.fonteMezzo]],
          ['Costo orario', c.usati.costoOrario === null ? '—' : `${euroCentesimi(c.usati.costoOrario)}/h`, FONTI[c.usati.fonteCostoOrario]],
          ...(aKm
            ? [
                ['Velocità media', `${numero(p.velocitaMedia)} km/h`, 'parametri'],
                ['Ore di guida al giorno', `${numero(p.oreGuidaGiorno)} h`, 'parametri'],
              ]
            : []),
          ['Diaria per pernottamento', p.diaria === null ? '—' : euroCentesimi(p.diaria), 'parametri'],
          ['Costo aziendale per ora', p.costoAziendalePerOra === null ? '—' : `${euroCentesimi(p.costoAziendalePerOra)}/h`, c.usati.anno ? `costi ${c.usati.anno.anno} (${c.usati.anno.stato})` : 'nessun anno'],
        ],
      },
    ],
    footnote: `Stima approssimata, non un preventivo.${r.avvisi.length ? ` Attenzione: ${r.avvisi.join('; ')}.` : ''}`,
  };
}
