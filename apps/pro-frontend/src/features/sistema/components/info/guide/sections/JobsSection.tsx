// Guida → Processi pianificati: quali sono, quando girano, cosa significano gli stati
import React from 'react';
import { List, Live, P, Section, Sub, Ui, fmtMs, type GuideContext } from '../guideKit';

const JobsGuideSection: React.FC<{ ctx: GuideContext }> = ({ ctx }) => {
  const jobs = ctx.health?.jobs ?? [];
  const startupGrace = ctx.health?.monitor.jobsStartupGraceMs;

  return (
    <Section>
      <P>
        I processi pianificati sono attività automatiche dei servizi (pulizie, controlli, backup, riepilogo). Ogni
        esecuzione registra un evento di riuscita o di errore; log-service confronta questi eventi con l'elenco dei
        processi attesi e si accorge anche di quelli che <strong className='font-medium text-text-primary'>non sono
        partiti affatto</strong>.
      </P>

      <Sub>Processi attesi</Sub>
      {jobs.length > 0 ? (
        <List>
          {jobs.map(j => (
            <li key={j.id}>
              <span className='font-medium text-text-primary'>{j.name}</span> ({j.service}): {j.schedule}; tolleranza{' '}
              <Live>{fmtMs(j.graceMs)}</Live>
            </li>
          ))}
        </List>
      ) : (
        <P>Elenco non ancora disponibile.</P>
      )}

      <Sub>Gli stati</Sub>
      <List>
        <li>
          <Ui>Completato</Ui>: l'ultima esecuzione è riuscita ed è nei tempi.
        </li>
        <li>
          <Ui>Fallito</Ui>: l'ultima esecuzione è terminata con un errore, mostrato nella scheda. Scatta subito l'allarme
          «Processo pianificato fallito».
        </li>
        <li>
          <Ui>In ritardo</Ui>: nessuna esecuzione riuscita entro l'intervallo previsto più la tolleranza. Scatta
          l'allarme «Processo pianificato non eseguito», una sola volta per ogni ritardo.
        </li>
        <li>
          <Ui>In attesa</Ui>: da quando log-service è partito il processo non è ancora girato, ma è ancora nei tempi.
        </li>
      </List>

      <Sub>PC spento e riavvii</Sub>
      <P>
        In sviluppo il computer di notte è spento: alla riaccensione i processi notturni recuperano da soli. Per questo,
        nei primi <Live>{startupGrace !== undefined ? fmtMs(startupGrace) : undefined}</Live> dopo l'avvio di
        log-service un ritardo non genera allarmi; se il ritardo continua oltre quel tempo, l'allarme parte comunque.
      </P>
    </Section>
  );
};

export default JobsGuideSection;
