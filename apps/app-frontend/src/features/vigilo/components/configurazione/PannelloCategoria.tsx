// src/features/vigilo/components/configurazione/PannelloCategoria.tsx
//
// Modifica e nuova categoria nel pannello laterale (2026-11-19, passo 4):
// nome, ordine, descrizione, icona (32, in una griglia compatta), contatori
// (km, ore: aggiungendone uno, i soggetti che ci sono lo ricevono) e i campi
// in più che la categoria chiede ai suoi soggetti, uno per riga. In fondo
// che cosa succede ai soggetti che ci sono, e il motivo se il servizio rifiuta
// (es. un contatore che serve a dei controlli a uso).
import React from 'react';
import { Alert, Button, Input, LayoutGrid, Plus, Select, Sheet, Switch, TextArea, Trash2, cn } from '@edg/ui';

import { ICONE_CATEGORIE } from '../../constants/icone';
import { TIPI } from '../../constants/tipiSoggetto';
import { tipoDellaSchedaCategoria, useModificaCategoria, type SchedaCategoria } from '../../hooks/useModificaCategoria';
import { LIMITI_CATEGORIA, TIPI_CAMPO, type Contatore, type TipoCampo } from '../../utils/moduloCategoria';
import { IconaLibreria } from '../IconaLibreria';

interface Props {
  scheda: SchedaCategoria | null;
  aperto: boolean;
  onChiudi: () => void;
  onSalvato: () => void;
}

const Sezione: React.FC<{ titolo: string; azioni?: React.ReactNode; children: React.ReactNode }> = ({ titolo, azioni, children }) => (
  <section className='space-y-3'>
    <div className='flex items-center justify-between gap-2'>
      <h3 className='text-xs font-semibold uppercase tracking-wide text-text-secondary'>{titolo}</h3>
      {azioni}
    </div>
    {children}
  </section>
);

function intestazione(s: SchedaCategoria | null): { titolo: string; sotto?: string } {
  if (!s) return { titolo: 'Categoria' };
  const di = `Categoria di ${TIPI[tipoDellaSchedaCategoria(s)].plurale.toLowerCase()}`;
  if (s.modo === 'nuova') return { titolo: `Nuova categoria · ${TIPI[s.tipo].plurale}`, sotto: `${di} · creata da te` };
  const c = s.categoria;
  return { titolo: `Modifica · ${c.nome}`, sotto: `${di}${c.libreria ? (c.personalizzata ? ' · dalla libreria, personalizzata' : ' · dalla libreria') : ' · creata da te'}` };
}

