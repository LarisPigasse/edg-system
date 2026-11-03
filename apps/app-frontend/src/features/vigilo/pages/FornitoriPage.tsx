// src/features/vigilo/pages/FornitoriPage.tsx
//
// La rubrica dei fornitori (F1): officine, enti, compagnie… che eseguono i
// controlli e si indicano nelle registrazioni. Elenco con ricerca, tipo e
// stato; il clic sulla riga apre il dettaglio con le registrazioni. Con
// vigilo.write: Nuovo fornitore, Modifica, Disattiva/Riattiva ed Elimina
// (solo se nessuna registrazione lo cita; chiede conferma). Un pannello alla
// volta: "Modifica" dal dettaglio chiude il dettaglio (L067).
import React, { useState } from 'react';
import { Alert, Button, ConfirmModal, PageHeader } from '@edg/ui';

import { DettaglioFornitore } from '../components/fornitori/DettaglioFornitore';
import { FiltriFornitori } from '../components/fornitori/FiltriFornitori';
import { PannelloFornitore } from '../components/fornitori/PannelloFornitore';
import { TabellaFornitori } from '../components/fornitori/TabellaFornitori';
import { useAzioniFornitore } from '../hooks/useAzioniFornitore';
import { useElencoFornitori } from '../hooks/useElencoFornitori';
import { useProfiloVigilo } from '../hooks/useProfiloVigilo';
import { useTipiFornitore } from '../hooks/useTipiFornitore';
import type { Fornitore } from '../types/fornitori';

/** Un pannello: che cosa mostra e se è aperto (il contenuto resta durante la chiusura) */
interface Aperto<T> {
  di: T;
  aperto: boolean;
}

const FornitoriPage: React.FC = () => {
  const { profilo } = useProfiloVigilo();
  const modificabile = !!profilo?.capacita.write;
  const e = useElencoFornitori();
  const { tipi } = useTipiFornitore();
  const a = useAzioniFornitore(e.ricarica);

  const [dettaglio, setDettaglio] = useState<Aperto<Fornitore | null>>({ di: null, aperto: false });
  const [pannello, setPannello] = useState<Aperto<Fornitore | null>>({ di: null, aperto: false });
  const [daEliminare, setDaEliminare] = useState<Fornitore | null>(null);

  const apriPannello = (f: Fornitore | null) => {
    setDettaglio(d => ({ ...d, aperto: false }));
    setPannello({ di: f, aperto: true });
  };

  return (
    <div className='space-y-6'>
      <PageHeader
        title='Fornitori'
        subtitle='Officine, enti, compagnie e studi che eseguono i controlli: si indicano nelle registrazioni.'
        onRefresh={() => void e.ricarica()}
        isLoading={e.caricamento}
        trailingActions={modificabile ? <Button onClick={() => apriPannello(null)}>Nuovo fornitore</Button> : undefined}
      />

      <FiltriFornitori e={e} tipi={tipi} />

      {e.errore && (
        <Alert variant='danger' title='Impossibile leggere i fornitori'>
          {e.errore}
        </Alert>
      )}

      <TabellaFornitori
        e={e}
        modificabile={modificabile}
        onApri={f => setDettaglio({ di: f, aperto: true })}
        onModifica={apriPannello}
        onAttiva={(f, attivo) => void a.attiva(f, attivo)}
        onElimina={setDaEliminare}
      />

      <DettaglioFornitore
        fornitore={dettaglio.di}
        aperto={dettaglio.aperto}
        modificabile={modificabile}
        onChiudi={() => setDettaglio(d => ({ ...d, aperto: false }))}
        onModifica={apriPannello}
      />

      <PannelloFornitore
        fornitore={pannello.di}
        aperto={pannello.aperto}
        inCorso={a.inCorso}
        tipi={tipi}
        onChiudi={() => setPannello(p => ({ ...p, aperto: false }))}
        onSalva={async dati => !!(await a.salva(dati, pannello.di?.uuid))}
      />

      <ConfirmModal
        isOpen={!!daEliminare}
        onClose={() => setDaEliminare(null)}
        onConfirm={async () => {
          if (daEliminare && (await a.elimina(daEliminare))) setDaEliminare(null);
        }}
        title={`Eliminare ${daEliminare?.nome ?? ''}?`}
        message='Esce dalla rubrica. Nessuna registrazione lo cita, quindi non si perde nulla; se servirà di nuovo andrà reinserito.'
        confirmText='Elimina'
        cancelText='Annulla'
        variant='danger'
        isLoading={a.inCorso}
        loadingText='Elimino…'
      />
    </div>
  );
};

export default FornitoriPage;
