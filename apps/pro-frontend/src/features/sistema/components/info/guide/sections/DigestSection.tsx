// Guida → Riepilogo giornaliero: quando parte, a chi, cosa contiene
import React from 'react';
import { List, Note, P, Section, Sub, Ui, type GuideContext } from '../guideKit';

/** Id del processo del riepilogo nel registro dei processi attesi di log-service */
const DIGEST_JOB_ID = 'report.daily-digest';

const DigestGuideSection: React.FC<{ ctx: GuideContext }> = ({ ctx }) => {
  const job = ctx.health?.jobs.find(j => j.id === DIGEST_JOB_ID);

  return (
    <Section>
      <P>
        Una volta al giorno log-service invia un'email di riepilogo delle ultime 24 ore
        {job ? (
          <>
            {' '}
            (<strong className='font-semibold text-text-primary'>{job.schedule}</strong>)
          </>
        ) : null}
        . Parte <strong className='font-medium text-text-primary'>sempre</strong>, anche quando è tutto regolare: è la sua
        assenza a segnalare che qualcosa non va.
      </P>
      <List>
        <li>Se all'orario previsto il sistema era spento, viene inviato all'avvio, se l'ultimo ha più di 24 ore.</li>
        <li>
          Il pulsante <Ui>Invia riepilogo ora</Ui>, nei processi pianificati della scheda Salute, lo invia subito.
        </li>
        <li>
          Lo ricevono i <Ui>Destinatario predefinito</Ui> attivi. Se non ce n'è nessuno l'invio fallisce e il processo
          risulta <Ui>Fallito</Ui>.
        </li>
      </List>

      <Sub>Cosa contiene</Sub>
      <List>
        <li>l'esito della giornata: tutto regolare, oppure quanti e quali problemi;</li>
        <li>servizi ed eventi: non raggiungibili, ripristini, riavvii, arresti per errore, nuove versioni;</li>
        <li>lo stato dei processi pianificati;</li>
        <li>gli allarmi del giorno raggruppati per regola, compresi quelli non inviati;</li>
        <li>l'attività degli operatori, solo come conteggi;</li>
        <li>il volume dei log e lo spazio occupato.</li>
      </List>

      {job && job.status !== 'OK' && job.status !== 'PENDING' && (
        <Note tone='warning'>
          In questo momento il riepilogo risulta {job.status === 'FAILED' ? 'fallito' : 'in ritardo'}: vedi i processi
          pianificati nella scheda Salute.
        </Note>
      )}
    </Section>
  );
};

export default DigestGuideSection;
