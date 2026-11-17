// src/features/vigilo/components/costoMezzi/GraficoAndamento.tsx
//
// Il grafico dell'andamento dei costi di un mezzo (2026-11-17), in quattro
// forme sugli stessi dati:
//   Linee            come varia ogni voce (mese per mese o cumulata)
//   Barre impilate   di che cosa è fatto il costo di ogni mese
//   Aree cumulate    come cresce il totale e quale voce lo spinge
//   Ciambella        la composizione del periodo
// Il mese in corso (solo nel periodo "come la scheda") è parziale: nelle linee
// l'ultimo tratto è tratteggiato con il punto vuoto, nelle barre la colonna è
// chiara, e l'etichetta del mese ha un asterisco spiegato sotto.
// Il suggerimento con i valori compare sul posto con una dissolvenza breve
// (niente scivolamento da un punto all'altro) e il contenitore non lascia
// sbordare niente: niente barre di scorrimento che compaiono e spariscono.
import React from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { COLORI_ANDAMENTO, NOMI_BLOCCHI, type BloccoAndamento as Blocco } from '../../constants/costoMezzi';
import { cumulate, type PuntoAndamento, type VistaAndamento } from '../../hooks/useAndamentoCosti';
import type { AndamentoCosti, TipoGraficoAndamento } from '../../types/costoMezzi';
import { euroBrevi, euroTondi, meseCorto } from '../../utils/resoconti';

const BLOCCHI = Object.keys(COLORI_ANDAMENTO) as Blocco[];

interface Props {
  tipo: TipoGraficoAndamento;
  /** Solo per le linee */
  vista: VistaAndamento;
  dati: AndamentoCosti;
}

const asse = { tickLine: false, axisLine: false, tick: { fontSize: 11, fill: 'var(--color-text-secondary)' } } as const;

interface VoceSuggerimento {
  name?: string | number;
  value?: number | string;
  color?: string;
  dataKey?: string | number;
}

/** La voce di una riga del suggerimento: dalla serie (linee, barre, aree) o dal nome della fetta (ciambella) */
const bloccoDi = (v: VoceSuggerimento): Blocco | undefined =>
  [v.dataKey, v.name].map(k => String(k ?? '').replace('Corso', '')).find((k): k is Blocco => k in NOMI_BLOCCHI);

/** Il suggerimento: titolo e una riga per voce, con dissolvenza a ogni cambio (key) */
const Suggerimento: React.FC<{ active?: boolean; label?: unknown; payload?: VoceSuggerimento[]; titolo: (m: unknown) => string }> = ({ active, label, payload, titolo }) => {
  // la serie "Corso" (ultimo tratto tratteggiato) ripete il valore: una riga per voce
  const voci = (payload ?? []).filter((v, i, tutte) => v.value != null && tutte.findIndex(x => bloccoDi(x) === bloccoDi(v)) === i);
  if (!active || !voci.length) return null;
  return (
    <div key={String(label)} className='animate-comparsa rounded-lg border border-border-default bg-bg-primary px-3 py-2 text-xs shadow-sm'>
      {label !== undefined && <p className='mb-1 font-semibold text-text-primary'>{titolo(label)}</p>}
      {voci.map(v => {
        const b = bloccoDi(v);
        return (
          <p key={b ?? String(v.name)} className='flex items-center gap-2 text-text-secondary'>
            <span className='h-2 w-2 rounded-sm' style={{ background: b ? COLORI_ANDAMENTO[b] : v.color }} aria-hidden='true' />
            {b ? NOMI_BLOCCHI[b] : String(v.name)}
            <span className='ml-auto pl-3 font-medium tabular-nums text-text-primary'>{euroBrevi(Number(v.value))}</span>
          </p>
        );
      })}
    </div>
  );
};

/** I punti mese per mese o cumulati */
const puntiDi = (d: AndamentoCosti, cumulato: boolean): PuntoAndamento[] =>
  cumulato ? cumulate(d.mesi) : d.mesi.map(m => ({ mese: m.mese, possesso: m.possesso, manutenzione: m.manutenzione, uso: m.uso }));

/**
 * Le linee con l'ultimo tratto separato quando l'ultimo mese è in corso:
 * la serie piena si ferma al mese prima, quella "Corso" unisce gli ultimi due
 * punti (tratteggiata).
 */
function conMeseInCorso(punti: PuntoAndamento[], inCorso: boolean) {
  return punti.map((p, i) => {
    const ultimo = i === punti.length - 1;
    const penultimo = i === punti.length - 2;
    const riga: Record<string, number | string | null> = { mese: p.mese };
    for (const b of BLOCCHI) {
      riga[b] = inCorso && ultimo ? null : p[b];
      riga[`${b}Corso`] = inCorso && (ultimo || penultimo) ? p[b] : null;
    }
    return riga;
  });
}

