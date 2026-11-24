// src/features/vigilo/components/analisi/StimeRealta.tsx
//
// Stime contro realtà (2026-11-23): quante stime hanno il costo reale, di
// quanto si sbaglia in media e in che verso, quante cadono nella tolleranza;
// con i prezzi, il margine medio dei servizi e quelli in perdita. Se si
// sbaglia sempre nello stesso verso, lo dice e suggerisce il rimedio.
import React from 'react';

import type { Analisi } from '../../types/analisi';
import { Riga, Scheda } from './Scheda';

const segno = (n: number) => (n > 0 ? '+' : '');
const pct = (n: number | null) => (n === null ? '—' : `${segno(n)}${n.toLocaleString('it-IT')}%`);

export const StimeRealta: React.FC<{ dati: Analisi }> = ({ dati: a }) => {
  const s = a.stime;
  return (
    <Scheda titolo='Stime contro realtà' sotto='Dalle stime salvate, con il costo reale e il prezzo scritti dopo.'>
      <div className='text-sm'>
        <Riga etichetta='Stime salvate' valore={s.stime} />
        <Riga etichetta='Con il costo reale' valore={s.conReale} />
        <Riga etichetta='Scostamento medio' nota='reale − stimato, sulla stima: positivo = si stima meno del reale' valore={pct(s.scostamentoMedio)} />
        <Riga etichetta='Errore medio' nota='lo scostamento senza il segno' valore={s.scostamentoAssoluto === null ? '—' : `${s.scostamentoAssoluto.toLocaleString('it-IT')}%`} />
        <Riga etichetta={`Entro ±${s.tolleranza}%`} valore={s.conReale ? `${s.entroTolleranza} su ${s.conReale}` : '—'} />
        <Riga etichetta='Con il prezzo' valore={s.conPrezzo} />
        <Riga etichetta='Margine medio dei servizi' nota='sul prezzo; sul costo reale se c’è, altrimenti sulla stima' valore={pct(s.margineMedio)} />
        <Riga etichetta='Servizi in perdita' valore={s.conPrezzo ? s.inPerdita : '—'} />
      </div>
      {s.verso === 'sotto' && (
        <p className='rounded-lg bg-bg-secondary p-3 text-sm text-text-primary'>
          Le stime sono quasi sempre <strong>più basse</strong> del reale: controlla i parametri (costo orario, velocità media, ore di impiego) o aggiungi gli extra che si dimenticano.
        </p>
      )}
      {s.verso === 'sopra' && (
        <p className='rounded-lg bg-bg-secondary p-3 text-sm text-text-primary'>
          Le stime sono quasi sempre <strong>più alte</strong> del reale: i parametri sono prudenti, si rischia di offrire prezzi troppo alti.
        </p>
      )}
    </Scheda>
  );
};
