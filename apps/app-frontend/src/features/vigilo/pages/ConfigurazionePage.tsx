// src/features/vigilo/pages/ConfigurazionePage.tsx
//
// Configurazione di Vigilo (passo 7.8), prima versione in sola lettura:
// settori e predefiniti in breve, poi una scheda per tipo di soggetto con
// categorie e controlli. Da qui si riapre la libreria. Modifica, editor della
// cadenza e "Ricomincia da capo" arriveranno sulla stessa pagina.
// Le regole degli avvisi del tenant si cambiano nel pannello laterale (B8d-2);
// i destinatari di un controllo dal menu della sua riga (B8d-3); le regole
// degli interventi (giorni per riparare, costo orario) nel loro pannello (passo 8).
// Gli aggiornamenti della libreria hanno il loro riquadro e pannello (B10b):
// ?aggiornamenti=1 (dall'avviso o dall'email) apre il pannello,
// ?aggiornamenti=<uuid> (dal segno su una riga) il dettaglio di quella voce;
// lo Storico della libreria di un controllo si apre dal menu della sua riga.
import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Alert, Button, PageHeader, Skeleton, Tabs, type TabItem } from '@edg/ui';

import { PARAMETRO_AGGIORNAMENTI } from '../constants/aggiornamenti';
import { TIPI } from '../constants/tipiSoggetto';
import { PannelloAggiornamenti } from '../components/aggiornamenti/PannelloAggiornamenti';
import { PannelloStoricoLibreria } from '../components/aggiornamenti/PannelloStoricoLibreria';
import { RiquadroAggiornamenti } from '../components/aggiornamenti/RiquadroAggiornamenti';
import { Impostazioni } from '../components/configurazione/Impostazioni';
import { PannelloDestinatariControllo } from '../components/configurazione/PannelloDestinatariControllo';
import { PannelloInterventi } from '../components/configurazione/PannelloInterventi';
import { PannelloRegoleAvvisi } from '../components/configurazione/PannelloRegoleAvvisi';
import { SchedaTipo } from '../components/configurazione/SchedaTipo';
import { useAggiornamenti } from '../hooks/useAggiornamenti';
import { useConfigurazione } from '../hooks/useConfigurazione';
import { useInterventi } from '../hooks/useInterventi';
import { useRegoleAvvisi } from '../hooks/useRegoleAvvisi';
import type { EntitaAggiornamento } from '../types/aggiornamenti';
import type { Controllo } from '../types/configurazione';

