// src/features/vigilo/components/scadenza/CampoDocumento.tsx
//
// Il documento nei moduli Registra e Segnala fatto (B9a, B9c): i file si
// caricano sulla scadenza e passano alla registrazione all'invio
// (useDocumentiRegistra). Alla conferma di una segnalazione, quelli che
// l'addetto ha già allegato contano (`gia`).
// Si chiama "Documento della registrazione" e accetta i file trascinati, per
// distinguerlo dai documenti della scadenza più sotto, che si salvano subito
// (revisione 2026-11-11).
import React from 'react';
import { FileText, ImageIcon, X, cn } from '@edg/ui';

import type { useDocumentiRegistra } from '../../hooks/useDocumentiRegistra';
import { useTrascinaFile } from '../../hooks/useTrascinaFile';
import { dimensioneLeggibile, eImmagine } from '../../utils/allegati';
import { InArrivo, PulsantiCarica } from '../documenti/CaricaDocumenti';

interface Props {
  doc: ReturnType<typeof useDocumentiRegistra>;
  obbligatorio: boolean;
  /** Mostra il perché se manca (es. solo con esito positivo) */
  avvisaSeManca: boolean;
  disabilitato: boolean;
  /** Documenti già allegati alla segnalazione che si conferma */
  gia?: number;
}

export const CampoDocumento: React.FC<Props> = ({ doc, obbligatorio, avvisaSeManca, disabilitato, gia = 0 }) => {
  const bloccato = doc.inArrivo.length > 0 || disabilitato;
  const { sopra, gestori } = useTrascinaFile(!bloccato, files => void doc.carica(files));
  return (
    <div {...gestori} className={cn('relative space-y-2 rounded-lg', sopra && 'ring-2 ring-action-primary ring-offset-2')}>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <div className='min-w-0'>
          <p className='text-sm font-medium text-text-primary'>
            Documento della registrazione
            {obbligatorio ? <span className='text-text-danger'> *</span> : <span className='font-normal text-text-secondary'> (facoltativo)</span>}
          </p>
          <p className='text-xs text-text-secondary'>Es. la ricevuta o il certificato: si salva con Conferma.</p>
        </div>
        <PulsantiCarica onFile={files => void doc.carica(files)} disabilitato={bloccato} etichetta='Allega alla registrazione' />
      </div>
      {gia > 0 && (
        <p className='text-xs text-text-secondary'>
          {gia === 1 ? 'Un documento è già allegato alla segnalazione' : `${gia} documenti sono già allegati alla segnalazione`}: li trovi in Documenti della scadenza, qui sotto.
        </p>
      )}
      <InArrivo voci={doc.inArrivo} />
      {doc.caricati.length > 0 && (
        <ul className='divide-y divide-border-thin rounded-lg border border-border-default'>
          {doc.caricati.map(a => {
            const Icona = eImmagine(a.tipo) ? ImageIcon : FileText;
            return (
              <li key={a.uuid} className='flex items-center gap-3 px-3 py-2 text-sm'>
                <Icona className='h-4 w-4 shrink-0 text-text-secondary' aria-hidden />
                <span className='min-w-0 flex-1 truncate text-text-primary'>{a.nome}</span>
                <span className='shrink-0 text-xs text-text-secondary'>{dimensioneLeggibile(a.dimensione)}</span>
                <button
                  type='button'
                  onClick={() => void doc.togli(a)}
                  aria-label={`Togli ${a.nome}`}
                  title='Togli'
                  className='rounded-md p-1 text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary'
                >
                  <X className='h-4 w-4' />
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {avvisaSeManca && obbligatorio && !gia && !doc.caricati.length && !doc.inArrivo.length && (
        <p className='text-xs text-text-secondary'>Questo controllo chiede un documento: il certificato, la ricevuta o una foto.</p>
      )}
      {sopra && (
        <div className='pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg bg-bg-primary/80 text-sm font-semibold text-action-primary'>
          Rilascia per allegare alla registrazione
        </div>
      )}
    </div>
  );
};
