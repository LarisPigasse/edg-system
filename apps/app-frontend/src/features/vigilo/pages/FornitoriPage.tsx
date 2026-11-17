// src/features/vigilo/pages/FornitoriPage.tsx
//
// La rubrica dei fornitori (F1): officine, enti, compagnie… che eseguono i
// controlli e si indicano nelle registrazioni. Elenco con ricerca, tipo e
// stato; il clic sulla riga apre il dettaglio con le registrazioni. Con
// vigilo.write: Nuovo fornitore, Modifica, Disattiva/Riattiva ed Elimina
// (solo se nessuna registrazione lo cita; chiede conferma). Un pannello alla
// volta: "Modifica" dal dettaglio chiude il dettaglio (L067). Esporta
// (report, 2026-11-12): la rubrica come si vede in PDF o CSV e, con i costi,
// "Interventi e costi" per fornitore (tutti, un tipo o uno dal suo dettaglio).
import React, { useState } from 'react';
import { Alert, Button, ConfirmModal, PageHeader } from '@edg/ui';

import { leggiTuttiFornitori } from '../api/fornitori';
import { MenuEsporta } from '../components/MenuEsporta';
import { DettaglioFornitore } from '../components/fornitori/DettaglioFornitore';
import { EsportaInterventi } from '../components/fornitori/EsportaInterventi';
import { FiltriFornitori } from '../components/fornitori/FiltriFornitori';
import { PannelloFornitore } from '../components/fornitori/PannelloFornitore';
import { TabellaFornitori } from '../components/fornitori/TabellaFornitori';
import { useAzioniFornitore } from '../hooks/useAzioniFornitore';
import { useElencoFornitori } from '../hooks/useElencoFornitori';
import { useEsportazione } from '../hooks/useEsportazione';
import { useProfiloVigilo } from '../hooks/useProfiloVigilo';
import { useTipiFornitore } from '../hooks/useTipiFornitore';
import type { Fornitore } from '../types/fornitori';
import { colonneCsvFornitori, colonnePdfFornitori, filtriFornitori } from '../utils/esportaFornitori';

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
  // report (2026-11-12): la rubrica come si vede, in PDF o CSV
  const esporta = useEsportazione({
    leggi: () => leggiTuttiFornitori(e.base),
    nomeFile: 'fornitori',
    titolo: 'Fornitori',
    sottotitolo: n => filtriFornitori({ filtri: e.filtri, testo: e.base.testo, ordina: e.ordina, tipi, righe: n }),
    colonnePdf: colonnePdfFornitori,
    colonneCsv: colonneCsvFornitori,
    vuoto: 'Nessun fornitore con questi filtri.',
  });
  const a = useAzioniFornitore(e.ricarica);

  const [dettaglio, setDettaglio] = useState<Aperto<Fornitore | null>>({ di: null, aperto: false });
  const [pannello, setPannello] = useState<Aperto<Fornitore | null>>({ di: null, aperto: false });
  const [daEliminare, setDaEliminare] = useState<Fornitore | null>(null);
  /** La finestra del report Interventi e costi: tutti/un tipo (null) o un fornitore */
  const [interventi, setInterventi] = useState<Aperto<Fornitore | null>>({ di: null, aperto: false });
  const conCosti = !!profilo?.capacita.costi;

  /** Un pannello alla volta (L067): dal dettaglio si chiude il dettaglio */
  const apriInterventi = (f: Fornitore | null) => {
    setDettaglio(d => ({ ...d, aperto: false }));
    setInterventi({ di: f, aperto: true });
  };

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
        trailingActions={
          <div className='flex items-center gap-2'>
            <MenuEsporta
              onPdf={() => void esporta.esporta('pdf')}
              onCsv={() => void esporta.esporta('csv')}
              inCorso={esporta.inCorso}
              disabilitato={e.caricamento || e.totale === 0}
              voci={conCosti ? [{ id: 'interventi', label: 'Interventi e costi…', onClick: () => apriInterventi(null) }] : []}
            />
            {modificabile && <Button onClick={() => apriPannello(null)}>Nuovo fornitore</Button>}
          </div>
        }
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
        onInterventi={conCosti ? apriInterventi : undefined}
      />

      <EsportaInterventi
        aperto={interventi.aperto}
        onChiudi={() => setInterventi(x => ({ ...x, aperto: false }))}
        fornitore={interventi.di}
        tipoIniziale={e.filtri.tipo}
        tipi={tipi}
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
