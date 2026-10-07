// src/features/sistema/components/info/guide/GuideTab.tsx
//
// Scheda "Guida" di SISTEMA → Info: solo lettura, spiega controlli, stati,
// allarmi, email e riepilogo, per chi apre la pagina e non ricorda cosa c'è
// dietro. Ogni sezione è un file in ./sections.
//
// I numeri citati arrivano dal vivo: parametri del monitor e processi dalla
// risposta di GET /api/system/health (già caricata dalla pagina), regole e
// destinatari letti qui. Se mancano (permesso «Allarmi» assente o errore) la
// guida resta leggibile e lo dice, senza toast d'errore.
import React, { useEffect, useMemo, useState } from 'react';
import { Accordion, type AccordionItem } from '@edg/ui';
import { getAlertRecipients, getAlertRules } from '../../../api/infoApi';
import { HEALTH_POLL_MS } from '../../../hooks/useSystemHealth';
import type { AlertRecipient, AlertRule, SystemHealth } from '../../../types/info';
import type { GuideContext } from './guideKit';
import {
  DigestGuideSection,
  EmailGuideSection,
  FaqSection,
  HealthSection,
  HistoryGuideSection,
  JobsGuideSection,
  OverviewSection,
  RulesGuideSection,
} from './sections';

interface GuideTabProps {
  /** Stato di salute già caricato dalla pagina (null finché non arriva) */
  health: SystemHealth | null;
}

const GuideTab: React.FC<GuideTabProps> = ({ health }) => {
  const [rules, setRules] = useState<AlertRule[] | null>(null);
  const [recipients, setRecipients] = useState<AlertRecipient[] | null>(null);

  // Una lettura all'apertura della scheda: per una guida basta
  useEffect(() => {
    let cancelled = false;
    getAlertRules()
      .then(r => !cancelled && setRules(r))
      .catch(() => !cancelled && setRules(null));
    getAlertRecipients()
      .then(r => !cancelled && setRecipients(r))
      .catch(() => !cancelled && setRecipients(null));
    return () => {
      cancelled = true;
    };
  }, []);

  const ctx: GuideContext = { health, rules, recipients, pollMs: HEALTH_POLL_MS };

  const items: AccordionItem[] = useMemo(
    () => [
      { value: 'overview', title: 'In breve', content: <OverviewSection ctx={ctx} /> },
      { value: 'health', title: 'Salute dei servizi', content: <HealthSection ctx={ctx} /> },
      { value: 'jobs', title: 'Processi pianificati', content: <JobsGuideSection ctx={ctx} /> },
      { value: 'rules', title: 'Regole di allarme', content: <RulesGuideSection ctx={ctx} /> },
      { value: 'email', title: 'Email e destinatari', content: <EmailGuideSection ctx={ctx} /> },
      { value: 'digest', title: 'Riepilogo giornaliero', content: <DigestGuideSection ctx={ctx} /> },
      { value: 'history', title: 'Storico e registro', content: <HistoryGuideSection /> },
      { value: 'faq', title: 'Domande frequenti', content: <FaqSection ctx={ctx} /> },
    ],
    // ctx è ricostruito a ogni render: le dipendenze vere sono i suoi dati
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [health, rules, recipients]
  );

  return (
    <div className='space-y-4'>
      <p className='text-sm text-text-secondary'>
        Come funziona questa pagina: cosa viene controllato, ogni quanto, quando parte un allarme e chi lo riceve. I valori
        in <strong className='font-semibold text-text-primary'>grassetto</strong> sono letti dal vivo dalla configurazione
        attuale della piattaforma.
      </p>
      <Accordion type='multiple' items={items} defaultValue={['overview']} variant='separated' size='md' />
    </div>
  );
};

export default GuideTab;
