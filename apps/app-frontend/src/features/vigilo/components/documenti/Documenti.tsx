// src/features/vigilo/components/documenti/Documenti.tsx
//
// I documenti di un soggetto (con quelli delle sue scadenze e registrazioni)
// o di una scadenza (con le sue registrazioni) (B9a): raggruppati per
// appartenenza quando i gruppi sono più di uno, Carica e "Scatta una foto",
// trascinamento dei file su tutta la sezione, eliminazione con conferma.
// Si carica sempre su ciò che la sezione mostra (il soggetto o la scadenza).
// Nel pannello della scadenza etichetta e descrizione dicono dove va il
// file, per distinguerlo dal documento della registrazione nel modulo.
import React, { useState } from 'react';
import { Alert, ConfirmModal, Skeleton, cn } from '@edg/ui';

import { useAllegati } from '../../hooks/useAllegati';
import { useTrascinaFile } from '../../hooks/useTrascinaFile';
import type { EntitaAllegato, VoceAllegato } from '../../types/allegati';
import { gruppiAllegati } from '../../utils/allegati';
import { InArrivo, PulsantiCarica } from './CaricaDocumenti';
import { RigaDocumento } from './RigaDocumento';

interface Props {
  entita: Extract<EntitaAllegato, 'soggetto' | 'scadenza'>;
  id: string;
  /** Si legge solo quando è vero (es. pannello aperto) */
  attivo?: boolean;
  puoModificare: boolean;
  /** Titolo della sezione (nel pannello della scadenza); assente nella scheda del soggetto */
  titolo?: string;
  /** Si eliminano solo i documenti caricati da chi guarda (l'addetto, B9b) */
  soloTuoi?: boolean;
  /** Sotto il titolo: che cosa ci va (es. "contratti, foto, preventivi") */
  descrizione?: string;
  /** Il pulsante (predefinito "Carica") */
  etichettaCarica?: string;
  /** La scritta mentre si trascina un file (predefinita "Rilascia per caricare") */
  testoRilascio?: string;
}

export const Documenti: React.FC<Props> = ({
  entita,
  id,
  attivo = true,
  puoModificare,
  titolo,
  soloTuoi = false,
  descrizione,
  etichettaCarica = 'Carica',
  testoRilascio = 'Rilascia per caricare',
}) => {
  const d = useAllegati(entita, id, attivo);
  const [daEliminare, setDaEliminare] = useState<VoceAllegato | null>(null);

  const propri = (d.voci ?? []).filter(v => v.di.entita === entita && v.di.uuid === id).length;
  const pieno = !!d.limiti && propri >= d.limiti.perEntita;
  const puoCaricare = puoModificare && !pieno;
  const gruppi = gruppiAllegati(d.voci ?? [], entita === 'scadenza');

  const { sopra, gestori: trascina } = useTrascinaFile(puoCaricare, files => void d.carica(files));

  const nota = d.limiti
    ? pieno
      ? `Ci sono già ${d.limiti.perEntita} documenti: per aggiungerne uno, eliminane un altro.`
      : `PDF o immagini, al massimo ${d.limiti.mb} MB l’uno${puoCaricare ? `: trascinali qui o usa ${etichettaCarica}` : ''}.`
    : null;

  return (
    <section
      {...trascina}
      className={cn(
        'relative space-y-3',
        titolo && 'rounded-lg border border-border-default bg-bg-primary px-4 py-3',
        sopra && 'ring-2 ring-action-primary ring-offset-2'
      )}
      aria-label={titolo ?? 'Documenti'}
    >
      <header className='flex flex-wrap items-center gap-x-3 gap-y-2'>
        {titolo && (
          <div className='min-w-0'>
            <h3 className='text-sm font-semibold text-text-primary'>{titolo}</h3>
            {descrizione && <p className='text-xs text-text-secondary'>{descrizione}</p>}
          </div>
        )}
        {puoCaricare && (
          <div className={cn(titolo && 'ml-auto')}>
            <PulsantiCarica onFile={files => void d.carica(files)} disabilitato={d.inArrivo.length > 0} etichetta={etichettaCarica} />
          </div>
        )}
      </header>

      <InArrivo voci={d.inArrivo} />

      {d.errore && !d.voci ? (
        <Alert variant='danger' title='Documenti non letti'>
          {d.errore}
        </Alert>
      ) : !d.voci ? (
        <Skeleton className='h-16 w-full' />
      ) : !d.voci.length ? (
        <p className='text-sm text-text-secondary'>Nessun documento.</p>
      ) : (
        <div className='space-y-4'>
          {gruppi.map(g => (
            <div key={g.chiave} className='space-y-1.5'>
              {gruppi.length > 1 && <h4 className='text-xs font-semibold uppercase tracking-wide text-text-secondary'>{g.titolo}</h4>}
              <ul className='divide-y divide-border-thin rounded-lg border border-border-default'>
                {g.voci.map(a => (
                  <RigaDocumento
                    key={a.uuid}
                    a={a}
                    onApri={() => void d.apri(a)}
                    onScarica={() => void d.scarica(a)}
                    onElimina={puoModificare && (!soloTuoi || a.tuo) ? () => setDaEliminare(a) : undefined}
                    occupato={d.eliminando === a.uuid}
                  />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {nota && <p className='text-xs text-text-secondary'>{nota}</p>}

      {sopra && (
        <div className='pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg bg-bg-primary/80 text-sm font-semibold text-action-primary'>
          {testoRilascio}
        </div>
      )}

      <ConfirmModal
        isOpen={!!daEliminare}
        onClose={() => setDaEliminare(null)}
        onConfirm={async () => {
          if (daEliminare && (await d.elimina(daEliminare))) setDaEliminare(null);
        }}
        title='Eliminare il documento?'
        message={daEliminare ? `"${daEliminare.nome}" sarà eliminato definitivamente.` : ''}
        confirmText='Elimina'
        cancelText='Annulla'
        variant='danger'
        isLoading={!!d.eliminando}
        loadingText='Elimino…'
      />
    </section>
  );
};
