// src/features/vigilo/utils/aggiornamenti.ts
//
// Gli aggiornamenti della libreria in parole (B10b): il valore di un campo
// (il servizio scrive già cadenza, preavvisi, tolleranza e categorie), la
// scelta preselezionata (libreria se intatto, il tuo se personalizzato: la
// stessa regola del servizio) e il riassunto di una voce.
import { DATI_REGISTRAZIONE, ESITI_STORICO, ETICHETTE_CAMPI } from '../constants/aggiornamenti';
import { NATURE_TESTO } from '../constants/nature';
import type { CampoDeciso, CampoProposto, EntitaAggiornamento, RigaStoricoLibreria, Scelta, VoceAggiornamento } from '../types/aggiornamenti';
import type { CampoAggiuntivo } from '../types/configurazione';
import type { Destinatario } from '../types/destinatari';
import type { DatoRegistrazione, Richiesta } from '../types/scadenze';
import { fraseDestinatari } from './destinatari';

/** "a", "a e b", "a, b e c" */
export const elenco = (v: string[]): string => (v.length < 2 ? (v[0] ?? '') : `${v.slice(0, -1).join(', ')} e ${v[v.length - 1]}`);

export const etichettaCampo = (campo: string): string => ETICHETTE_CAMPI[campo] ?? campo;

function registrazione(r: Partial<Record<DatoRegistrazione, Richiesta>> | null): string {
  const voci = Object.entries(r ?? {}) as [DatoRegistrazione, Richiesta][];
  const con = (q: Richiesta) => voci.filter(([, v]) => v === q).map(([k]) => DATI_REGISTRAZIONE[k] ?? k);
  const parti = [
    con('obbligatorio').length ? `chiede ${elenco(con('obbligatorio'))}` : null,
    con('facoltativo').length ? `facoltativi ${elenco(con('facoltativo'))}` : null,
    con('nascosto').length ? `non chiede ${elenco(con('nascosto'))}` : null,
  ].filter(Boolean);
  return parti.length ? parti.join(' · ') : 'i dati di sempre';
}

/** Il valore di un campo in parole */
export function testoValore(campo: string, valore: unknown, testo?: string): string {
  if (testo !== undefined) return testo;
  switch (campo) {
    case 'nome':
    case 'riferimentoNormativo':
      return (valore as string | null) || '—';
    case 'descrizione':
      return (valore as string | null) || 'nessuna';
    case 'natura':
      return NATURE_TESTO[valore as keyof typeof NATURE_TESTO] ?? String(valore);
    case 'automatico':
      return valore ? 'si creano da sole sui soggetti delle categorie' : 'si aggiungono a mano';
    case 'destinatari':
      return fraseDestinatari((valore as Destinatario[] | null) ?? []);
    case 'rinnovo':
      return valore === 'tacito' ? 'tacito: alla scadenza si rinnova da solo' : 'da confermare a ogni scadenza';
    case 'rinviabile':
      return valore ? 'si può rinviare' : 'non si può rinviare';
    case 'registrazione':
      return registrazione(valore as Partial<Record<DatoRegistrazione, Richiesta>> | null);
    case 'icona':
      return (valore as string | null) || 'nessuna';
    case 'campi': {
      const campi = ((valore as CampoAggiuntivo[] | null) ?? []).slice().sort((a, b) => a.ordine - b.ordine);
      return campi.length ? elenco(campi.map(c => (c.obbligatorio ? `${c.etichetta} (obbligatorio)` : c.etichetta))) : 'nessuno';
    }
    case 'contatori':
      return elenco((valore as string[] | null) ?? []) || 'nessuno';
    default:
      return valore == null ? '—' : typeof valore === 'object' ? JSON.stringify(valore) : String(valore);
  }
}

/** La scelta proposta: libreria se il campo è intatto, il tuo se l'hai personalizzato */
export const sceltaPredefinita = (c: Pick<CampoProposto, 'stato'>): Scelta => (c.stato === 'intatto' ? 'libreria' : 'mio');

export const scelteIniziali = (campi: CampoProposto[]): Record<string, Scelta> => Object.fromEntries(campi.map(c => [c.campo, sceltaPredefinita(c)]));

/** "cadenza, preavvisi e tolleranza" · "ritirata dalla libreria" · "nessuna differenza con i tuoi valori" */
export function riassuntoVoce(v: VoceAggiornamento): string {
  if (v.tipo === 'ritiro') return v.entita === 'categoria' ? 'ritirata dalla libreria' : 'ritirato dalla libreria';
  if (!v.campi.length) return 'nessuna differenza con i tuoi valori';
  return elenco(v.campi.map(c => etichettaCampo(c.campo).toLowerCase()));
}

/** Testo del riquadro: "3 voci con una nuova versione e 1 ritirata" */
export function fraseRiquadro(aggiornamenti: number, ritiri: number): string {
  const a = aggiornamenti ? `${aggiornamenti} ${aggiornamenti === 1 ? 'voce con una nuova versione' : 'voci con una nuova versione'}` : null;
  const r = ritiri ? `${ritiri} ${ritiri === 1 ? 'ritirata' : 'ritirate'}` : null;
  return elenco([a, r].filter((x): x is string => !!x));
}

/** Il titolo di una riga dello storico, col genere della voce ("Preso dalla libreria all’avvio", "Ritirato dalla libreria: tenuto") */
export function titoloStorico(r: RigaStoricoLibreria, entita: EntitaAggiornamento): string {
  const g = entita === 'controllo' ? 'o' : 'a';
  const ritiro = r.campi.find(c => c.campo === 'ritirata');
  if (ritiro) return `Ritirat${g} dalla libreria: ${ritiro.scelto === 'libreria' ? `disattivat${g}` : `tenut${g}`}`;
  if (r.esito === 'incluso') return `Pres${g} dalla libreria all’avvio`;
  if (r.esito === 'escluso') return `Lasciat${g} fuori all’avvio`;
  return ESITI_STORICO[r.esito] ?? r.esito;
}

/** "presa la libreria: avvisi a 64, 32 e 8 giorni (era: avvisi a 16 e 4 giorni)" */
export function fraseCampoDeciso(c: CampoDeciso): string {
  const mio = testoValore(c.campo, c.mio, c.testoMio);
  const lib = testoValore(c.campo, c.libreria, c.testoLibreria);
  return c.scelto === 'libreria' ? `presa la libreria: ${lib} (era: ${mio})` : `tenuto il tuo: ${mio} (proposto: ${lib})`;
}
