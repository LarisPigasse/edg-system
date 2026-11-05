// src/features/vigilo/components/spese/PerNatura.tsx
//
// La spesa per natura (le riparazioni in rosso). Se ci sono rifornimenti, sotto
// il dettaglio voce per voce (carburante e AdBlue con i litri): le spese d'uso
// si distinguono quando serve.
import React from 'react';

import { NOMI_VOCI, VOCI_CON_LITRI } from '../../constants/rifornimenti';
import { NATURE_RESOCONTO } from '../../constants/resoconti';
import type { Spese } from '../../types/resoconti';
import { litri } from '../../utils/resoconti';
import { Riquadro } from '../Riquadro';
import { BarreSpesa } from './BarreSpesa';

const quante = (n: number, uno: string, tanti: string) => `${n} ${n === 1 ? uno : tanti}`;

export const PerNatura: React.FC<{ dati: Spese }> = ({ dati }) => (
  <Riquadro titolo='Per natura'>
    <BarreSpesa
      vuoto='Nessuna spesa nel periodo.'
      voci={dati.perNatura.map(n => ({
        chiave: n.natura,
        nome: NATURE_RESOCONTO[n.natura],
        accanto: n.natura === 'uso' ? quante(n.n, 'spesa', 'spese') : quante(n.n, 'intervento', 'interventi'),
        valore: n.spesa,
        colore: n.natura === 'riparazione' ? 'bg-red-500' : undefined,
      }))}
    />
    {dati.perVoce.length > 0 && (
      <div className='mt-5 border-t border-border-thin pt-4'>
        <h3 className='mb-3 text-sm font-semibold text-text-primary'>Rifornimenti e uso, voce per voce</h3>
        <BarreSpesa
          vuoto=''
          voci={dati.perVoce.map(v => ({
            chiave: v.voce,
            nome: NOMI_VOCI[v.voce],
            accanto: [quante(v.n, 'spesa', 'spese'), VOCI_CON_LITRI.includes(v.voce) && v.litri > 0 ? litri(v.litri) : null].filter(Boolean).join(' · '),
            valore: v.spesa,
            colore: 'bg-action-primary/60',
          }))}
        />
      </div>
    )}
  </Riquadro>
);
