// src/features/vigilo/components/analisi/ContoAnno.tsx
//
// Il conto dell'anno (2026-11-23): ricavi meno costi aziendali, costo dei
// mezzi e conducenti (stimati: ore di servizio × costo orario), il margine.
// Senza ricavi dice che cosa manca e dove inserirli.
import React from 'react';

import type { Analisi } from '../../types/analisi';
import { euroTondi } from '../../utils/resoconti';
import { Riga, Scheda } from './Scheda';

export const ContoAnno: React.FC<{ dati: Analisi }> = ({ dati: a }) => {
  const m = a.margine;
  const titolo = a.anno ? `Il conto del ${a.anno.anno}` : 'Il conto dell’anno';
  if (!m)
    return (
      <Scheda titolo={titolo}>
        <p className='text-sm text-text-secondary'>
          {a.anno
            ? `Senza i ricavi del ${a.anno.anno} non si calcolano margine e redditività. Inseriscili in Stima costi › Parametri, nell'anno: sono facoltativi.`
            : 'Servono i costi aziendali di un anno, con i suoi ricavi: Stima costi › Parametri.'}
        </p>
      </Scheda>
    );
  return (
    <Scheda titolo={titolo} sotto={`${a.anno?.stato === 'preventivo' ? 'A preventivo' : 'A consuntivo'}; i mezzi negli ultimi 12 mesi.`}>
      <div className='text-sm'>
        <Riga etichetta='Ricavi' valore={euroTondi(m.ricavi)} forte />
        <Riga etichetta='− Costi aziendali' valore={euroTondi(m.costi.aziendali)} />
        <Riga etichetta='− Mezzi' nota='possesso, manutenzione e uso' valore={euroTondi(m.costi.mezzi)} />
        <Riga etichetta='− Conducenti' nota='stima: ore di servizio × costo orario' valore={euroTondi(m.costi.conducenti)} />
        <Riga
          etichetta='Margine'
          valore={
            <>
              {euroTondi(m.euro)}
              {m.percentuale !== null && <span className='text-xs font-normal text-text-secondary'> ({m.percentuale.toLocaleString('it-IT')}%)</span>}
            </>
          }
          forte
        />
      </div>
    </Scheda>
  );
};
