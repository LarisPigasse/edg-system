// src/features/sistema/components/info/rules/RulesTab.tsx
//
// Scheda "Regole" di SISTEMA → Info (ADR038): regole di allarme e
// destinatari. Possiede i dati delle due sezioni e le tiene allineate:
//  - una modifica ai destinatari ricarica anche le regole (eliminarne uno
//    lo toglie dalle regole che lo indicano)
//  - una modifica alle regole ricarica anche i destinatari (conteggio "Regole")
import React, { useCallback, useEffect, useState } from 'react';

import RulesSection from './RulesSection';
import RecipientsSection from './RecipientsSection';
import { getEventTypes } from '../../../api/infoApi';
import { useAlertRules } from '../../../hooks/useAlertRules';
import { useAlertRecipients } from '../../../hooks/useAlertRecipients';
import type { AlertRecipient, AlertRecipientInput, AlertRule, AlertRuleInput, EventTypeOption } from '../../../types/info';

export const RulesTab: React.FC = () => {
  const rules = useAlertRules();
  const recipients = useAlertRecipients();
  const [eventTypes, setEventTypes] = useState<EventTypeOption[]>([]);

  useEffect(() => {
    getEventTypes()
      .then(setEventTypes)
      .catch(() => setEventTypes([])); // la modale resta usabile con "qualsiasi tipo"
  }, []);

  // --- Regole: dopo ogni modifica, riallinea anche i destinatari ---------
  const saveRule = useCallback(
    async (id: string | null, input: AlertRuleInput) => {
      const ok = await rules.save(id, input);
      if (ok) void recipients.refetch();
      return ok;
    },
    [rules, recipients]
  );
  const toggleRule = useCallback((r: AlertRule) => rules.toggle(r), [rules]);
  const deleteRule = useCallback(
    async (r: AlertRule) => {
      await rules.remove(r);
      void recipients.refetch();
    },
    [rules, recipients]
  );

  // --- Destinatari: dopo ogni modifica, riallinea anche le regole --------
  const saveRecipient = useCallback(
    async (id: string | null, input: AlertRecipientInput) => {
      const ok = await recipients.save(id, input);
      if (ok) void rules.refetch();
      return ok;
    },
    [rules, recipients]
  );
  const toggleRecipient = useCallback((r: AlertRecipient) => recipients.toggle(r), [recipients]);
  const deleteRecipient = useCallback(
    async (r: AlertRecipient) => {
      await recipients.remove(r);
      void rules.refetch();
    },
    [rules, recipients]
  );

  return (
    <div className='flex flex-col gap-8'>
      <RulesSection
        rules={rules.items}
        recipients={recipients.items}
        eventTypes={eventTypes}
        isLoading={rules.isLoading}
        isSaving={rules.isSaving}
        onSave={saveRule}
        onToggle={toggleRule}
        onDelete={deleteRule}
      />
      <RecipientsSection
        recipients={recipients.items}
        isLoading={recipients.isLoading}
        isSaving={recipients.isSaving}
        onSave={saveRecipient}
        onToggle={toggleRecipient}
        onDelete={deleteRecipient}
      />
    </div>
  );
};

export default RulesTab;
