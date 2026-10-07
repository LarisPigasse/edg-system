// Guida → In breve: cosa mostra la pagina e da dove arrivano i dati
import React from 'react';
import { List, Live, P, Section, Ui, fmtMs, type GuideContext } from '../guideKit';

const OverviewSection: React.FC<{ ctx: GuideContext }> = ({ ctx }) => (
  <Section>
    <P>
      La pagina Info riunisce tutto ciò che serve per sapere se la piattaforma sta funzionando e per essere avvisati
      quando qualcosa si rompe. È divisa in tre schede operative più questa guida:
    </P>
    <List>
      <li>
        <Ui>Salute</Ui>: lo stato di ogni servizio e database, i processi pianificati, l'attività delle ultime 24 ore e
        l'ultimo allarme generato.
      </li>
      <li>
        <Ui>Regole</Ui>: le regole che decidono quando un evento diventa un allarme via email, e i destinatari.
      </li>
      <li>
        <Ui>Storico</Ui>: l'elenco di tutti gli allarmi generati, inviati o falliti.
      </li>
    </List>
    <P>
      Tutto è calcolato da <strong className='font-medium text-text-primary'>log-service</strong>, che lavora in
      background anche quando nessuno guarda la pagina: controlla periodicamente i servizi e riceve gli eventi che ogni
      servizio registra (accessi, modifiche, errori, processi pianificati). Gli allarmi partono quindi anche a pagina
      chiusa.
    </P>
    <P>
      Mentre è visibile, la pagina si aggiorna da sola ogni <Live>{fmtMs(ctx.pollMs)}</Live>; si ferma quando la scheda
      del browser è nascosta e riprende quando torna visibile. I riquadri in alto riassumono: <Ui>Operativi</Ui> (servizi
      funzionanti sul totale), <Ui>Problemi</Ui> (non raggiungibili più rallentati) e <Ui>Allarmi 7 gg</Ui>.
    </P>
  </Section>
);

export default OverviewSection;
