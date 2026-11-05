// src/features/vigilo/components/costoMezzi/CostoDelMezzo.tsx
//
// Nella scheda di un veicolo, una macchina o un'attrezzatura, a chi ha
// vigilo.costi: il costo stimato degli ultimi 12 mesi nei blocchi Possesso,
// Manutenzione e guasti e Rifornimenti e uso (con i litri di carburante e il
// consumo); sotto il totale, il costo per km, ora o mese e il confronto con
// gli altri mezzi della categoria (arancio se oltre la soglia). Senza costo di
// possesso lo dice: il costo è parziale.
import React from 'react';
import { Skeleton, cn } from '@edg/ui';

import { COLORE_SOPRA_MEDIA } from '../../constants/costoMezzi';
import { useCostoMezzi } from '../../hooks/useCostoMezzi';
import { confrontoTesto, costoPerUnitaTesto, guastiTesto, rifornimentiTesto } from '../../utils/costoMezzi';
import { euroBrevi, uso } from '../../utils/resoconti';
import { Riquadro } from '../Riquadro';

const Cifra: React.FC<{ etichetta: string; cifra: string; sotto?: React.ReactNode; className?: string }> = ({ etichetta, cifra, sotto, className }) => (
  <div className='min-w-0'>
    <p className='text-xs text-text-secondary'>{etichetta}</p>
    <p className={cn('text-xl font-bold tabular-nums', className ?? 'text-text-primary')}>{cifra}</p>
    {sotto && <p className='text-xs text-text-secondary'>{sotto}</p>}
  </div>
);

export const CostoDelMezzo: React.FC<{ uuid: string; chiave?: string }> = ({ uuid, chiave }) => {
  const { dati, errore, caricamento } = useCostoMezzi({ periodo: '12m', soggetto: uuid }, true, chiave);
  const c = dati?.mezzi[0];
  return (
    <Riquadro titolo='Costo negli ultimi 12 mesi' accanto='stima'>
      {errore ? (
        <p className='text-sm text-text-error'>{errore}</p>
      ) : caricamento && !dati ? (
        <Skeleton className='h-16 w-full' />
      ) : !c ? (
        <p className='text-sm text-text-secondary'>
          Nessun costo negli ultimi 12 mesi. Indica il costo di possesso da <span className='font-medium'>Azioni › Modifica</span> per avere la stima.
        </p>
      ) : (
        <div className='space-y-3'>
          <div className='grid grid-cols-2 gap-4 sm:grid-cols-3'>
            <Cifra
              etichetta='Possesso'
              cifra={euroBrevi(c.possesso.totale)}
              sotto={c.parziale ? 'manca il costo di possesso' : `${euroBrevi(c.possesso.quota)} quote · ${euroBrevi(c.possesso.obblighi)} obblighi`}
            />
            <Cifra etichetta='Manutenzione e guasti' cifra={euroBrevi(c.manutenzione.totale)} sotto={guastiTesto(c.manutenzione.guasti)} />
            <Cifra etichetta='Rifornimenti e uso' cifra={euroBrevi(c.rifornimenti.totale)} sotto={rifornimentiTesto(c)} />
          </div>
          <div className='grid grid-cols-2 gap-4 border-t border-border-thin pt-3 sm:grid-cols-3'>
            <Cifra etichetta={c.parziale ? 'Totale (parziale)' : 'Totale'} cifra={euroBrevi(c.totale)} sotto={c.uso?.valore != null ? uso(c.uso.valore, c.uso.unita) : undefined} />
            <Cifra
              etichetta={c.base === 'mese' ? 'Costo al mese' : `Costo per ${c.base === 'km' ? 'km' : 'ora'}`}
              cifra={costoPerUnitaTesto(c) ?? '—'}
              className={c.confronto.segnalato ? COLORE_SOPRA_MEDIA : undefined}
            />
          </div>
          <p className={cn('text-sm', c.confronto.segnalato ? cn('font-semibold', COLORE_SOPRA_MEDIA) : 'text-text-secondary')}>
            {confrontoTesto(c, dati!.sogliaScostamento)}
          </p>
        </div>
      )}
    </Riquadro>
  );
};
