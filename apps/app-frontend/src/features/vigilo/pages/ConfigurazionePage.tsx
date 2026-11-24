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
// Esporta (report, 2026-11-12): il Piano dei controlli e "Controlli non
// seguiti", in corso o con lo storico.
// Con vigilo.config, Disattiva / Riattiva di controlli e categorie dal menu
// della riga (2026-11-19); "Mostra disattivati" sulla riga delle schede.
// Modifica, Duplica e Nuovo controllo nel suo pannello (passi 2-3, PannelloControllo);
// Modifica e Nuova categoria nel loro (passo 4, PannelloCategoria). Elimina
// (passo 5): definitivo per le voci senza storico, altrimenti porta a Disattiva.
import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Alert, Button, ConfirmModal, PageHeader, Skeleton, Switch, Tabs, type TabItem } from '@edg/ui';

import { PARAMETRO_AGGIORNAMENTI } from '../constants/aggiornamenti';
import { TIPI } from '../constants/tipiSoggetto';
import { PannelloAggiornamenti } from '../components/aggiornamenti/PannelloAggiornamenti';
import { PannelloStoricoLibreria } from '../components/aggiornamenti/PannelloStoricoLibreria';
import { RiquadroAggiornamenti } from '../components/aggiornamenti/RiquadroAggiornamenti';
import { Impostazioni } from '../components/configurazione/Impostazioni';
import { PannelloCategoria } from '../components/configurazione/PannelloCategoria';
import { PannelloControllo } from '../components/configurazione/PannelloControllo';
import { PannelloDestinatariControllo } from '../components/configurazione/PannelloDestinatariControllo';
import { PannelloInterventi } from '../components/configurazione/PannelloInterventi';
import { PannelloRegoleAvvisi } from '../components/configurazione/PannelloRegoleAvvisi';
import { SchedaTipo } from '../components/configurazione/SchedaTipo';
import { MenuEsporta } from '../components/MenuEsporta';
import { useAggiornamenti } from '../hooks/useAggiornamenti';
import { useAttivazione, type VoceDaAttivare } from '../hooks/useAttivazione';
import { useEliminazione } from '../hooks/useEliminazione';
import type { SchedaCategoria } from '../hooks/useModificaCategoria';
import { tipoDellaScheda, type SchedaControllo } from '../hooks/useModificaControllo';
import { useConfigurazione } from '../hooks/useConfigurazione';
import { useEsportaConfigurazione } from '../hooks/useEsportaConfigurazione';
import { useInterventi } from '../hooks/useInterventi';
import { useProfiloVigilo } from '../hooks/useProfiloVigilo';
import { useRegoleAvvisi } from '../hooks/useRegoleAvvisi';
import type { EntitaAggiornamento } from '../types/aggiornamenti';
import type { Controllo } from '../types/configurazione';

/** Perché "Elimina" diventa "Disattiva": la voce ha uno storico */
function perchéNonSiElimina(v: VoceDaAttivare): string {
  return v.entita === 'controllo'
    ? 'Ha uno storico di scadenze, quindi non si elimina: si può disattivare. '
    : 'Ha dei soggetti (anche archiviati) o dei controlli che valgono solo per lei, quindi non si elimina: si può disattivare. ';
}

/** Che cosa succede disattivando, detto prima di farlo */
function messaggioDisattiva(v: VoceDaAttivare | null): string {
  if (!v) return '';
  if (v.entita === 'controllo') {
    const n = v.voce.scadenzeAperte ?? 0;
    const chiuse = !n ? 'Non ha scadenze aperte.' : n === 1 ? 'Si chiude la sua scadenza aperta.' : `Si chiudono le sue ${n} scadenze aperte.`;
    return `${chiuse} Riattivandolo si riaprono con le loro date; le scadenze già registrate restano nello storico.`;
  }
  const n = v.voce.soggetti ?? 0;
  const restano = !n ? '' : n === 1 ? ' Il soggetto che c’è resta com’è, con i suoi controlli.' : ` I ${n} soggetti che ci sono restano come sono, con i loro controlli.`;
  return `Non si potrà più scegliere per i soggetti nuovi.${restano} Si può riattivare quando vuoi.`;
}

