// src/features/vigilo/components/soggetto/AzioniSoggetto.tsx
//
// Tutte le azioni sul soggetto in un menu "Azioni", a destra sulla riga delle
// schede (visibile qualunque scheda sia aperta):
//   Aggiungi scadenza     pannello laterale: controllo o promemoria
//   ─────────
//   Modifica              pannello laterale con il modulo
//   Sospendi / Riattiva   sospendere chiede conferma (le scadenze continuano)
//   ─────────
//   Archivia (in rosso)   conferma: le scadenze aperte si chiudono, le
//                         assegnazioni in corso terminano
//   Ripristina            conferma: riapre le scadenze chiuse
//                         dall'archiviazione, con le loro date
// Dopo Sospendi e Archivia il toast offre "Annulla" per qualche secondo
// (useSoggetto). Riattiva non chiede conferma.
import React, { useState } from 'react';
import {
  ActionMenu,
  Archive,
  ArchiveRestore,
  Button,
  ChevronDown,
  ConfirmModal,
  Pause,
  Pencil,
  Play,
  Plus,
  type Action,
  type ConfirmVariant,
} from '@edg/ui';

import { etichettaStato } from '../../constants/statiSoggetto';
import { TIPI } from '../../constants/tipiSoggetto';
import type { DatiSoggetto, Soggetto, StatoSoggetto } from '../../types/soggetti';
import type { Scadenza } from '../../types/scadenze';
import { AggiungiScadenza } from './AggiungiScadenza';
import { ModificaSoggetto } from './ModificaSoggetto';

type Conferma = 'sospendi' | 'archivia' | 'ripristina';

interface Props {
  s: Soggetto;
  inCorso: boolean;
  onStato: (stato: StatoSoggetto) => Promise<boolean>;
  onModifica: (dati: Omit<DatiSoggetto, 'tipo'>) => Promise<boolean>;
  /** Le scadenze aperte: i loro controlli non si propongono fra quelli da aggiungere */
  scadenze: Scadenza[];
  onAggiungi: React.ComponentProps<typeof AggiungiScadenza>['onAggiungi'];
}

interface TestoConferma {
  titolo: string;
  messaggio: string;
  bottone: string;
  stato: StatoSoggetto;
  variante: ConfirmVariant;
}

function testi(s: Soggetto): Record<Conferma, TestoConferma> {
  const aperte = s.scadenze?.aperte ?? 0;
  const lo = TIPI[s.tipo].femminile ? 'la' : 'lo';
  return {
    sospendi: {
      titolo: `Sospendere ${s.nome}?`,
      messaggio: `Resta in Vigilo e le sue scadenze continuano: indica solo che è momentaneamente fuori uso (ad esempio in officina o in aspettativa). Potrai riattivar${lo} quando vuoi.`,
      bottone: 'Sospendi',
      stato: 'fermo',
      variante: 'warning',
    },
    archivia: {
      titolo: `Archiviare ${s.nome}?`,
      messaggio: `Esce dalle scadenze: ${
        aperte === 1
          ? 'la scadenza aperta si chiude'
          : aperte > 1
            ? `le ${aperte} scadenze aperte si chiudono`
            : 'non ha scadenze aperte'
      } e le assegnazioni in corso terminano. Lo storico resta; ripristinando${lo} le scadenze tornano con le loro date, le assegnazioni no.`,
      bottone: 'Archivia',
      stato: 'dismesso',
      variante: 'danger',
    },
    ripristina: {
      titolo: `Ripristinare ${s.nome}?`,
      messaggio: `Torna ${etichettaStato('in-servizio', s.tipo).toLowerCase()} con le scadenze che aveva, alle loro date. Le assegnazioni terminate con l'archiviazione non tornano: se servono, vanno rifatte.`,
      bottone: 'Ripristina',
      stato: 'in-servizio',
      variante: 'success',
    },
  };
}

export const AzioniSoggetto: React.FC<Props> = ({ s, inCorso, onStato, onModifica, scadenze, onAggiungi }) => {
  const [modifica, setModifica] = useState(false);
  const [aggiungi, setAggiungi] = useState(false);
  const [conferma, setConferma] = useState<Conferma | null>(null);
  const c = conferma ? testi(s)[conferma] : null;

  const icona = (I: typeof Pencil) => <I className='h-4 w-4' />;
  const azioni: Action[] = [
    // su un soggetto archiviato non si aggiungono scadenze
    ...(s.stato !== 'dismesso'
      ? [{ id: 'aggiungi', label: 'Aggiungi scadenza', icon: icona(Plus), onClick: () => setAggiungi(true), divider: true }]
      : []),
    { id: 'modifica', label: 'Modifica', icon: icona(Pencil), onClick: () => setModifica(true), divider: s.stato === 'dismesso' },
    ...(s.stato === 'in-servizio'
      ? [{ id: 'sospendi', label: 'Sospendi', icon: icona(Pause), onClick: () => setConferma('sospendi'), divider: true }]
      : s.stato === 'fermo'
        ? [{ id: 'riattiva', label: 'Riattiva', icon: icona(Play), onClick: () => void onStato('in-servizio'), divider: true }]
        : []),
    s.stato === 'dismesso'
      ? { id: 'ripristina', label: 'Ripristina', icon: icona(ArchiveRestore), onClick: () => setConferma('ripristina') }
      : { id: 'archivia', label: 'Archivia', icon: icona(Archive), variant: 'danger' as const, onClick: () => setConferma('archivia') },
  ];

  return (
    <>
      <ActionMenu
        actions={azioni}
        align='end'
        trigger={
          <Button size='sm' variant='secondary' disabled={inCorso} rightIcon={<ChevronDown className='h-4 w-4' />}>
            Azioni
          </Button>
        }
      />
      <ConfirmModal
        isOpen={!!c}
        onClose={() => setConferma(null)}
        onConfirm={async () => {
          if (c && (await onStato(c.stato))) setConferma(null);
        }}
        title={c?.titolo ?? ''}
        message={c?.messaggio ?? ''}
        confirmText={c?.bottone}
        cancelText='Annulla'
        variant={c?.variante}
        isLoading={inCorso}
        loadingText='Un momento…'
      />
      <ModificaSoggetto s={s} aperto={modifica} inCorso={inCorso} onChiudi={() => setModifica(false)} onSalva={onModifica} />
      <AggiungiScadenza
        s={s}
        aperte={scadenze}
        aperto={aggiungi}
        modoIniziale='controllo'
        inCorso={inCorso}
        onChiudi={() => setAggiungi(false)}
        onAggiungi={onAggiungi}
      />
    </>
  );
};
