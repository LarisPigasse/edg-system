// src/features/vigilo/components/fornitori/NuovoFornitoreRapido.tsx
//
// Un fornitore nuovo al volo, dentro un modulo (F2): nome e tipo obbligatori,
// telefono facoltativo; il resto si completa poi dalla pagina Fornitori. Sta
// nella pagina, sotto il campo, mai in una finestra sopra il pannello (L067).
// È dentro il <form> della registrazione: Invio nei suoi campi aggiunge il
// fornitore e non invia la registrazione. Se il servizio rifiuta (nome già
// usato…) il messaggio resta qui e il riquadro resta aperto.
import React, { useState } from 'react';
import { Alert, Button, useToast } from '@edg/ui';

import { creaFornitore } from '../../api/fornitori';
import { useTipiFornitore } from '../../hooks/useTipiFornitore';
import type { Fornitore } from '../../types/fornitori';
import { corpoFornitore, mancanti, salvabile, valoriIniziali } from '../../utils/formFornitore';
import { CampiFornitore } from './CampiFornitore';

interface Props {
  onCreato: (f: Fornitore) => void;
  onAnnulla: () => void;
}

export const NuovoFornitoreRapido: React.FC<Props> = ({ onCreato, onAnnulla }) => {
  const toast = useToast();
  const { tipi } = useTipiFornitore();
  const [valori, setValori] = useState(() => valoriIniziali());
  const [errore, setErrore] = useState<string | null>(null);
  const [inCorso, setInCorso] = useState(false);
  const manca = mancanti(valori);

  const aggiungi = async () => {
    if (!salvabile(valori) || inCorso) return;
    setInCorso(true);
    try {
      const f = (await creaFornitore(corpoFornitore(valori))).data;
      toast?.({ title: `${f.nome}: aggiunto alla rubrica`, description: 'Gli altri dati si completano dalla pagina Fornitori.' });
      onCreato(f);
    } catch (e) {
      setErrore((e as Error).message);
    } finally {
      setInCorso(false);
    }
  };

  // Invio in un campo di testo: aggiunge il fornitore, non invia il modulo intorno
  const tastiera = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.target as HTMLElement).tagName === 'INPUT') {
      e.preventDefault();
      void aggiungi();
    }
  };

  return (
    <div className='space-y-4 rounded-lg border border-border-default bg-bg-secondary p-4' onKeyDown={tastiera} role='group' aria-label='Nuovo fornitore'>
      <div className='flex items-baseline justify-between gap-3'>
        <p className='text-sm font-semibold text-text-primary'>Nuovo fornitore</p>
        <p className='text-xs text-text-secondary'>{manca.length ? `Manca: ${manca.join(', ')}` : 'Pronto da aggiungere'}</p>
      </div>
      <CampiFornitore
        valori={valori}
        onValori={v => {
          setValori(v);
          setErrore(null);
        }}
        tipi={tipi}
        essenziali
      />
      {errore && (
        <Alert variant='danger' title='Fornitore non aggiunto'>
          {errore}
        </Alert>
      )}
      <div className='flex justify-end gap-2'>
        <Button type='button' size='sm' variant='secondary' onClick={onAnnulla} disabled={inCorso}>
          Annulla
        </Button>
        <Button type='button' size='sm' onClick={() => void aggiungi()} disabled={!salvabile(valori)} isLoading={inCorso} loadingText='Aggiungo…'>
          Aggiungi
        </Button>
      </div>
    </div>
  );
};
