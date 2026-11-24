// src/features/vigilo/components/configurazione/PannelloControllo.tsx
//
// Modifica, nuovo controllo e duplica nel pannello laterale (2026-11-19,
// passi 2a e 3), a
// sezioni compatte: Che cosa (nome, natura, riferimento, descrizione,
// categorie), Quando (la frase in parole e l'editor della cadenza, passo 2b), Avvisi
// (preavvisi, tolleranza, anche col soggetto sospeso), Registrazione e
// funzionamento (che cosa si chiede, rinnovo, rinviabile, automatico,
// ordine). In fondo "Cosa cambia" sulle scadenze, dall'anteprima del
// servizio, prima di salvare (la cadenza nuova non sposta le date aperte: vale
// dalla prossima registrazione). Un controllo della libreria modificato diventa
// "personalizzato". I destinatari degli avvisi hanno il loro pannello.
import React from 'react';
import { Alert, Button, Input, MultiSelect, Select, Sheet, Switch, TextArea } from '@edg/ui';

import { NATURE_TESTO } from '../../constants/nature';
import { TIPI } from '../../constants/tipiSoggetto';
import { righeEsito, tipoDellaScheda, useModificaControllo, type SchedaControllo } from '../../hooks/useModificaControllo';
import type { Categoria } from '../../types/configurazione';
import type { DatoRegistrazione } from '../../types/scadenze';
import { NATURE, type Natura, type Rinnovo } from '../../types/valori';
import { DATI_REGISTRAZIONE, toccaLeScadenze, type SceltaRegistrazione } from '../../utils/moduloControllo';
import { PreavvisiEditor } from '../PreavvisiEditor';
import { EditorCadenza } from './EditorCadenza';

interface Props {
  /** Modifica, nuovo o duplica */
  scheda: SchedaControllo | null;
  /** Le categorie del suo tipo di soggetto */
  categorie: Categoria[];
  aperto: boolean;
  onChiudi: () => void;
  onSalvato: () => void;
}

const SCELTE_REGISTRAZIONE: { value: SceltaRegistrazione; label: string }[] = [
  { value: 'natura', label: 'Secondo la natura' },
  { value: 'obbligatorio', label: 'Obbligatorio' },
  { value: 'facoltativo', label: 'Facoltativo' },
  { value: 'nascosto', label: 'Non si chiede' },
];

const RINNOVI: { value: Rinnovo; label: string }[] = [
  { value: 'conferma', label: 'Si registra quando è fatto' },
  { value: 'tacito', label: 'Si rinnova da sé (tacito)' },
];

/** Una sezione: titolo piccolo e contenuto */
const Sezione: React.FC<{ titolo: string; children: React.ReactNode }> = ({ titolo, children }) => (
  <section className='space-y-3'>
    <h3 className='text-xs font-semibold uppercase tracking-wide text-text-secondary'>{titolo}</h3>
    {children}
  </section>
);

/** Titolo e sottotitolo secondo il modo */
function intestazione(s: SchedaControllo | null): { titolo: string; sotto?: string } {
  if (!s) return { titolo: 'Controllo' };
  const di = `Controllo di ${TIPI[tipoDellaScheda(s)].plurale.toLowerCase()}`;
  if (s.modo === 'nuovo') return { titolo: `Nuovo controllo · ${TIPI[s.tipo].plurale}`, sotto: `${di} · creato da te` };
  if (s.modo === 'duplica') return { titolo: `Duplica · ${s.controllo.nome}`, sotto: `${di} · la copia è creata da te` };
  const c = s.controllo;
  return { titolo: `Modifica · ${c.nome}`, sotto: `${di}${c.libreria ? (c.personalizzato ? ' · dalla libreria, personalizzato' : ' · dalla libreria') : ' · creato da te'}` };
}