export const GraficoAndamento: React.FC<Props> = ({ tipo, vista, dati }) => {
  const piuAnni = dati.periodo.dal.slice(0, 4) !== dati.periodo.al.slice(0, 4);
  const inCorso = dati.meseInCorso;
  const etichetta = (m: unknown) => `${meseCorto(String(m), piuAnni)}${String(m) === inCorso ? '*' : ''}`;
  const etichettaEstesa = (m: unknown) => `${meseCorto(String(m), true)}${String(m) === inCorso ? ' (in corso)' : ''}`;
  const legenda = <Legend formatter={nome => NOMI_BLOCCHI[nome as Blocco] ?? nome} wrapperStyle={{ fontSize: 12 }} />;
  const assi = (
    <>
      <CartesianGrid vertical={false} stroke='var(--color-border-thin)' />
      <XAxis dataKey='mese' tickFormatter={etichetta} minTickGap={16} {...asse} />
      <YAxis width={80} tickFormatter={v => euroTondi(Number(v))} {...asse} />
      <Tooltip isAnimationActive={false} content={<Suggerimento titolo={etichettaEstesa} />} cursor={{ stroke: 'var(--color-border-default)' }} />
    </>
  );

  let grafico: React.ReactElement;
  if (tipo === 'ciambella') {
    const fette = BLOCCHI.map(b => ({ nome: b, valore: dati.totali[b] })).filter(f => f.valore > 0);
    grafico = (
      <PieChart>
        <Pie data={fette} dataKey='valore' nameKey='nome' innerRadius='56%' outerRadius='80%' paddingAngle={1} isAnimationActive={false}
          label={({ value }) => `${dati.totali.totale ? Math.round((Number(value) / dati.totali.totale) * 100) : 0}%`}>
          {fette.map(f => (
            <Cell key={f.nome} fill={COLORI_ANDAMENTO[f.nome]} />
          ))}
          <Label value={euroTondi(dati.totali.totale)} position='center' style={{ fontSize: 20, fontWeight: 700, fill: 'var(--color-text-primary)' }} />
        </Pie>
        <Tooltip isAnimationActive={false} content={<Suggerimento titolo={() => 'Nel periodo'} />} />
        {legenda}
      </PieChart>
    );
  } else if (tipo === 'barre') {
    grafico = (
      <BarChart data={puntiDi(dati, false)} margin={{ top: 8, right: 16, bottom: 0, left: 8 }}>
        {assi}
        {legenda}
        {BLOCCHI.map(b => (
          <Bar key={b} dataKey={b} stackId='costo' fill={COLORI_ANDAMENTO[b]} isAnimationActive={false}>
            {dati.mesi.map(m => (
              <Cell key={m.mese} fillOpacity={m.mese === inCorso ? 0.4 : 1} />
            ))}
          </Bar>
        ))}
      </BarChart>
    );
  } else if (tipo === 'aree') {
    grafico = (
      <AreaChart data={puntiDi(dati, true)} margin={{ top: 8, right: 16, bottom: 0, left: 8 }}>
        {assi}
        {legenda}
        {BLOCCHI.map(b => (
          <Area key={b} type='monotone' dataKey={b} stackId='costo' stroke={COLORI_ANDAMENTO[b]} fill={COLORI_ANDAMENTO[b]} fillOpacity={0.32} isAnimationActive={false} />
        ))}
      </AreaChart>
    );
  } else {
    const righe = conMeseInCorso(puntiDi(dati, vista === 'cumulato'), !!inCorso);
    grafico = (
      <LineChart data={righe} margin={{ top: 8, right: 16, bottom: 0, left: 8 }}>
        {assi}
        {legenda}
        {BLOCCHI.map(b => (
          <Line key={b} type='monotone' dataKey={b} stroke={COLORI_ANDAMENTO[b]} strokeWidth={2} dot={{ r: 2 }} isAnimationActive={false} />
        ))}
        {/* l'ultimo tratto, verso il mese in corso: tratteggiato, punto vuoto, fuori dalla legenda */}
        {inCorso &&
          BLOCCHI.map(b => (
            <Line
              key={`${b}Corso`}
              type='monotone'
              dataKey={`${b}Corso`}
              stroke={COLORI_ANDAMENTO[b]}
              strokeWidth={2}
              strokeDasharray='4 4'
              dot={{ r: 3, fill: 'var(--color-bg-primary)' }}
              legendType='none'
              isAnimationActive={false}
            />
          ))}
      </LineChart>
    );
  }

  return (
    <>
      {/* alto al massimo 24rem, ma non oltre il 40% della finestra: la finestra dell'andamento non scorre */}
      <div className='h-[min(24rem,40vh)] overflow-hidden' role='img' aria-label={`Andamento dei costi: ${tipo}`}>
        <ResponsiveContainer width='100%' height='100%'>
          {grafico}
        </ResponsiveContainer>
      </div>
      {inCorso && tipo !== 'ciambella' && (
        <p className='text-xs text-text-secondary'>
          * {meseCorto(inCorso, true)} è il mese in corso: i suoi dati arrivano fino a oggi e non sono ancora completi.
        </p>
      )}
    </>
  );
};
