// Guida → Domande frequenti: i dubbi più comuni guardando la pagina
import React from 'react';
import { formatCooldown } from '../../../../utils/alertFormat';
import { Live, P, Section, Ui, fmtMs, type GuideContext } from '../guideKit';

const Q: React.FC<{ q: string; children: React.ReactNode }> = ({ q, children }) => (
  <div className='space-y-1'>
    <p className='text-sm font-medium text-text-primary'>{q}</p>
    {children}
  </div>
);

const FaqSection: React.FC<{ ctx: GuideContext }> = ({ ctx }) => {
  const downRule = ctx.rules?.find(r => r.systemKey === 'health.down');
  const startupGrace = ctx.health?.monitor.jobsStartupGraceMs;

  return (
    <Section>
      <Q q='Un servizio è «Non raggiungibile» ma non ho ricevuto nessuna email.'>
        <P>
          Controlla, in quest'ordine: che la regola «Servizio non raggiungibile» sia attiva (scheda <Ui>Regole</Ui>);
          nello <Ui>Storico</Ui>, se l'allarme c'è ed è <Ui>Fallito</Ui> (problema di invio); i destinatari. Ricorda la
          pausa: dopo un allarme per lo stesso servizio non ne parte un altro per{' '}
          <Live>{downRule ? formatCooldown(downRule.cooldownMinutes) : undefined}</Live>.
        </P>
      </Q>
      <Q q='Un servizio è «Rallentato»: devo preoccuparmi?'>
        <P>
          Non subito: è un'indicazione visiva e non genera allarmi. Diventa un segnale se resta rallentato a lungo o se lo
          sono molti servizi insieme.
        </P>
      </Q>
      <Q q='Un processo è «In ritardo» dopo che il computer è rimasto spento.'>
        <P>
          È normale: il processo recupera da solo all'avvio. Se resta in ritardo per più di{' '}
          <Live>{startupGrace !== undefined ? fmtMs(startupGrace) : undefined}</Live> dall'avvio di log-service, parte
          l'allarme «Processo pianificato non eseguito».
        </P>
      </Q>
      <Q q='Ho premuto il pulsante di aggiornamento e non è cambiato nulla.'>
        <P>
          Il controllo è stato eseguito davvero: se lo stato non cambia, è quello reale. L'orario di{' '}
          <Ui>Ultimo controllo</Ui> nel riquadro in alto conferma quando è stato fatto.
        </P>
      </Q>
      <Q q='La pagina non si carica o mostra un errore.'>
        <P>
          È log-service a non rispondere. Non controlla sé stesso, quindi finché non torna attivo non possono partire
          allarmi: va verificato il suo container.
        </P>
      </Q>
      <Q q='Ricevo troppe email.'>
        <P>
          Nella regola che le genera puoi alzare la soglia (più eventi o una finestra più corta), allungare la pausa,
          raggruppare per servizio, utente o IP, oppure disattivarla.
        </P>
      </Q>
    </Section>
  );
};

export default FaqSection;
