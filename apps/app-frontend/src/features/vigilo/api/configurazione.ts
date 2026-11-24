// src/features/vigilo/api/configurazione.ts — categorie e controlli del cliente
import type { Categoria, Controllo } from '../types/configurazione';
import { leggiTutti, richiesta } from './client';

export const leggiCategorie = () => leggiTutti<Categoria>('/categorie?ordina=ordine');
export const leggiControlli = () => leggiTutti<Controllo>('/controlli?ordina=ordine');

/** Che cosa è successo alle scadenze cambiando un controllo */
export interface EsitoControllo {
  scadenzeChiuse: number;
  /** Riattivazione: riaperte con le loro date */
  scadenzeRiaperte: number;
  scadenzeCreate: number;
}

/** Disattiva o riattiva un controllo (vigilo.config) */
export const attivaControllo = async (uuid: string, attivo: boolean) => (await richiesta<Controllo & EsitoControllo>(`/controlli/${uuid}`, 'PATCH', { attivo })).data;

/** Disattiva o riattiva una categoria (vigilo.config): i soggetti che ci sono restano com'erano */
export const attivaCategoria = async (uuid: string, attiva: boolean) => (await richiesta<Categoria>(`/categorie/${uuid}`, 'PATCH', { attiva })).data;

/** Modifica di un controllo: solo i campi cambiati (vigilo.config); risponde con il controllo e l'esito sulle scadenze */
export const modificaControllo = async (uuid: string, dati: Record<string, unknown>) =>
  (await richiesta<Controllo & EsitoControllo & { scadenzeRicalcolate: number }>(`/controlli/${uuid}`, 'PATCH', dati)).data;

/** Che cosa cambierebbe salvando la modifica, senza salvarla */
export interface AnteprimaControllo extends EsitoControllo {
  scadenzeRicalcolate: number;
  scadenzeAperte: number;
  /** Cadenza, preavvisi e tolleranza in parole, come risulterebbero */
  frasi: { cadenza: string; preavvisi: string; tolleranza: string };
}
export const anteprimaControllo = async (uuid: string, dati: Record<string, unknown>) =>
  (await richiesta<AnteprimaControllo>(`/controlli/${uuid}/anteprima`, 'POST', dati)).data;

/** Nuovo controllo (anche duplicato da un altro): risponde con il controllo e quante scadenze sono nate */
export const creaControllo = async (dati: Record<string, unknown>) =>
  (await richiesta<Controllo & { scadenzeCreate: number }>('/controlli', 'POST', dati)).data;

/** Che cosa succederebbe creando il controllo, senza crearlo */
export const anteprimaCreazione = async (dati: Record<string, unknown>) =>
  (await richiesta<{ scadenzeCreate: number; frasi: AnteprimaControllo['frasi'] }>('/controlli/anteprima', 'POST', dati)).data;

/** Nuova categoria (vigilo.config) */
export const creaCategoria = async (dati: Record<string, unknown>) => (await richiesta<Categoria>('/categorie', 'POST', dati)).data;

/** Modifica di una categoria: solo i campi cambiati (vigilo.config) */
export const modificaCategoria = async (uuid: string, dati: Record<string, unknown>) => (await richiesta<Categoria>(`/categorie/${uuid}`, 'PATCH', dati)).data;

/** Elimina per sempre un controllo senza scadenze o una categoria senza soggetti (vigilo.config) */
export const eliminaControllo = async (uuid: string) => {
  await richiesta(`/controlli/${uuid}`, 'DELETE');
};
export const eliminaCategoria = async (uuid: string) => {
  await richiesta(`/categorie/${uuid}`, 'DELETE');
};
