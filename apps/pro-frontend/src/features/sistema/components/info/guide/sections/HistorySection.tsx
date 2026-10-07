// Guida → Storico e registro: cosa resta registrato e dove trovarlo
import React from 'react';
import { List, P, Section, Ui } from '../guideKit';

const HistoryGuideSection: React.FC = () => (
  <Section>
    <List>
      <li>
        <Ui>Storico</Ui>: ogni allarme generato, con regola, gravità, destinatari ed esito (<Ui>Inviato</Ui> o{' '}
        <Ui>Fallito</Ui>). Si può filtrare per regola, gravità, esito e periodo; dalla scheda Salute,{' '}
        <Ui>Ultimo allarme</Ui> porta direttamente qui.
      </li>
      <li>
        <Ui>Attività ultime 24 ore</Ui> (scheda Salute): quanti eventi sono stati registrati, quanti errori e quanti
        critici.
      </li>
      <li>
        Il registro completo degli eventi è in SISTEMA → Logs. I log <strong className='font-medium text-text-primary'>
        non si cancellano mai</strong>: nemmeno root può eliminarli.
      </li>
    </List>
    <P>
      Se log-service è momentaneamente irraggiungibile, ogni servizio tiene gli eventi in memoria e li consegna appena
      torna disponibile: un'interruzione breve non fa perdere eventi, né gli allarmi che ne derivano (arrivano in
      ritardo).
    </P>
  </Section>
);

export default HistoryGuideSection;
