// Guida → Regole di allarme: come un evento diventa un'email, e le regole attuali
import React from 'react';
import { Badge } from '@edg/ui';
import { describeRule } from '../../../../utils/alertFormat';
import { List, Note, P, Section, Sub, Ui, type GuideContext } from '../guideKit';

const RulesGuideSection: React.FC<{ ctx: GuideContext }> = ({ ctx }) => {
  const rules = ctx.rules ? [...ctx.rules].sort((a, b) => Number(b.enabled) - Number(a.enabled) || a.name.localeCompare(b.name)) : null;

  return (
    <Section>
      <P>Ogni evento registrato da un servizio viene confrontato, appena arriva, con le regole attive. Una regola dice:</P>
      <List>
        <li>
          <Ui>Quali eventi</Ui>: tipo di evento, categoria, criticità, esito o servizio di provenienza.
        </li>
        <li>
          <Ui>Quando scatta</Ui>: almeno N eventi in M minuti (con 1 scatta subito, a ogni evento).
        </li>
        <li>
          <Ui>Raggruppa</Ui>: per servizio, per utente o per IP. Soglia e pausa si contano separatamente per ciascuno: «8
          accessi falliti dallo stesso IP», non 8 in tutta la piattaforma.
        </li>
        <li>
          <Ui>Pausa tra due allarmi</Ui>: dopo un allarme, per lo stesso gruppo non ne parte un altro fino alla fine della
          pausa. Vale anche quando l'invio fallisce, così un problema all'email non produce una raffica di tentativi.
        </li>
        <li>
          <Ui>Gravità dell'allarme</Ui>: fissa, oppure ricavata dall'evento (informazione, attenzione, critico). Decide
          il colore e l'oggetto dell'email.
        </li>
      </List>
      <P>
        Quando una regola scatta parte l'email e l'allarme viene registrato nello <Ui>Storico</Ui>. Le regole{' '}
        <strong className='font-medium text-text-primary'>predefinite</strong> vengono create da log-service al primo
        avvio: non si possono eliminare, ma si possono disattivare. Le altre si creano dalla scheda <Ui>Regole</Ui>.
      </P>

      <Sub>Regole attuali</Sub>
      {rules === null ? (
        <P>Elenco non disponibile (serve il permesso «Allarmi»).</P>
      ) : rules.length === 0 ? (
        <P>Nessuna regola configurata.</P>
      ) : (
        <ul className='space-y-2'>
          {rules.map(r => (
            <li key={r._id} className='rounded-lg border border-border-default px-3 py-2'>
              <div className='flex flex-wrap items-center gap-2'>
                <span className='text-sm font-medium text-text-primary'>{r.name}</span>
                {r.systemKey && (
                  <Badge size='xs' variant='default'>
                    Predefinita
                  </Badge>
                )}
                {!r.enabled && (
                  <Badge size='xs' variant='warning'>
                    Disattivata
                  </Badge>
                )}
              </div>
              <p className='mt-0.5 text-xs text-text-secondary leading-relaxed'>{describeRule(r)}</p>
            </li>
          ))}
        </ul>
      )}

      <Note>
        Una regola nuova va provata con un evento reale: se le condizioni non corrispondono a nessun evento che i servizi
        registrano davvero, la regola non scatterà mai e nessuno se ne accorge. Per questo il <Ui>Tipo di evento</Ui> si
        sceglie dall'elenco proposto, non si scrive a mano.
      </Note>
    </Section>
  );
};

export default RulesGuideSection;
