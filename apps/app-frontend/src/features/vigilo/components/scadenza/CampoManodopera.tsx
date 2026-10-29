// src/features/vigilo/components/scadenza/CampoManodopera.tsx
//
// "Chi ha fatto il lavoro" nel modulo Registra (passo 8): Interno · Esterno ·
// Entrambi. Con Esterno il fornitore (passato da fuori), con Interno le righe
// di manodopera: persona (o "Dipendente") e ore, fino a 8. A chi ha
// vigilo.costi la stima del costo di ogni riga e del totale, con il costo
// della persona o il predefinito; il servizio poi lo copia nella registrazione.
import React from 'react';
import { Input, Plus, RadioGroup, Select, X } from '@edg/ui';

import type { PersonaManodopera } from '../../hooks/usePersoneManodopera';
import type { Esecuzione } from '../../types/scadenze';
import { DIPENDENTE, ESECUZIONI, LIMITI_MANODOPERA, euro, nuovaRiga, ore, righePronte, testoOre, type RigaInModulo } from '../../utils/manodopera';

interface Props {
  esecuzione: Esecuzione | '';
  onEsecuzione: (e: Esecuzione) => void;
  righe: RigaInModulo[];
  onRighe: (r: RigaInModulo[]) => void;
  persone: PersonaManodopera[];
  costi: boolean;
  costoPredefinito: number | null;
  obbligatoria: boolean;
  /** Il campo del fornitore, mostrato con Esterno ed Entrambi (o sempre, se va indicato) */
  fornitore: React.ReactNode;
  mostraFornitore: boolean;
}

export const CampoManodopera: React.FC<Props> = ({ esecuzione, onEsecuzione, righe, onRighe, persone, costi, costoPredefinito, obbligatoria, fornitore, mostraFornitore }) => {
  const interna = esecuzione === 'interna' || esecuzione === 'entrambe';
  const costoDi = (persona: string) => persone.find(p => p.uuid === persona)?.costoOrario ?? costoPredefinito;
  const cambia = (chiave: number, modifica: Partial<RigaInModulo>) => onRighe(righe.map(r => (r.chiave === chiave ? { ...r, ...modifica } : r)));
  const stato = righePronte(righe);
  const oreTotali = righe.reduce((t, r) => t + (ore(r.ore) || 0), 0);
  const costoTotale = righe.reduce((t, r) => {
    const h = ore(r.ore) || 0;
    const c = costoDi(r.persona);
    return c == null ? t : t + h * c;
  }, 0);
  const opzioni = [{ value: DIPENDENTE, label: 'Dipendente' }, ...persone.map(p => ({ value: p.uuid, label: p.nome }))];

  return (
    <div className='space-y-3 rounded-lg border border-border-default p-3'>
      <RadioGroup
        label='Chi ha fatto il lavoro'
        orientation='horizontal'
        size='sm'
        value={esecuzione}
        onValueChange={v => {
          const e = v as Esecuzione;
          onEsecuzione(e);
          if ((e === 'interna' || e === 'entrambe') && !righe.length) onRighe([nuovaRiga()]);
        }}
        options={ESECUZIONI}
      />
      {mostraFornitore && fornitore}
      {interna && (
        <div className='space-y-2'>
          <p className='text-sm font-medium text-text-primary'>
            Manodopera interna
            {obbligatoria && <span className='text-text-danger'> *</span>}
          </p>
          {righe.map(r => {
            const h = ore(r.ore);
            const c = costoDi(r.persona);
            return (
              <div key={r.chiave} className='grid grid-cols-[1fr_6rem_auto] items-start gap-2 sm:grid-cols-[1fr_6rem_6rem_auto]'>
                <Select label='Persona' optionSize='sm' value={r.persona} onValueChange={v => cambia(r.chiave, { persona: v })} options={opzioni} />
                <Input label='Ore' inputMode='decimal' value={r.ore} onChange={e => cambia(r.chiave, { ore: e.target.value })} error={Number.isNaN(h) ? 'Quarti d’ora' : undefined} />
                {costi && (
                  <p className='hidden pt-6 text-right text-sm tabular-nums text-text-secondary sm:block'>
                    {h && c != null ? euro(h * c) : '—'}
                  </p>
                )}
                <button
                  type='button'
                  onClick={() => onRighe(righe.filter(x => x.chiave !== r.chiave))}
                  aria-label='Togli la riga'
                  title='Togli'
                  className='mt-6 rounded-md p-1.5 text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary'
                >
                  <X className='h-4 w-4' />
                </button>
              </div>
            );
          })}
          <div className='flex flex-wrap items-center justify-between gap-2'>
            {righe.length < LIMITI_MANODOPERA.righe ? (
              <button type='button' onClick={() => onRighe([...righe, nuovaRiga()])} className='inline-flex items-center gap-1 text-sm font-semibold text-action-primary hover:underline'>
                <Plus className='h-4 w-4' aria-hidden />
                Aggiungi persona
              </button>
            ) : (
              <span className='text-xs text-text-secondary'>Al massimo {LIMITI_MANODOPERA.righe} righe</span>
            )}
            {oreTotali > 0 && (
              <span className='text-sm tabular-nums text-text-secondary'>
                {testoOre(oreTotali)} in tutto{costi && costoTotale > 0 ? ` · ${euro(Math.round(costoTotale * 100) / 100)}` : ''}
              </span>
            )}
          </div>
          {stato.errore ? (
            <p className='text-xs text-text-danger'>{stato.errore}</p>
          ) : (
            stato.incompleta && <p className='text-xs text-text-secondary'>Indica le ore di ogni riga, o togli quelle che non servono.</p>
          )}
        </div>
      )}
    </div>
  );
};