const ConfigurazionePage: React.FC = () => {
  const navigate = useNavigate();
  const { gruppi, stato, errore, caricamento, ricarica, vuota } = useConfigurazione();
  const regole = useRegoleAvvisi();
  const esporta = useEsportaConfigurazione();
  const [regoleAperte, setRegoleAperte] = useState(false);
  const interventi = useInterventi();
  const [interventiAperti, setInterventiAperti] = useState(false);
  // il controllo resta impostato durante la chiusura del pannello
  const [destinatari, setDestinatari] = useState<{ c: Controllo | null; aperto: boolean }>({ c: null, aperto: false });
  const aggiornamenti = useAggiornamenti(() => void ricarica());
  const { profilo } = useProfiloVigilo();
  const puoConfigurare = !!profilo?.capacita.config;
  const attivazione = useAttivazione(() => void ricarica());
  const eliminazione = useEliminazione(() => void ricarica());
  /** Disattiva chiesto da "Elimina" su una voce con uno storico: la conferma spiega perché */
  const [perStorico, setPerStorico] = useState(false);
  const elimina = (v: VoceDaAttivare) => {
    if (v.voce.eliminabile) eliminazione.chiedi(v);
    else {
      setPerStorico(true);
      attivazione.chiedi(v);
    }
  };
  const [mostraDisattivati, setMostraDisattivati] = useState(false);
  // modifica, nuovo o duplica: la scheda resta impostata durante la chiusura del pannello
  const [pannello, setPannello] = useState<{ scheda: SchedaControllo | null; aperto: boolean }>({ scheda: null, aperto: false });
  const apriPannello = (scheda: SchedaControllo) => setPannello({ scheda, aperto: true });
  const [pannelloCategoria, setPannelloCategoria] = useState<{ scheda: SchedaCategoria | null; aperto: boolean }>({ scheda: null, aperto: false });
  const disattivati = gruppi.reduce((n, g) => n + g.categorie.filter(c => !c.attiva).length + g.controlli.filter(c => !c.attivo).length, 0);
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
        onAttiva={puoConfigurare ? attivazione.chiedi : undefined}
        onModifica={puoConfigurare ? controllo => apriPannello({ modo: 'modifica', controllo }) : undefined}
        onDuplica={puoConfigurare ? controllo => apriPannello({ modo: 'duplica', controllo }) : undefined}
        onNuovo={puoConfigurare ? () => apriPannello({ modo: 'nuovo', tipo: g.tipo, predefiniti: stato?.predefiniti ?? null }) : undefined}
        onModificaCategoria={puoConfigurare ? categoria => setPannelloCategoria({ scheda: { modo: 'modifica', categoria }, aperto: true }) : undefined}
        onNuovaCategoria={puoConfigurare ? () => setPannelloCategoria({ scheda: { modo: 'nuova', tipo: g.tipo }, aperto: true }) : undefined}
        onElimina={puoConfigurare ? elimina : undefined}
        mostraDisattivati={mostraDisattivati}
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
        trailingActions={
          <div className='flex items-center gap-2'>
            <MenuEsporta
              inCorso={esporta.inCorso}
              disabilitato={vuota}
              voci={[
                ...(stato
                  ? [{ id: 'piano', label: 'Piano dei controlli', onClick: () => esporta.piano({ gruppi, stato, regole: regole.scheda?.regole ?? null }) }]
                  : []),
                { id: 'non-seguiti', label: 'Controlli non seguiti', onClick: () => void esporta.nonSeguiti('in-corso') },
                { id: 'non-seguiti-storico', label: 'Controlli non seguiti, con lo storico', onClick: () => void esporta.nonSeguiti('tutte') },
              ]}
            />
            <Button onClick={() => navigate('/vigilo/avvio')}>Aggiungi dalla libreria</Button>
          </div>
        }
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

      <ConfirmModal
        isOpen={!!eliminazione.daConfermare}
        onClose={eliminazione.annulla}
        onConfirm={() => void eliminazione.conferma()}
        title={eliminazione.daConfermare ? `Eliminare ${eliminazione.daConfermare.entita === 'controllo' ? 'il controllo' : 'la categoria'} "${eliminazione.daConfermare.voce.nome}"?` : ''}
        message='Non ha uno storico, quindi si elimina per sempre: non si potrà riattivare.'
        confirmText='Elimina'
        variant='danger'
        isLoading={eliminazione.inCorso}
      />

      <PannelloControllo
        scheda={pannello.scheda}
        categorie={pannello.scheda ? (gruppi.find(g => g.tipo === tipoDellaScheda(pannello.scheda!))?.categorie ?? []) : []}
        aperto={pannello.aperto}
        onChiudi={() => setPannello(x => ({ ...x, aperto: false }))}
        onSalvato={() => void ricarica()}
      />

      <PannelloCategoria
        scheda={pannelloCategoria.scheda}
        aperto={pannelloCategoria.aperto}
        onChiudi={() => setPannelloCategoria(x => ({ ...x, aperto: false }))}
        onSalvato={() => void ricarica()}
      />

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

      {schede.length > 0 && (
        <Tabs
          items={schede}
          defaultTab={schede[0].id}
          actions={
            disattivati > 0 ? (
              <Switch size='sm' label={`Mostra disattivati (${disattivati})`} checked={mostraDisattivati} onCheckedChange={setMostraDisattivati} />
            ) : undefined
          }
        />
      )}

      <ConfirmModal
        isOpen={!!attivazione.daConfermare}
        onClose={() => {
          attivazione.annulla();
          setPerStorico(false);
        }}
        onConfirm={() => void attivazione.conferma().then(() => setPerStorico(false))}
        title={attivazione.daConfermare ? `Disattivare ${attivazione.daConfermare.entita === 'controllo' ? 'il controllo' : 'la categoria'} "${attivazione.daConfermare.voce.nome}"?` : ''}
        message={`${perStorico && attivazione.daConfermare ? perchéNonSiElimina(attivazione.daConfermare) : ''}${messaggioDisattiva(attivazione.daConfermare)}`}
        confirmText='Disattiva'
        variant='danger'
        isLoading={attivazione.inCorso}
      />
    </div>
  );
};

export default ConfigurazionePage;
