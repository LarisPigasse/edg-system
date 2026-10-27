// src/features/vigilo/components/destinatari/EditorDestinatari.tsx
//
// Chi riceve gli avvisi (B8d-3), per un controllo o per una scadenza: le
// caselle dei ruoli che valgono per il tipo di soggetto e gli indirizzi email
// aggiuntivi (il consulente, l'officina). Controllato: valore e onCambia.
// I ruoli che non valgono per il tipo restano come sono, invisibili.
import React, { useState } from 'react';
import { Button, Checkbox, Input, Mail, Plus, X } from '@edg/ui';

import { RUOLI_DESTINATARI } from '../../constants/destinatari';
import type { Destinatario, TipoDestinatario } from '../../types/destinatari';
import { emailValida, haRuolo, indirizzi, ordinati } from '../../utils/destinatari';

interface Props {
  valore: Destinatario[];
  onCambia: (lista: Destinatario[]) => void;
  /** I ruoli da mostrare (ruoliPer del tipo di soggetto) */
  ruoli: TipoDestinatario[];
  disabilitato?: boolean;
}

export const EditorDestinatari: React.FC<Props> = ({ valore, onCambia, ruoli, disabilitato }) => {
  const [nuovo, setNuovo] = useState('');
  const [errore, setErrore] = useState<string | null>(null);
  const presenti = indirizzi(valore);

  const commuta = (r: TipoDestinatario, dentro: boolean) =>
    onCambia(ordinati(dentro ? [...valore, { tipo: r }] : valore.filter(d => d.tipo !== r)));

  const aggiungi = () => {
    const e = nuovo.trim().toLowerCase();
    if (!e) return;
    if (!emailValida(e)) return setErrore('Indirizzo non valido');
    if (presenti.includes(e)) return setErrore('Indirizzo già presente');
    onCambia(ordinati([...valore, { tipo: 'email', email: e }]));
    setNuovo('');
    setErrore(null);
  };

  const togli = (e: string) => onCambia(valore.filter(d => !(d.tipo === 'email' && d.email === e)));

  return (
    <div className='space-y-5'>
      <fieldset className='space-y-3' disabled={disabilitato}>
        <legend className='mb-2 text-sm font-medium text-text-primary'>Chi, nell'azienda</legend>
        {ruoli.map(r => (
          <Checkbox
            key={r}
            label={RUOLI_DESTINATARI[r].etichetta}
            description={RUOLI_DESTINATARI[r].spiegazione}
            checked={haRuolo(valore, r)}
            disabled={disabilitato}
            onCheckedChange={v => commuta(r, v === true)}
          />
        ))}
      </fieldset>

      <fieldset className='space-y-3' disabled={disabilitato}>
        <legend className='mb-2 text-sm font-medium text-text-primary'>Indirizzi aggiuntivi</legend>
        {presenti.length > 0 && (
          <ul className='divide-y divide-border-thin rounded-lg border border-border-default'>
            {presenti.map(e => (
              <li key={e} className='flex items-center gap-3 px-3 py-2 text-sm'>
                <Mail className='h-4 w-4 shrink-0 text-text-secondary' aria-hidden />
                <span className='min-w-0 flex-1 truncate text-text-primary'>{e}</span>
                <button
                  type='button'
                  onClick={() => togli(e)}
                  disabled={disabilitato}
                  aria-label={`Togli ${e}`}
                  title='Togli'
                  className='rounded-md p-1 text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary disabled:opacity-50'
                >
                  <X className='h-4 w-4' />
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className='flex items-start gap-2'>
          <div className='min-w-0 flex-1'>
            <Input
              label='Email'
              type='email'
              value={nuovo}
              disabled={disabilitato}
              onChange={ev => {
                setNuovo(ev.target.value);
                setErrore(null);
              }}
              onKeyDown={ev => {
                if (ev.key === 'Enter') {
                  ev.preventDefault();
                  aggiungi();
                }
              }}
              error={errore ?? undefined}
              helperText={errore ? undefined : "Per esempio il consulente o l'officina: ricevono le email degli avvisi."}
            />
          </div>
          <Button variant='secondary' onClick={aggiungi} disabled={disabilitato || !nuovo.trim()} leftIcon={<Plus className='h-4 w-4' />} className='mt-2'>
            Aggiungi
          </Button>
        </div>
      </fieldset>
    </div>
  );
};
