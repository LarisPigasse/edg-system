// src/features/vigilo/components/soggetto/FormSoggetto.tsx
//
// Il modulo di un soggetto, per il nuovo e per la modifica: identità,
// collocazione (categoria, sede, referente), dati del tipo, campi aggiuntivi
// della categoria, note. Campi controllati: i valori stanno in chi lo usa.
import React from 'react';
import { Input, Select, TextArea } from '@edg/ui';

import { DATI_TIPO } from '../../constants/datiTipo';
import { TIPI } from '../../constants/tipiSoggetto';
import type { Riferimenti } from '../../hooks/useRiferimenti';
import type { TipoSoggetto } from '../../types/valori';
import { campiDi, type ValoreCampo, type ValoriSoggetto } from '../../utils/formSoggetto';
import { CampoDato } from './CampoDato';

const NESSUNO = '__nessuno';
const GRIGLIA = 'grid gap-x-6 gap-y-4 sm:grid-cols-2 xl:grid-cols-3';

const Sezione: React.FC<{ titolo: string; children: React.ReactNode }> = ({ titolo, children }) => (
  <section className='space-y-3'>
    <h3 className='text-sm font-semibold text-text-primary'>{titolo}</h3>
    {children}
  </section>
);

interface Props {
  tipo: TipoSoggetto;
  valori: ValoriSoggetto;
  onValori: (v: ValoriSoggetto) => void;
  riferimenti: Riferimenti;
  /** Nella modifica la categoria si cambia qui; nel nuovo si sceglie al passo prima */
  conCategoria?: boolean;
  /** Il soggetto stesso, da togliere fra sedi e referenti */
  escludi?: string;
}

export const FormSoggetto: React.FC<Props> = ({ tipo, valori: v, onValori, riferimenti: r, conCategoria = false, escludi }) => {
  const t = TIPI[tipo];
  const imposta = <K extends keyof ValoriSoggetto>(k: K, x: ValoriSoggetto[K]) => onValori({ ...v, [k]: x });
  const dato = (chiave: string) => (x: ValoreCampo) => imposta('dati', { ...v.dati, [chiave]: String(x) });
  const campo = (chiave: string) => (x: ValoreCampo) => imposta('campi', { ...v.campi, [chiave]: x });
  const scelta = (x: string) => (x === NESSUNO ? null : x);
  const campi = campiDi(r.tutteLeCategorie, v.categoria);
  const categoria = r.tutteLeCategorie.find(c => c.uuid === v.categoria);
  const conSede = tipo !== 'sede' && tipo !== 'azienda' && r.sedi.length > 0;
  const conReferente = tipo !== 'azienda' && r.persone.length > 0;

  return (
    <div className='space-y-8'>
      <Sezione titolo='Identità'>
        <div className={GRIGLIA}>
          <Input label='Nome' required value={v.nome} onChange={e => imposta('nome', e.target.value)} maxLength={128} />
          <Input label={t.identificativo} value={v.identificativo} onChange={e => imposta('identificativo', e.target.value)} maxLength={64} />
          <Input label='Codice interno' value={v.codice} onChange={e => imposta('codice', e.target.value)} maxLength={32} />
        </div>
      </Sezione>

      {(conCategoria || conSede || conReferente) && (
        <Sezione titolo='Collocazione'>
          <div className={GRIGLIA}>
            {conCategoria && (
              <Select
                label='Categoria'
                value={v.categoria ?? NESSUNO}
                onValueChange={x => imposta('categoria', scelta(x))}
                options={[{ value: NESSUNO, label: 'Nessuna categoria' }, ...r.categorieDel(tipo).map(c => ({ value: c.uuid, label: c.nome }))]}
              />
            )}
            {conSede && (
              <Select
                label='Sede'
                value={v.sede ?? NESSUNO}
                onValueChange={x => imposta('sede', scelta(x))}
                options={[{ value: NESSUNO, label: 'Nessuna' }, ...r.sedi.filter(s => s.uuid !== escludi).map(s => ({ value: s.uuid, label: s.nome }))]}
              />
            )}
            {conReferente && (
              <Select
                label='Referente'
                value={v.referente ?? NESSUNO}
                onValueChange={x => imposta('referente', scelta(x))}
                options={[{ value: NESSUNO, label: 'Nessuno' }, ...r.persone.filter(p => p.uuid !== escludi).map(p => ({ value: p.uuid, label: p.nome }))]}
              />
            )}
          </div>
        </Sezione>
      )}

      <Sezione titolo={`Dati ${t.femminile ? 'della' : 'del'} ${t.singolare}`}>
        <div className={GRIGLIA}>
          {DATI_TIPO[tipo].map(d => (
            <CampoDato key={d.chiave} etichetta={d.etichetta} formato={d.formato} opzioni={d.opzioni} valore={v.dati[d.chiave]} onCambia={dato(d.chiave)} />
          ))}
        </div>
      </Sezione>

      {campi.length > 0 && (
        <Sezione titolo={`Campi della categoria ${categoria?.nome ?? ''}`}>
          <div className={GRIGLIA}>
            {campi.map(c => (
              <CampoDato
                key={c.chiave}
                etichetta={c.etichetta}
                formato={c.tipo}
                opzioni={c.opzioni}
                obbligatorio={c.obbligatorio}
                valore={v.campi[c.chiave]}
                onCambia={campo(c.chiave)}
              />
            ))}
          </div>
        </Sezione>
      )}

      <Sezione titolo='Note'>
        <TextArea label='Note' value={v.note} onChange={e => imposta('note', e.target.value)} maxLength={4096} minRows={2} />
      </Sezione>
    </div>
  );
};
