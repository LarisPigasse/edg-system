// src/features/sistema/components/tenant/config/VigiloConfigEditor.tsx
//
// Editor delle impostazioni di Vigilo nella finestra di attivazione (ADR087).
import React from 'react';
import { Checkbox, RadioGroup, Select } from '@edg/ui';

import { useOperatoriEdg } from '../../../../base/api/useOperatoriEdg';
import { leggiVigiloConfig, useModelliLibreria, validaVigilo, type PreparazioneVigilo, type VigiloConfig } from './vigiloConfig';
import type { ModuleConfigEditorProps } from './types';

const NESSUNO = '__none__';

const PREPARAZIONE = [
  { value: 'cliente', label: 'Il cliente', description: 'Al primo accesso il cliente segue da sé la procedura di avvio.' },
  { value: 'edg', label: 'EDG', description: 'Un operatore EDG prepara Vigilo con l’accesso assistito; il cliente lo trova pronto.' },
];

const VigiloConfigEditor: React.FC<ModuleConfigEditorProps> = ({ value, onChange, showErrors }) => {
  const config = leggiVigiloConfig(value);
  const set = (patch: Partial<VigiloConfig>) => onChange({ ...config, ...patch });
  const { operatoreOptions } = useOperatoriEdg();
  const modelli = useModelliLibreria();
  const errore = showErrors ? validaVigilo(value) : null;

  const toggleModello = (chiave: string, on: boolean) =>
    set({ modelli: on ? [...new Set([...config.modelli, chiave])] : config.modelli.filter(m => m !== chiave) });

  return (
    <div className='space-y-4 rounded-lg border border-border-default p-4'>
      <h4 className='text-sm font-semibold text-text-primary'>Impostazioni di Vigilo</h4>

      <RadioGroup
        label='Chi prepara Vigilo'
        options={PREPARAZIONE}
        value={config.preparazione}
        onValueChange={v => set({ preparazione: v as PreparazioneVigilo })}
      />

      {config.preparazione === 'edg' && (
        <Select
          label='Operatore EDG che prepara'
          options={[{ value: NESSUNO, label: 'Scegli l’operatore' }, ...operatoreOptions(config.idOperatore)]}
          value={config.idOperatore ? String(config.idOperatore) : NESSUNO}
          onValueChange={v => set({ idOperatore: v === NESSUNO ? null : Number(v) })}
          error={errore ?? undefined}
          helperText='Resta registrato come chi si occupa della preparazione'
          required
        />
      )}

      <div className='space-y-2'>
        <p className='text-sm font-medium text-text-primary'>Settori suggeriti</p>
        <p className='text-xs text-text-secondary'>La procedura di avvio li trova già scelti; si possono sempre cambiare.</p>
        <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
          {modelli.map(m => (
            <Checkbox
              key={m.chiave}
              label={m.nome}
              checked={config.modelli.includes(m.chiave)}
              onCheckedChange={v => toggleModello(m.chiave, v === true)}
            />
          ))}
        </div>
        {modelli.length === 0 && <p className='text-xs text-text-secondary'>Settori della libreria non disponibili.</p>}
      </div>
    </div>
  );
};

export default VigiloConfigEditor;
