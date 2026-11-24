// src/features/vigilo/components/costoMezzi/CostoDelMezzo.tsx
//
// Nella scheda di un veicolo, una macchina o un'attrezzatura, a chi ha
// vigilo.costi: il costo stimato degli ultimi 12 mesi nei blocchi Possesso,
// Manutenzione e guasti e Rifornimenti e uso (con i litri di carburante e il
// consumo); sotto il totale, il costo per km, ora o mese e il confronto con
// gli altri mezzi della categoria (arancio se oltre la soglia). Senza costo di
// possesso lo dice: il costo è parziale.
// Le tre spese in colonna a sinistra, sopra il totale; a destra il costo
// mensile di possesso (era un riquadro della scheda, 2026-11-16) e, sotto,
// il costo per unità (con le sue due componenti: in movimento e per ora di
// impiego, 2026-11-18): entrambi nel colore del modulo. Etichette in ciano,
// note grigie una voce per riga ("quote" e "obblighi", litri e consumo).
// A destra del titolo il pulsante "Andamento dei costi" apre il grafico nel
// tempo dei tre blocchi (AndamentoCosti, 2026-11-16).
import React, { useState } from 'react';
import { Button, ChartLine, Skeleton, Tooltip, cn } from '@edg/ui';

import { COLORE_CIFRA_CHIAVE, COLORE_ETICHETTA_COSTO, COLORE_SOPRA_MEDIA, MODO_IN_PAROLE } from '../../constants/costoMezzi';
import { useCostoMezzi } from '../../hooks/useCostoMezzi';
import type { Soggetto } from '../../types/soggetti';
import { componentiRighe, confrontoTesto, costoPerUnitaTesto, guastiTesto, rifornimentiRighe } from '../../utils/costoMezzi';
import { euroBrevi, uso } from '../../utils/resoconti';
import { Riquadro } from '../Riquadro';
import { AndamentoCosti } from './AndamentoCosti';

/** Una cifra con l'etichetta in ciano e, sotto, le note grigie: una per riga */
const Cifra: React.FC<{ etichetta: string; cifra: string; sotto?: string | string[]; className?: string }> = ({ etichetta, cifra, sotto, className }) => (
  <div className='min-w-0'>
    <p className={cn('text-xs font-medium', COLORE_ETICHETTA_COSTO)}>{etichetta}</p>
    <p className={cn('text-xl font-bold tabular-nums', className ?? 'text-text-primary')}>{cifra}</p>
    {(Array.isArray(sotto) ? sotto : sotto ? [sotto] : []).map(riga => (
      <p key={riga} className='text-xs text-text-secondary'>
        {riga}
      </p>
    ))}
  </div>
);

interface Props {
  uuid: string;
  /** Per il titolo della finestra dell'andamento */
  nome: string;
  chiave?: string;
  /** Il costo di possesso del mezzo (null: non indicato); undefined: non si mostra */
  possesso?: Soggetto['possesso'];
}

export const CostoDelMezzo: React.FC<Props> = ({ uuid, nome, chiave, possesso }) => {
  const [andamento, setAndamento] = useState(false);
  const { dati, errore, caricamento } = useCostoMezzi({ periodo: '12m', soggetto: uuid }, true, chiave);
  const c = dati?.mezzi[0];
  return (
    <Riquadro
      titolo='Costo negli ultimi 12 mesi'
      accanto='stima'
      azioni={
        <Tooltip content='Andamento dei costi nel tempo'>
          <Button variant='outline' size='sm' onClick={() => setAndamento(true)} aria-label='Andamento dei costi'>
            <ChartLine className='h-4 w-4' aria-hidden='true' />
          </Button>
        </Tooltip>
      }
    >
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
          <div className='grid grid-cols-2 gap-4'>
            {/* le tre spese in colonna: si sommano nel totale qui sotto */}
            <div className='space-y-3'>
              <Cifra
                etichetta='Possesso'
                cifra={euroBrevi(c.possesso.totale)}
                sotto={c.parziale ? 'manca il costo di possesso' : [`${euroBrevi(c.possesso.quota)} quote`, `${euroBrevi(c.possesso.obblighi)} obblighi`]}
              />
              <Cifra etichetta='Manutenzione e guasti' cifra={euroBrevi(c.manutenzione.totale)} sotto={guastiTesto(c.manutenzione.guasti)} />
              <Cifra etichetta='Rifornimenti e uso' cifra={euroBrevi(c.rifornimenti.totale)} sotto={rifornimentiRighe(c)} />
            </div>
            {possesso !== undefined && (
              <Cifra
                etichetta='Costo mensile di possesso'
                cifra={possesso ? `${euroBrevi(possesso.mensile)} al mese` : 'non indicato'}
                sotto={possesso ? MODO_IN_PAROLE[possesso.modo] : 'si indica da Azioni › Modifica'}
                className={possesso ? COLORE_CIFRA_CHIAVE : 'text-text-secondary'}
              />
            )}
          </div>
          <div className='grid grid-cols-2 gap-4 border-t border-border-thin pt-3'>
            <Cifra etichetta={c.parziale ? 'Totale (parziale)' : 'Totale'} cifra={euroBrevi(c.totale)} sotto={c.uso?.valore != null ? uso(c.uso.valore, c.uso.unita) : undefined} />
            <Cifra
              etichetta={c.base === 'mese' ? 'Costo al mese' : `Costo per ${c.base === 'km' ? 'km' : 'ora'}`}
              cifra={costoPerUnitaTesto(c) ?? '—'}
              className={c.confronto.segnalato ? COLORE_SOPRA_MEDIA : COLORE_CIFRA_CHIAVE}
              sotto={componentiRighe(c)}
            />
          </div>
          <p className={cn('text-sm', c.confronto.segnalato ? cn('font-semibold', COLORE_SOPRA_MEDIA) : 'text-text-secondary')}>
            {confrontoTesto(c, dati!.sogliaScostamento)}
          </p>
        </div>
      )}
      <AndamentoCosti aperto={andamento} onChiudi={() => setAndamento(false)} mezzo={{ uuid, nome }} />
    </Riquadro>
  );
};
