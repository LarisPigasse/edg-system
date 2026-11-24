// src/features/vigilo/components/stima/NuovaStima.tsx
//
// La scheda "Nuova stima" (2026-11-17, fase 2): il modulo del servizio a
// sinistra e, a destra, il risultato che si aggiorna mentre si scrive (sotto
// i 1280 px il risultato sta sopra e il modulo, su tre colonne, è largo), con PDF e Salva (fase 3). Lo stato vive nella
// pagina (useStima): la stima resta cambiando scheda.
import React from 'react';
import { Alert, Button, Skeleton, exportReportToPdf, useToast } from '@edg/ui';

import type { StatoStima } from '../../hooks/useStima';
import { oggiLocale } from '../../utils/giorni';
import { stimaPdf } from '../../utils/pdfStima';
import { Riquadro } from '../Riquadro';
import { ModuloServizio } from './ModuloServizio';
import { RisultatoStima } from './RisultatoStima';

export const NuovaStima: React.FC<{ s: StatoStima }> = ({ s }) => {
  const toast = useToast();

  if (!s.parametri)
    return s.errore ? (
      <Alert variant='danger' title='Stima non disponibile'>
        {s.errore}
      </Alert>
    ) : (
      <Skeleton className='h-96 w-full' />
    );

  const pdf = () => {
    if (!s.calcolo) return;
    try {
      exportReportToPdf(stimaPdf(s.calcolo, s.modulo.descrizione.trim(), oggiLocale()));
    } catch (e) {
      toast?.danger({ title: 'PDF non creato', description: (e as Error).message });
    }
  };

  return (
    // affiancati dai 1280 px: il modulo ha tre colonne e gli serve spazio; sotto, il risultato sopra e il modulo largo
    <div className='grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_28rem]'>
      <Riquadro
        titolo='Il servizio'
        azioni={
          <Button variant='outline' size='sm' onClick={s.azzera}>
            Ricomincia
          </Button>
        }
      >
        <ModuloServizio modulo={s.modulo} cambia={s.cambia} errori={s.errori} mezzi={s.mezzi} persone={s.persone} parametri={s.parametri} proposte={s.proposte} />
      </Riquadro>
      {/* sugli schermi stretti il risultato va sopra il modulo: il totale si vede subito */}
      <div className='order-first xl:sticky xl:top-4 xl:order-none'>
        <RisultatoStima calcolo={s.calcolo} inCorso={s.inCorso} errore={s.errore} onPdf={pdf} onSalva={() => void s.salva()} salvando={s.salvando} />
      </div>
    </div>
  );
};
