// src/features/vigilo/components/analisi/CostoPieno.tsx
//
// Il costo pieno voce per voce (2026-11-23): una barra con il peso di mezzo,
// conducente e costi aziendali su un'ora di servizio, le cifre per ora e per
// km, e da dove viene ogni voce. Serve a vedere dove si può intervenire.
import React from 'react';

import { COLORI_COSTO_PIENO, NOMI_COSTO_PIENO } from '../../constants/analisi';
import type { Analisi } from '../../types/analisi';
import { costoUnita, euroCentesimi } from '../../utils/resoconti';
import { Riga, Scheda } from './Scheda';

type Voce = keyof typeof COLORI_COSTO_PIENO;
const VOCI: Voce[] = ['mezzo', 'conducente', 'aziendali'];

export const CostoPieno: React.FC<{ dati: Analisi }> = ({ dati: a }) => {
  const o = a.costoPieno.perOra;
  const quota = (v: Voce) => (o.totale > 0 ? Math.round((o[v] / o.totale) * 100) : 0);
  const fonte: Record<Voce, string> = {
    mezzo:
      a.flotta.fissoOra === null
        ? 'manca: nessun veicolo con il costo di possesso'
        : `media pesata di ${a.flotta.conPossesso} ${a.flotta.conPossesso === 1 ? 'veicolo' : 'veicoli'} con il costo di possesso, ultimi 12 mesi`,
    conducente:
      a.conducente.fonte === 'parametro'
        ? 'costo orario medio dei parametri'
        : a.conducente.fonte === 'persone'
          ? `media di ${a.conducente.persone} ${a.conducente.persone === 1 ? 'persona' : 'persone'}`
          : 'manca: nessun costo orario',
    aziendali: a.anno?.costoPerOra != null ? `${a.anno.anno}, ${a.anno.stato}${a.anno.quotaMezzi < 100 ? `, ${a.anno.quotaMezzi}% ai mezzi` : ''}` : 'manca: nessun anno con le ore di servizio',
  };

  return (
    <Scheda titolo='Costo pieno, voce per voce' sotto='Quanto costa un’ora e un km di servizio, e dove pesa di più.'>
      {/* il peso delle tre voci su un'ora di servizio */}
      {o.totale > 0 && (
        <div className='flex h-3 overflow-hidden rounded-full' role='img' aria-label={VOCI.map(v => `${NOMI_COSTO_PIENO[v]} ${quota(v)}%`).join(', ')}>
          {VOCI.map(v => (o[v] > 0 ? <span key={v} style={{ width: `${quota(v)}%`, background: COLORI_COSTO_PIENO[v] }} /> : null))}
        </div>
      )}
      <div className='text-sm'>
        {VOCI.map(v => (
          <Riga
            key={v}
            etichetta={
              <span className='flex items-center gap-2'>
                <span className='h-2.5 w-2.5 shrink-0 rounded-full' style={{ background: COLORI_COSTO_PIENO[v] }} />
                {NOMI_COSTO_PIENO[v]}
              </span>
            }
            nota={fonte[v]}
            valore={
              <>
                {euroCentesimi(o[v])}/h <span className='text-xs text-text-secondary'>({quota(v)}%)</span>
              </>
            }
          />
        ))}
        <Riga etichetta='Un’ora di servizio' valore={`${euroCentesimi(o.totale)}/h`} forte />
      </div>
      <div className='text-sm'>
        <Riga
          etichetta='Mezzo in movimento'
          nota={a.flotta.variabileKm === null ? 'manca: nessun km dai contatori' : `carburante e uso, media pesata sui km di ${a.flotta.veicoli} veicoli`}
          valore={costoUnita(a.costoPieno.perKm.movimento, 'km')}
        />
        <Riga etichetta='Voci orarie' nota={`l’ora di servizio ÷ ${a.velocitaMedia} km/h`} valore={costoUnita(a.costoPieno.perKm.orarie, 'km')} />
        <Riga etichetta='Un km di servizio' valore={costoUnita(a.costoPieno.perKm.totale, 'km')} forte />
      </div>
      {/* lo stesso costo pieno dentro ogni categoria: il prezzo minimo di un camion non lo abbassano le auto */}
      {a.categorie.length > 1 && (
        <div className='space-y-1'>
          <h3 className='text-xs font-semibold uppercase tracking-wide text-text-secondary'>Per categoria di veicoli</h3>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b border-border-default text-xs text-text-secondary'>
                <th className='py-1 pr-3 text-left font-medium'>Categoria</th>
                <th className='py-1 pr-3 text-right font-medium'>Veicoli</th>
                <th className='py-1 pr-3 text-right font-medium'>Per ora</th>
                <th className='py-1 text-right font-medium'>Per km</th>
              </tr>
            </thead>
            <tbody>
              {a.categorie.map(c => (
                <tr key={c.categoria ?? '—'} className='border-b border-border-thin last:border-b-0'>
                  <td className='py-1 pr-3 text-text-primary'>
                    {c.categoria ?? 'Senza categoria'}
                    {c.conPossesso < c.veicoli && (
                      <span className='block text-xs text-text-secondary'>{c.conPossesso === 0 ? 'nessuno con il costo di possesso' : `${c.conPossesso} su ${c.veicoli} con il costo di possesso`}</span>
                    )}
                  </td>
                  <td className='py-1 pr-3 text-right tabular-nums'>{c.veicoli}</td>
                  <td className='py-1 pr-3 text-right font-semibold tabular-nums text-action-primary'>{euroCentesimi(c.perOra)}/h</td>
                  <td className='py-1 text-right tabular-nums'>{costoUnita(c.perKm, 'km')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Scheda>
  );
};
