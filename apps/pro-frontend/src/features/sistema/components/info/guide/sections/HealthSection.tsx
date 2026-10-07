// Guida → Salute dei servizi: cosa si controlla, ogni quanto, cosa significano gli stati
import React from 'react';
import { GROUP_LABEL, GROUP_ORDER } from '../../../../utils/healthFormat';
import { List, Live, Note, P, Section, Sub, Ui, fmtMs, type GuideContext } from '../guideKit';

const HealthSection: React.FC<{ ctx: GuideContext }> = ({ ctx }) => {
  const m = ctx.health?.monitor;
  const services = ctx.health?.services ?? [];

  return (
    <Section>
      <Sub>Cosa viene controllato</Sub>
      {services.length > 0 ? (
        <List>
          {GROUP_ORDER.map(group => {
            const names = services.filter(s => s.group === group).map(s => s.name);
            return names.length > 0 ? (
              <li key={group}>
                <span className='font-medium text-text-primary'>{GROUP_LABEL[group]}</span>: {names.join(', ')}
              </li>
            ) : null;
          })}
        </List>
      ) : (
        <P>Gateway, microservizi e database della piattaforma (elenco non ancora disponibile).</P>
      )}
      <P>
        Ogni <Live>{m && fmtMs(m.intervalMs)}</Live> log-service controlla tutti gli elementi insieme; ciascun controllo
        attende al massimo <Live>{m && fmtMs(m.probeTimeoutMs)}</Live>. I servizi rispondono al proprio indirizzo di
        salute; per MySQL, PostgreSQL e Redis si verifica che rispondano al loro protocollo, senza credenziali e senza
        toccare i dati; MongoDB, che contiene i log, si interroga con la connessione di log-service stesso.
      </P>

      <Sub>Gli stati</Sub>
      <List>
        <li>
          <Ui>Operativo</Ui>: ha risposto in tempo all'ultimo controllo.
        </li>
        <li>
          <Ui>Rallentato</Ui>: ha risposto, ma oltre <Live>{m && fmtMs(m.degradedLatencyMs)}</Live>. È solo
          un'indicazione visiva: <strong className='font-medium text-text-primary'>non genera allarmi</strong>, per non
          disturbare per un rallentamento momentaneo.
        </li>
        <li>
          <Ui>Non raggiungibile</Ui>: dopo <Live>{m?.downAfterFailures}</Live> controlli falliti di fila (quindi circa{' '}
          <Live>{m && fmtMs(m.intervalMs * m.downAfterFailures)}</Live> dopo il guasto). Viene registrato l'evento{' '}
          <code>health.down</code>, che fa scattare l'allarme «Servizio non raggiungibile».
        </li>
        <li>
          Quando torna a rispondere viene registrato <code>health.recovered</code>, con la durata del disservizio
          («Servizio di nuovo operativo»).
        </li>
        <li>
          <Ui>In verifica</Ui>: log-service è appena ripartito e non ha ancora completato il primo controllo.
        </li>
      </List>

      <Sub>Riavvii, arresti e nuove versioni</Sub>
      <List>
        <li>
          <strong className='font-medium text-text-primary'>Riavvio</strong>: ogni servizio comunica da quanto tempo è
          acceso. Se tra due controlli questo tempo diminuisce, il servizio è ripartito (errore, memoria esaurita, riavvio
          di Docker) anche se nessun controllo l'ha mai visto spento. La scheda del servizio mostra i riavvii delle ultime{' '}
          <Live>{m && fmtMs(m.restartWindowMs)}</Live>; due riavvii ravvicinati fanno scattare «Riavvii ripetuti di un
          servizio».
        </li>
        <li>
          <strong className='font-medium text-text-primary'>Arresto per errore</strong>: un servizio che si chiude per un
          errore imprevisto lo comunica a log-service un istante prima di fermarsi («Servizio arrestato da un errore»).
        </li>
        <li>
          <strong className='font-medium text-text-primary'>Nuova versione</strong>: se cambiano versione, data di build o
          commit tra due controlli è un aggiornamento voluto (deploy): viene registrato come tale e non come riavvio.
        </li>
      </List>

      <Sub>Il pulsante di aggiornamento</Sub>
      <P>
        Il pulsante in alto non si limita a rileggere: fa eseguire <strong className='font-medium text-text-primary'>
        subito</strong> un giro completo di controlli e mostra il risultato. Se un giro è già in corso si aggancia a quello;
        tra due giri richiesti a mano passano almeno <Live>{m && fmtMs(m.manualCheckMinGapMs)}</Live>.
      </P>

      <Note>
        log-service non controlla sé stesso: se questa pagina non riesce a caricarsi è proprio log-service a non
        rispondere, e in quel momento nessun allarme può partire. Va verificato il suo container.
      </Note>
    </Section>
  );
};

export default HealthSection;
