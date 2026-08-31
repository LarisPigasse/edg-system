// packages/ui/src/explorer/ThemePreview.tsx
//
// Tavolozza viva del design system: mostra ogni token nel tema attivo.
// Serve a verificare a colpo d'occhio che chiaro e scuro reggano entrambi —
// il contrasto si calcola, ma si giudica guardandolo.

import React from 'react';

import { Button } from '../components/ui';
import { Badge } from '../components/ui';
import { HeaderGroup } from '../components/layout';
import { useUISettings } from '../state/hooks';

/** Legge il valore effettivo di una variabile CSS nel tema attivo. */
const useTokenValue = (token: string): string => {
  const { darkMode } = useUISettings();
  const [value, setValue] = React.useState('');

  React.useEffect(() => {
    const read = () => getComputedStyle(document.documentElement).getPropertyValue(token).trim();
    // il cambio tema muta una classe sul root: rileggo dopo il repaint
    const id = requestAnimationFrame(() => setValue(read()));
    return () => cancelAnimationFrame(id);
  }, [token, darkMode]);

  return value;
};

const Swatch: React.FC<{ label: string; token: string; className: string }> = ({ label, token, className }) => {
  const value = useTokenValue(token);
  return (
    <div className='flex flex-col gap-1'>
      <div className={`h-14 rounded-md border border-border-default ${className}`} />
      <span className='text-xs font-medium text-text-primary'>{label}</span>
      <code className='text-[11px] text-text-secondary'>{value || token}</code>
    </div>
  );
};

const Section: React.FC<{ title: string; hint?: string; children: React.ReactNode }> = ({ title, hint, children }) => (
  <section className='space-y-3'>
    <div>
      <h2 className='text-section-title'>{title}</h2>
      {hint && <p className='text-sm text-text-secondary'>{hint}</p>}
    </div>
    {children}
  </section>
);

const ACTIONS = ['primary', 'secondary', 'neutral', 'danger', 'success', 'warning', 'info'] as const;

/**
 * Anteprima del tema: azioni, superfici, testo semantico e token di base.
 * Cambia il tema dal menu impostazioni per confrontare chiaro e scuro.
 */
export const ThemePreview: React.FC = () => {
  const { darkMode, toggleDarkMode } = useUISettings();

  return (
    <div className='space-y-10 pb-10'>
      <div className='flex items-start justify-between gap-4'>
        <HeaderGroup
          title='Tema'
          subtitle='Ogni colore del design system, nel tema attivo. Nessun componente usa colori letterali: tutto viene da questi token.'
          spacing='tight'
        />
        <Button variant='secondary' onClick={toggleDarkMode}>
          {darkMode ? 'Passa al tema chiaro' : 'Passa al tema scuro'}
        </Button>
      </div>

      <Section title='Azioni' hint='Superfici piene: pulsanti, avatar, barre. Contrasto testo/fondo ≥ 4.5:1.'>
        <div className='grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7'>
          {ACTIONS.map(name => (
            <div key={name} className='space-y-2'>
              <div
                className={`flex h-14 items-center justify-center rounded-md bg-action-${name} text-action-${name}-text text-sm font-medium`}
              >
                Testo
              </div>
              <span className='text-xs font-medium text-text-primary'>{name}</span>
            </div>
          ))}
        </div>
        <div className='flex flex-wrap gap-2 pt-2'>
          <Button variant='primary'>primary</Button>
          <Button variant='secondary'>secondary</Button>
          <Button variant='outline'>outline</Button>
          <Button variant='danger'>danger</Button>
          <Button variant='success'>success</Button>
          <Button variant='warning'>warning</Button>
          <Button variant='info'>info</Button>
          <Button variant='link'>link</Button>
        </div>
      </Section>

      <Section
        title='Superfici tenui'
        hint='Un’unica tinta calda su quattro livelli, con bordo sempre uguale. Il significato lo porta il testo, non il fondo.'
      >
        <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
          <Swatch label='surface-1' token='--surface-1' className='bg-surface-1' />
          <Swatch label='surface-2' token='--surface-2' className='bg-surface-2' />
          <Swatch label='surface-3' token='--surface-3' className='bg-surface-3' />
          <Swatch label='surface-4' token='--surface-4' className='bg-surface-4' />
        </div>
        <div className='flex flex-wrap gap-2 pt-2'>
          <Badge variant='primary'>primary</Badge>
          <Badge variant='success'>success</Badge>
          <Badge variant='warning'>warning</Badge>
          <Badge variant='danger'>danger</Badge>
          <Badge variant='info'>info</Badge>
          <Badge variant='default'>default</Badge>
        </div>
        <div className='rounded-md border border-surface-border bg-surface-2 p-4 text-sm'>
          <span className='text-text-primary'>Pannello su </span>
          <code className='text-text-secondary'>surface-2</code>
          <span className='text-text-primary'> con bordo </span>
          <code className='text-text-secondary'>surface-border</code>
          <span className='text-text-primary'>: </span>
          <span className='text-text-danger'>errore</span>
          <span className='text-text-primary'>, </span>
          <span className='text-text-success'>successo</span>
          <span className='text-text-primary'>, </span>
          <span className='text-text-warning'>attenzione</span>
          <span className='text-text-primary'>.</span>
        </div>
      </Section>

      <Section title='Testo semantico' hint='Famiglia separata dalle superfici: sul chiaro scurisce, sullo scuro schiarisce.'>
        <div className='flex flex-wrap gap-6 text-sm'>
          <span className='text-text-primary'>primario</span>
          <span className='text-text-secondary'>secondario</span>
          <span className='text-text-placeholder'>placeholder</span>
          <span className='text-text-disabled'>disabilitato</span>
          <span className='text-text-link'>link</span>
          <span className='text-text-danger'>danger</span>
          <span className='text-text-success'>success</span>
          <span className='text-text-warning'>warning</span>
          <span className='text-text-info'>info</span>
        </div>
      </Section>

      <Section title='Fondi e bordi' hint='I livelli di superficie su cui poggia tutta l’interfaccia.'>
        <div className='grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8'>
          <Swatch label='bg-base' token='--bg-base' className='bg-bg-base' />
          <Swatch label='bg-primary' token='--bg-primary' className='bg-bg-primary' />
          <Swatch label='bg-secondary' token='--bg-secondary' className='bg-bg-secondary' />
          <Swatch label='bg-modal' token='--bg-modal' className='bg-bg-modal' />
          <Swatch label='bg-info' token='--bg-info' className='bg-bg-info' />
          <Swatch label='bg-hover' token='--bg-hover' className='bg-bg-hover' />
          <Swatch label='bg-selected' token='--bg-selected' className='bg-bg-selected' />
          <Swatch label='bg-contrast' token='--bg-contrast' className='bg-bg-contrast' />
        </div>
      </Section>
    </div>
  );
};

export default ThemePreview;
