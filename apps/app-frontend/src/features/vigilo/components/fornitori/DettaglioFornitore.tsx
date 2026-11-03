// src/features/vigilo/components/fornitori/DettaglioFornitore.tsx
//
// Il dettaglio di un fornitore nel pannello laterale (F1): tipo e contatti
// (telefono ed email cliccabili), referente, indirizzo, note e le
// registrazioni che lo citano. Con vigilo.write "Modifica" in fondo.
import React from 'react';
import { Badge, Button, Sheet } from '@edg/ui';

import type { Fornitore } from '../../types/fornitori';
import { RegistrazioniFornitore } from './RegistrazioniFornitore';

interface Props {
  fornitore: Fornitore | null;
  aperto: boolean;
  modificabile: boolean;
  onChiudi: () => void;
  onModifica: (f: Fornitore) => void;
}

const Voce: React.FC<{ etichetta: string; children: React.ReactNode }> = ({ etichetta, children }) => (
  <div className='min-w-0'>
    <dt className='text-xs text-text-secondary'>{etichetta}</dt>
    <dd className='break-words text-sm text-text-primary'>{children}</dd>
  </div>
);

export const DettaglioFornitore: React.FC<Props> = ({ fornitore: f, aperto, modificabile, onChiudi, onModifica }) => (
  <Sheet
    isOpen={aperto}
    onOpenChange={o => !o && onChiudi()}
    title={f?.nome ?? 'Fornitore'}
    description={f ? [f.tipo?.nome, !f.attivo && 'disattivato'].filter(Boolean).join(' · ') : undefined}
    className='w-full! sm:max-w-2xl!'
    footer={
      <>
        <Button variant='secondary' onClick={onChiudi}>
          Chiudi
        </Button>
        {modificabile && f && <Button onClick={() => onModifica(f)}>Modifica</Button>}
      </>
    }
  >
    {f && (
      <div className='space-y-6'>
        <dl className='grid gap-4 sm:grid-cols-2'>
          <Voce etichetta='Tipo'>
            {f.tipo?.nome ?? '—'}
            {f.tipo && !f.tipo.attivo && (
              <Badge variant='default' className='ml-2'>
                tipo disattivato
              </Badge>
            )}
          </Voce>
          <Voce etichetta='Referente'>{f.referente ?? '—'}</Voce>
          <Voce etichetta='Telefono'>
            {f.telefono ? (
              <a href={`tel:${f.telefono.replace(/\s+/g, '')}`} className='text-text-link hover:underline'>
                {f.telefono}
              </a>
            ) : (
              '—'
            )}
          </Voce>
          <Voce etichetta='Email'>
            {f.email ? (
              <a href={`mailto:${f.email}`} className='text-text-link hover:underline'>
                {f.email}
              </a>
            ) : (
              '—'
            )}
          </Voce>
          <div className='sm:col-span-2'>
            <Voce etichetta='Indirizzo'>{f.indirizzo ?? '—'}</Voce>
          </div>
          {f.note && (
            <div className='sm:col-span-2'>
              <Voce etichetta='Note'>
                <span className='whitespace-pre-line'>{f.note}</span>
              </Voce>
            </div>
          )}
        </dl>
        <section className='space-y-3'>
          <h3 className='text-sm font-semibold text-text-primary'>
            Registrazioni{f.registrazioni ? ` (${f.registrazioni})` : ''}
          </h3>
          <RegistrazioniFornitore fornitore={f.uuid} />
        </section>
      </div>
    )}
  </Sheet>
);