const ConfigurazionePage: React.FC = () => {
  const navigate = useNavigate();
  const { gruppi, stato, errore, caricamento, ricarica, vuota } = useConfigurazione();
  const regole = useRegoleAvvisi();
  const [regoleAperte, setRegoleAperte] = useState(false);
  const interventi = useInterventi();
  const [interventiAperti, setInterventiAperti] = useState(false);
  // il controllo resta impostato durante la chiusura del pannello
  const [destinatari, setDestinatari] = useState<{ c: Controllo | null; aperto: boolean }>({ c: null, aperto: false });
  const aggiornamenti = useAggiornamenti(() => void ricarica());
  const [parametri, setParametri] = useSearchParams();
  const parametro = parametri.get(PARAMETRO_AGGIORNAMENTI);
  const aggiornamentiAperti = !!parametro && !!aggiornamenti.elenco;
  /** '1' = l'elenco, un uuid = quella voce, null = chiuso */
  const apriAggiornamenti = (valore: string | null) =>
    setParametri(
      p => {
        if (valore) p.set(PARAMETRO_AGGIORNAMENTI, valore);
        else p.delete(PARAMETRO_AGGIORNAMENTI);
        return p;
      },
      { replace: true }
    );
  const attesa = useMemo(
    () => ({ voci: new Map((aggiornamenti.elenco?.voci ?? []).map(v => [v.uuid, v.tipo])), onApri: (uuid: string) => apriAggiornamenti(uuid) }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- apriAggiornamenti cambia a ogni render ma fa sempre la stessa cosa
    [aggiornamenti.elenco]
  );
  // la voce (categoria o controllo) resta impostata durante la chiusura del pannello
  const [storico, setStorico] = useState<{ entita: EntitaAggiornamento; voce: { uuid: string; nome: string } | null; aperto: boolean }>({
    entita: 'controllo',
    voce: null,
    aperto: false,
  });

  const schede: TabItem[] = gruppi.map(g => ({
    id: g.tipo,
    icon: TIPI[g.tipo].icona,
    label: (
      <span className='inline-flex items-center gap-2'>
        {TIPI[g.tipo].plurale}
        <span className='rounded-full bg-bg-secondary px-2 py-0.5 text-xs font-semibold tabular-nums text-text-secondary'>
          {g.controlli.length}
        </span>
      </span>
    ),
    content: (
      <SchedaTipo
        gruppo={g}
        onDestinatari={c => setDestinatari({ c, aperto: true })}
        onStorico={(entita, voce) => setStorico({ entita, voce, aperto: true })}
        attesa={attesa.voci.size ? attesa : undefined}
      />
    ),
  }));

  return (
    <div className='space-y-6'>
      <PageHeader
        title='Configurazione'
        subtitle='Le categorie e i controlli con cui Vigilo segue le scadenze della tua azienda.'
        onRefresh={() => {
          void ricarica();
          void regole.ricarica();
          void interventi.ricarica();
          void aggiornamenti.ricarica();
        }}
        isLoading={caricamento}
        actions={<Button onClick={() => navigate('/vigilo/avvio')}>Aggiungi dalla libreria</Button>}
      />

      {errore && (
        <Alert variant='danger' title='Impossibile leggere la configurazione'>
          {errore}
        </Alert>
      )}

      {stato && (
        <Impostazioni
          stato={stato}
          regole={regole.scheda}
          onModificaRegole={() => setRegoleAperte(true)}
          interventi={interventi.scheda}
          onModificaInterventi={() => setInterventiAperti(true)}
        />
      )}

      {aggiornamenti.elenco && aggiornamenti.elenco.voci.length > 0 && (
        <RiquadroAggiornamenti elenco={aggiornamenti.elenco} onApri={() => apriAggiornamenti('1')} />
      )}

      {aggiornamenti.elenco && (
        <PannelloAggiornamenti
          elenco={aggiornamenti.elenco}
          aperto={aggiornamentiAperti}
          inCorso={aggiornamenti.inCorso}
          onChiudi={() => apriAggiornamenti(null)}
          onVisto={aggiornamenti.visto}
          onDecidi={aggiornamenti.decidi}
          voceIniziale={parametro && parametro !== '1' ? parametro : null}
        />
      )}

      <PannelloStoricoLibreria
        entita={storico.entita}
        voce={storico.voce}
        aperto={storico.aperto}
        onChiudi={() => setStorico(s => ({ ...s, aperto: false }))}
      />

      {interventi.scheda && (
        <PannelloInterventi
          scheda={interventi.scheda}
          aperto={interventiAperti}
          inCorso={interventi.inCorso}
          onChiudi={() => setInterventiAperti(false)}
          onSalva={interventi.salva}
        />
      )}

      {regole.scheda && (
        <PannelloRegoleAvvisi
          scheda={regole.scheda}
          aperto={regoleAperte}
          inCorso={regole.inCorso}
          onChiudi={() => setRegoleAperte(false)}
          onSalva={regole.salva}
          onRipristina={regole.ripristina}
        />
      )}

      <PannelloDestinatariControllo
        controllo={destinatari.c}
        aperto={destinatari.aperto}
        onChiudi={() => setDestinatari(d => ({ ...d, aperto: false }))}
        onSalvato={() => void ricarica()}
      />

      {caricamento && !gruppi.length && <Skeleton className='h-96 rounded-lg' />}

      {vuota && (
        <div className='rounded-lg border border-dashed border-border-default p-8 text-center'>
          <p className='font-medium text-text-primary'>Nessuna categoria e nessun controllo</p>
          <p className='mt-1 text-sm text-text-secondary'>Prendili dalla libreria EDG: potrai cambiarli quando vuoi.</p>
        </div>
      )}

      {schede.length > 0 && <Tabs items={schede} defaultTab={schede[0].id} />}
    </div>
  );
};

export default ConfigurazionePage;
