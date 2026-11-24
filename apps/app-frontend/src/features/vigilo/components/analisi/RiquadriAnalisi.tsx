// src/features/vigilo/components/analisi/RiquadriAnalisi.tsx
//
// I quattro numeri chiave dell'Analisi (2026-11-23), come i riquadri di Spese:
// costo pieno per ora e per km (il prezzo minimo di pareggio), affidabilità
// delle stime, margine dell'anno. Dove manca un dato il riquadro dice quale.
import React from 'react';
import { cn } from '@edg/ui';

import { COLORE_SCENDE } from '../../constants/resoconti';
import { COLORE_SOPRA_MEDIA } from '../../constants/costoMezzi';
import type { Analisi } from '../../types/analisi';
import { costoUnita, euroCentesimi, euroTondi } from '../../utils/resoconti';

interface Voce {
  etichetta: string;
  cifra: string;
  sotto: React.ReactNode;
  colore?: string;
}

const segno = (n: number) => (n > 0 ? '+' : '');
const pct = (n: number) => `${segno(n)}${n.toLocaleString('it-IT')}%`;

function voci(a: Analisi): Voce[] {
  const p = a.costoPieno;
  const parziale = p.mancanti.length ? ` · senza ${p.mancanti.map(m => (m === 'aziendali' ? 'costi aziendali' : m)).join(' e ')}` : '';
  const s = a.stime;
  return [
    { etichetta: 'Costo pieno per ora', cifra: `${euroCentesimi(p.perOra.totale)}/h`, sotto: `prezzo minimo di pareggio${parziale}`, colore: 'text-action-primary' },
    { etichetta: 'Costo pieno per km', cifra: costoUnita(p.perKm.totale, 'km'), sotto: `a ${a.velocitaMedia} km/h di media${parziale}`, colore: 'text-action-primary' },
    {
      etichetta: 'Affidabilità delle stime',
      cifra: s.scostamentoMedio === null ? '—' : pct(s.scostamentoMedio),
      sotto:
        s.scostamentoMedio === null
          ? 'servono stime con il costo reale'
          : `${s.entroTolleranza} su ${s.conReale} entro ±${s.tolleranza}%${s.verso === 'sotto' ? ' · stime di solito basse' : s.verso === 'sopra' ? ' · stime di solito alte' : ''}`,
      colore: s.scostamentoAssoluto !== null && s.scostamentoAssoluto > s.tolleranza ? COLORE_SOPRA_MEDIA : undefined,
    },
    a.margine
      ? {
          etichetta: `Margine del ${a.anno?.anno}`,
          cifra: euroTondi(a.margine.euro),
          sotto: `${a.margine.percentuale === null ? '—' : pct(a.margine.percentuale)} dei ricavi · stima`,
          colore: a.margine.euro < 0 ? COLORE_SOPRA_MEDIA : COLORE_SCENDE,
        }
      : { etichetta: 'Margine dell’anno', cifra: '—', sotto: a.anno ? `servono i ricavi del ${a.anno.anno}` : 'servono costi e ricavi di un anno' },
  ];
}

export const RiquadriAnalisi: React.FC<{ dati: Analisi }> = ({ dati }) => (
  <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
    {voci(dati).map(v => (
      <div key={v.etichetta} className='flex min-w-0 flex-col gap-1.5 rounded-lg border border-border-thin bg-bg-primary p-5'>
        <span className='text-base font-bold text-text-primary'>{v.etichetta}</span>
        <span className={cn('text-[40px] font-bold leading-tight tracking-tight tabular-nums', v.colore ?? 'text-text-primary')}>{v.cifra}</span>
        <span className='text-sm text-text-secondary'>{v.sotto}</span>
      </div>
    ))}
  </div>
);