export const PannelloCategoria: React.FC<Props> = ({ scheda, aperto, onChiudi, onSalvato }) => {
  const x = useModificaCategoria(scheda, aperto, onSalvato);
  const m = x.modulo;
  const c = scheda?.modo === 'modifica' ? scheda.categoria : null;
  const { titolo, sotto } = intestazione(scheda);
  const prossimoId = () => Math.max(0, ...(m?.campi.map(r => r.id) ?? [])) + 1;
  const contatore = (u: Contatore, si: boolean) => m && x.cambia({ contatori: si ? [...m.contatori, u] : m.contatori.filter(k => k !== u) });

  return (
    <Sheet
      isOpen={aperto}
      onOpenChange={o => !o && onChiudi()}
      title={titolo}
      description={sotto}
      className='w-full! sm:max-w-3xl!'
      footer={
        <>
          <Button variant='secondary' onClick={onChiudi} disabled={x.salvando}>
            Annulla
          </Button>
          <Button onClick={() => void x.salva().then(ok => ok && onChiudi())} disabled={!x.cambiato || !x.valido} isLoading={x.salvando} loadingText={x.nuova ? 'Creo…' : 'Salvo…'}>
            {x.nuova ? 'Crea' : 'Salva'}
          </Button>
        </>
      }
    >
      {m && (
        <div className='space-y-6'>
          {c?.libreria && !c.personalizzata && (
            <p className='text-xs text-text-secondary'>
              Viene dalla libreria EDG: modificandola diventa personalizzata, e gli aggiornamenti della libreria ti chiederanno se tenere la tua versione.
            </p>
          )}

          <Sezione titolo='Che cosa'>
            <div className='grid gap-x-4 gap-y-5 sm:grid-cols-3'>
              <div className='sm:col-span-2'>
                <Input label='Nome' value={m.nome} onChange={e => x.cambia({ nome: e.target.value })} error={x.errori.nome} required maxLength={LIMITI_CATEGORIA.nome} />
              </div>
              <Input label='Ordine' inputMode='numeric' value={m.ordine} onChange={e => x.cambia({ ordine: e.target.value })} error={x.errori.ordine} />
              <div className='sm:col-span-3'>
                <TextArea
                  label='Descrizione'
                  value={m.descrizione}
                  onChange={e => x.cambia({ descrizione: e.target.value })}
                  error={x.errori.descrizione}
                  maxLength={LIMITI_CATEGORIA.descrizione}
                  minRows={1}
                  autoResize
                />
              </div>
            </div>
            {/* l'icona: una griglia compatta, la scelta è evidenziata */}
            <div className='flex flex-wrap gap-1' role='radiogroup' aria-label='Icona'>
              {ICONE_CATEGORIE.map(nome => (
                <button
                  key={nome}
                  type='button'
                  role='radio'
                  aria-checked={m.icona === nome}
                  aria-label={nome}
                  title={nome}
                  onClick={() => x.cambia({ icona: m.icona === nome ? null : nome })}
                  className={cn(
                    'rounded-md border p-2 transition-colors',
                    m.icona === nome ? 'border-action-primary bg-action-primary text-action-primary-text' : 'border-border-default text-text-secondary hover:bg-bg-hover'
                  )}
                >
                  <IconaLibreria nome={nome} riserva={LayoutGrid} className='h-4 w-4' />
                </button>
              ))}
            </div>
          </Sezione>

          <Sezione titolo='Contatori'>
            <div className='grid gap-x-4 gap-y-3 sm:grid-cols-2'>
              <Switch label='Chilometri (km)' description='Per veicoli: letture dei km, cadenze a km.' checked={m.contatori.includes('km')} onCheckedChange={v => contatore('km', v)} />
              <Switch label='Ore (contaore)' description='Per macchine: ore motore, cadenze a ore.' checked={m.contatori.includes('ore')} onCheckedChange={v => contatore('ore', v)} />
            </div>
          </Sezione>

          <Sezione
            titolo='Campi in più per i soggetti'
            azioni={
              m.campi.length < LIMITI_CATEGORIA.campi && (
                <Button
                  variant='outline'
                  size='sm'
                  leftIcon={<Plus className='h-4 w-4' />}
                  onClick={() => x.cambia({ campi: [...m.campi, { id: prossimoId(), chiave: null, etichetta: '', tipo: 'testo', opzioni: '', obbligatorio: false }] })}
                >
                  Aggiungi campo
                </Button>
              )
            }
          >
            {m.campi.length === 0 && <p className='text-sm text-text-secondary'>Nessun campo in più: i soggetti hanno solo i dati del loro tipo.</p>}
            {m.campi.map(r => {
              const aggiorna = (v: Partial<typeof r>) => x.cambia({ campi: m.campi.map(k => (k.id === r.id ? { ...k, ...v } : k)) });
              return (
                <div key={r.id} className='flex flex-wrap items-start gap-x-4 gap-y-3'>
                  <div className='grid min-w-0 flex-1 items-center gap-x-4 gap-y-3 sm:grid-cols-4'>
                    <Input label='Nome del campo' value={r.etichetta} onChange={e => aggiorna({ etichetta: e.target.value })} maxLength={LIMITI_CATEGORIA.etichetta} />
                    <Select optionSize='sm' label='Tipo' value={r.tipo} onValueChange={v => aggiorna({ tipo: v as TipoCampo })} options={TIPI_CAMPO} />
                    {r.tipo === 'elenco' ? (
                      <Input label='Opzioni, separate da virgola' value={r.opzioni} onChange={e => aggiorna({ opzioni: e.target.value })} />
                    ) : (
                      <span className='hidden sm:block' />
                    )}
                    <Switch label='Obbligatorio' checked={r.obbligatorio} onCheckedChange={v => aggiorna({ obbligatorio: v })} />
                  </div>
                  <Button variant='outline' size='sm' className='mt-5' aria-label='Togli il campo' onClick={() => x.cambia({ campi: m.campi.filter(k => k.id !== r.id) })}>
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </div>
              );
            })}
            {x.errori.campi && <p className='text-sm text-text-error'>{x.errori.campi}</p>}
          </Sezione>

          {x.errore && (
            <Alert variant='danger' title='Così non si può salvare'>
              {x.errore}
            </Alert>
          )}
          {!x.errore && x.righe.length > 0 && (
            <Alert variant='info' title='Cosa cambia per i soggetti'>
              <ul className='list-disc space-y-0.5 pl-4'>
                {x.righe.map(r => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </Alert>
          )}
        </div>
      )}
    </Sheet>
  );
};