export const PannelloControllo: React.FC<Props> = ({ scheda, categorie, aperto, onChiudi, onSalvato }) => {
  const x = useModificaControllo(scheda, aperto, onSalvato);
  // il controllo che si modifica (null per un nuovo o un duplicato)
  const c = scheda?.modo === 'modifica' ? scheda.controllo : null;
  const tipo = scheda ? tipoDellaScheda(scheda) : null;
  const { titolo, sotto } = intestazione(scheda);
  const m = x.modulo;
  // l'unità a uso della cadenza che si sta scrivendo
  const unitaUso = m?.cadenza.uso?.unita ?? null;
  // la frase della cadenza: come risulterebbe (anteprima) se la si sta cambiando
  const fraseCadenza = x.crea || x.dati.cadenza ? (x.anteprima?.frasi.cadenza ?? '…') : c?.frasi.cadenza;
  // le categorie attive, più quelle già scelte anche se disattivate
  const opzioniCategorie = categorie.filter(k => k.attiva || m?.categorie.includes(k.uuid)).map(k => ({ value: k.uuid, label: k.nome }));

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
          <Button onClick={() => void x.salva().then(ok => ok && onChiudi())} disabled={!x.cambiato || !x.valido || !!x.erroreAnteprima} isLoading={x.salvando} loadingText={x.crea ? 'Creo…' : 'Salvo…'}>
            {x.crea ? 'Crea' : 'Salva'}
          </Button>
        </>
      }
    >
      {tipo && m && (
        <div className='space-y-6'>
          {c?.libreria && !c.personalizzato && (
            <p className='text-xs text-text-secondary'>
              Viene dalla libreria EDG: modificandolo diventa personalizzato, e gli aggiornamenti della libreria ti chiederanno se tenere la tua versione.
            </p>
          )}

          <Sezione titolo='Che cosa'>
            <div className='grid gap-x-4 gap-y-5 sm:grid-cols-3'>
              {/* nome, natura e riferimento sulla stessa riga; descrizione e categorie a tutta larghezza */}
              <Input label='Nome' value={m.nome} onChange={e => x.cambia({ nome: e.target.value })} error={x.errori.nome} required maxLength={128} />
              <Select optionSize='sm' label='Natura' value={m.natura} onValueChange={v => x.cambia({ natura: v as Natura })} options={NATURE.map(n => ({ value: n, label: NATURE_TESTO[n] }))} />
              <Input
                label='Riferimento normativo'
                value={m.riferimentoNormativo}
                onChange={e => x.cambia({ riferimentoNormativo: e.target.value })}
                error={x.errori.riferimentoNormativo}
                maxLength={256}
              />
              <div className='sm:col-span-3'>
                <TextArea
                  label='Descrizione'
                  value={m.descrizione}
                  onChange={e => x.cambia({ descrizione: e.target.value })}
                  error={x.errori.descrizione}
                  maxLength={1024}
                  minRows={1}
                  autoResize
                />
              </div>
              <div className='sm:col-span-3'>
                <MultiSelect
                  label='Categorie'
                  options={opzioniCategorie}
                  value={m.categorie}
                  onChange={v => x.cambia({ categorie: v })}
                  placeholder='Tutte le categorie'
                  helperText={`Nessuna scelta = tutti i soggetti del tipo (${TIPI[tipo].plurale.toLowerCase()}).`}
                />
              </div>
            </div>
          </Sezione>

          <Sezione titolo='Quando'>
            <p className='rounded-lg bg-bg-secondary px-3 py-2 text-sm font-medium text-text-primary'>{fraseCadenza}</p>
            <EditorCadenza cadenza={m.cadenza} tipoSoggetto={tipo} onChange={cadenza => x.cambia({ cadenza })} />
            {x.errori.cadenza && <p className='text-sm text-text-error'>{x.errori.cadenza}</p>}
          </Sezione>

          <Sezione titolo='Avvisi'>
            <div className='space-y-2'>
              <p className='text-sm text-text-secondary'>Preavvisi</p>
              <PreavvisiEditor giorni={m.preavvisiGiorni} onChange={g => x.cambia({ preavvisiGiorni: g })} />
              {unitaUso && <PreavvisiEditor unita={unitaUso} giorni={m.preavvisiUso} onChange={g => x.cambia({ preavvisiUso: g })} />}
            </div>
            <div className='grid items-center gap-x-4 gap-y-5 sm:grid-cols-3'>
              <Input
                label='Tolleranza (giorni)'
                inputMode='numeric'
                value={m.tolleranzaGiorni}
                onChange={e => x.cambia({ tolleranzaGiorni: e.target.value })}
                error={x.errori.tolleranzaGiorni}
                helperText='Dopo la scadenza, prima che sia "scaduta".'
              />
              {unitaUso && (
                <Input
                  label={`Tolleranza (${unitaUso})`}
                  inputMode='numeric'
                  value={m.tolleranzaUso}
                  onChange={e => x.cambia({ tolleranzaUso: e.target.value })}
                  error={x.errori.tolleranzaUso}
                />
              )}
              <Switch label='Avvisa anche se sospeso' checked={m.avvisaAncheSeFermo} onCheckedChange={v => x.cambia({ avvisaAncheSeFermo: v })} />
            </div>
          </Sezione>

          <Sezione titolo='Registrazione e funzionamento'>
            <div className='grid gap-x-4 gap-y-5 sm:grid-cols-3'>
              {DATI_REGISTRAZIONE.map(d => (
                <Select
                  key={d.chiave}
                  optionSize='sm'
                  label={d.nome}
                  value={m.registrazione[d.chiave]}
                  onValueChange={v => x.cambia({ registrazione: { ...m.registrazione, [d.chiave as DatoRegistrazione]: v as SceltaRegistrazione } })}
                  options={SCELTE_REGISTRAZIONE}
                />
              ))}
            </div>
            <div className='grid items-center gap-x-4 gap-y-5 sm:grid-cols-4'>
              <Select optionSize='sm' label='Rinnovo' value={m.rinnovo} onValueChange={v => x.cambia({ rinnovo: v as Rinnovo })} options={RINNOVI} />
              <Switch label='Rinviabile' checked={m.rinviabile} onCheckedChange={v => x.cambia({ rinviabile: v })} />
              <Switch label='Automatico' description='Nasce per ogni soggetto' checked={m.automatico} onCheckedChange={v => x.cambia({ automatico: v })} />
              <Input label='Ordine' inputMode='numeric' value={m.ordine} onChange={e => x.cambia({ ordine: e.target.value })} error={x.errori.ordine} />
            </div>
          </Sezione>

          {/* che cosa succede alle scadenze, prima di salvare */}
          {x.erroreAnteprima && (
            <Alert variant='danger' title='Così non si può salvare'>
              {x.erroreAnteprima}
            </Alert>
          )}
          {x.crea && !x.erroreAnteprima && (
            <Alert variant='info' title='Che cosa nasce'>
              {x.leggoAnteprima || !x.anteprima
                ? 'Calcolo…'
                : !m.automatico
                  ? 'Nessuna scadenza nasce da sola: si aggiungono dai soggetti.'
                  : x.anteprima.scadenzeCreate
                    ? `Nascono ${x.anteprima.scadenzeCreate === 1 ? '1 scadenza' : `${x.anteprima.scadenzeCreate} scadenze`}, una per ogni soggetto a cui si applica.`
                    : 'Nessun soggetto a cui si applica, per ora: le scadenze nasceranno con i soggetti.'}
            </Alert>
          )}
          {!x.crea && x.cambiato && !x.erroreAnteprima && (
            <Alert variant='info' title='Cosa cambia'>
              {!toccaLeScadenze(x.dati) ? (
                'Le scadenze non cambiano: si aggiornano solo le informazioni del controllo.'
              ) : x.leggoAnteprima || !x.anteprima ? (
                'Calcolo…'
              ) : (
                <ul className='list-disc space-y-0.5 pl-4'>
                  {righeEsito(x.anteprima).map(r => (
                    <li key={r}>{r}</li>
                  ))}
                  {/* la cadenza nuova non sposta le date aperte (decisione dell'utente, 2026-11-19) */}
                  {x.dati.cadenza != null && x.anteprima.scadenzeAperte > 0 && (
                    <li>
                      {x.anteprima.scadenzeAperte === 1 ? 'la scadenza aperta tiene la sua data' : `le ${x.anteprima.scadenzeAperte} scadenze aperte tengono la loro data`}: la
                      nuova cadenza vale dalla prossima registrazione
                    </li>
                  )}
                  {!righeEsito(x.anteprima).length && x.dati.cadenza == null && <li>nessuna delle {x.anteprima.scadenzeAperte} scadenze aperte cambia</li>}
                  <li>le scadenze già registrate restano come sono</li>
                </ul>
              )}
            </Alert>
          )}
        </div>
      )}
    </Sheet>
  );
};
