// src/features/sistema/components/EntityLinkSelect.tsx
import React from 'react';
import { Select, type SelectOption } from '@edg/ui';

import { useEntityDirectory } from '../api/useEntityDirectory';

// Radix Select non ammette un Item con value="": serve un sentinel per
// l'opzione "nessun collegamento", tradotto in null/entityId reale al
// confine di questo componente (vedi onChange).
const NONE_VALUE = '__none__';

interface EntityLinkSelectProps {
  /** 'operatore' → elenco operatori (include gli agenti: sono operatori di
   * un reparto specifico, non un tipo a parte); 'cliente' → elenco
   * anagrafiche (clienti e partner insieme: oggi condividono lo stesso
   * accountType). Un accountType futuro senza risorsa nota disabilita il
   * selettore invece di mostrare una lista vuota senza spiegazione. */
  accountType: string;
  value: string | null | undefined;
  onChange: (entityId: string | null) => void;
  /** UUID delle entità già collegate ad ALTRI account: un'entità può avere
   * un solo account, quindi non vanno riproposte qui. Chi chiama esclude già
   * l'eventuale collegamento dell'account corrente da questo insieme, cosi'
   * l'opzione già selezionata resta comunque visibile e selezionabile. */
  excludeEntityIds?: ReadonlySet<string>;
}

const EntityLinkSelect: React.FC<EntityLinkSelectProps> = ({ accountType, value, onChange, excludeEntityIds }) => {
  const { isLoading, getLabel, operatoreOptions, anagraficaOptions } = useEntityDirectory();

  const resourceKnown = accountType === 'operatore' || accountType === 'cliente';

  const rawOptions: SelectOption[] =
    accountType === 'operatore' ? operatoreOptions() : accountType === 'cliente' ? anagraficaOptions() : [];

  // Un'entità già collegata a un altro account non va riproposta - eccetto
  // quella eventualmente già selezionata qui, che resta visibile.
  const availableOptions = rawOptions.filter(opt => opt.value === value || !excludeEntityIds?.has(opt.value));

  // Se il valore selezionato non compare più tra le opzioni disponibili (es.
  // entità disattivata nel frattempo), mostralo comunque con la sua
  // etichetta reale invece di lasciarlo silenziosamente vuoto.
  const selectedLabel = value ? getLabel(accountType, value) : null;
  const hasSelectedOption = availableOptions.some(opt => opt.value === value);
  if (value && selectedLabel && !hasSelectedOption) {
    availableOptions.push({ value, label: selectedLabel });
  }

  const selectOptions: SelectOption[] = [{ value: NONE_VALUE, label: 'Nessuna entità collegata' }, ...availableOptions];

  const helperText = !resourceKnown
    ? 'Nessuna entità collegabile per questo tipo di account.'
    : isLoading
      ? 'Caricamento elenco...'
      : accountType === 'operatore'
        ? 'Operatore di base rappresentato da questo account. Solo gli operatori non ancora collegati ad altri account sono proposti.'
        : 'Anagrafica (cliente o partner) rappresentata da questo account. Solo le anagrafiche non ancora collegate ad altri account sono proposte.';

  return (
    <Select
      label='Entità collegata'
      options={selectOptions}
      value={value ?? NONE_VALUE}
      onValueChange={v => onChange(v === NONE_VALUE ? null : v)}
      disabled={!resourceKnown || isLoading}
      helperText={helperText}
    />
  );
};

export default EntityLinkSelect;
