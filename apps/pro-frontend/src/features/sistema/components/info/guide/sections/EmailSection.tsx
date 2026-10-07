// Guida → Email e destinatari: chi riceve gli allarmi e cosa succede se l'invio fallisce
import React from 'react';
import { List, Note, P, Section, Sub, Ui, type GuideContext } from '../guideKit';

const EmailGuideSection: React.FC<{ ctx: GuideContext }> = ({ ctx }) => {
  const defaults = ctx.recipients?.filter(r => r.enabled && r.isDefault) ?? null;

  return (
    <Section>
      <P>
        I destinatari si gestiscono nella scheda <Ui>Regole</Ui>, sezione <Ui>Destinatari</Ui>. Per ogni allarme l'elenco si
        decide così:
      </P>
      <List>
        <li>se la regola indica destinatari specifici, ricevono l'email quelli tra loro ancora attivi;</li>
        <li>
          altrimenti la ricevono tutti i destinatari attivi segnati come <Ui>Destinatario predefinito</Ui>;
        </li>
        <li>
          se non resta nessuno, l'email va all'indirizzo di riserva configurato sul server (<code>EMAIL_ALERTS_TO</code>): un
          allarme non va mai perso per un elenco vuoto o sbagliato.
        </li>
      </List>

      <Sub>Destinatari predefiniti attuali</Sub>
      {defaults === null ? (
        <P>Elenco non disponibile (serve il permesso «Allarmi»).</P>
      ) : defaults.length === 0 ? (
        <Note tone='warning'>
          Nessun destinatario predefinito attivo: gli allarmi delle regole senza destinatari specifici vanno solo all'indirizzo
          di riserva, e il riepilogo giornaliero non può partire.
        </Note>
      ) : (
        <List>
          {defaults.map(r => (
            <li key={r._id}>
              <span className='font-medium text-text-primary'>{r.name}</span> — {r.email}
            </li>
          ))}
        </List>
      )}

      <Sub>Se l'invio fallisce</Sub>
      <P>
        Se il servizio email non risponde, l'allarme viene comunque registrato nello <Ui>Storico</Ui> con esito <Ui>Fallito</Ui>{' '}
        e conteggiato in <Ui>Invii falliti in 7 giorni</Ui> nella scheda Salute. La pausa della regola vale anche per gli invii
        falliti, quindi non parte un nuovo tentativo a ogni evento.
      </P>
    </Section>
  );
};

export default EmailGuideSection;
