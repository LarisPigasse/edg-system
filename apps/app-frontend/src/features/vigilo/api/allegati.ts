// src/features/vigilo/api/allegati.ts
//
// I documenti (B9a). Elenco ed eliminazione passano dal client comune; il
// caricamento usa XMLHttpRequest per la barra di avanzamento (fetch non la
// dà) e il multipart (apiFetch imposta JSON); aprire e scaricare leggono il
// file come blob con il token, perché un collegamento diretto non porterebbe
// l'accesso. Se il token è scaduto, una chiamata con apiFetch lo rinnova e
// si riprova una volta.
import { apiFetch, getAuthToken } from '@edg/auth';

import { VITA_ANTEPRIMA_MS } from '../constants/allegati';
import type { ElencoAllegati, EntitaAllegato, VoceAllegato } from '../types/allegati';
import { leggi, richiesta } from './client';

const BASE = '/api/vigilo/allegati';

export const leggiAllegati = (entita: EntitaAllegato, id: string) => leggi<ElencoAllegati>(`/allegati?entita=${entita}&id=${id}`);

export const eliminaAllegato = (uuid: string) => richiesta<unknown>(`/allegati/${uuid}`, 'DELETE');

/** Rinnova il token se serve (apiFetch lo fa da sé su un 401) */
const rinnovaAccesso = () => apiFetch('/api/vigilo/me').catch(() => undefined);

const messaggioDi = (testo: string, stato: number): string => {
  try {
    const j = JSON.parse(testo);
    return j.message ?? j.error ?? `Errore ${stato}`;
  } catch {
    return stato === 413 ? 'File troppo grande' : `Errore ${stato}`;
  }
};

function invia(dati: FormData, onAvanzamento: (x: number) => void): Promise<{ stato: number; testo: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', BASE);
    const token = getAuthToken();
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.upload.onprogress = e => e.lengthComputable && onAvanzamento(e.loaded / e.total);
    xhr.onload = () => resolve({ stato: xhr.status, testo: xhr.responseText });
    xhr.onerror = () => reject(new Error('Connessione non riuscita'));
    xhr.onabort = () => reject(new Error('Caricamento annullato'));
    xhr.send(dati);
  });
}

export async function caricaAllegato(
  entita: EntitaAllegato,
  id: string,
  file: File,
  onAvanzamento: (x: number) => void = () => {},
  descrizione?: string
): Promise<VoceAllegato> {
  const dati = () => {
    const d = new FormData();
    // prima i campi, poi il file
    d.append('entita', entita);
    d.append('id', id);
    if (descrizione) d.append('descrizione', descrizione);
    d.append('file', file, file.name);
    return d;
  };
  let r = await invia(dati(), onAvanzamento);
  if (r.stato === 401) {
    await rinnovaAccesso();
    r = await invia(dati(), onAvanzamento);
  }
  if (r.stato < 200 || r.stato >= 300) throw new Error(messaggioDi(r.testo, r.stato));
  return JSON.parse(r.testo).data as VoceAllegato;
}

async function blobDi(uuid: string): Promise<Blob> {
  const chiedi = () => fetch(`${BASE}/${uuid}`, { cache: 'no-store', headers: { Authorization: `Bearer ${getAuthToken() ?? ''}` } });
  let r = await chiedi();
  if (r.status === 401) {
    await rinnovaAccesso();
    r = await chiedi();
  }
  if (!r.ok) throw new Error(messaggioDi(await r.text(), r.status));
  return r.blob();
}

/** Fa scaricare un blob già letto, con il nome del documento */
function salva(url: string, nome: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = nome;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

/**
 * Apre il documento in una nuova scheda. La scheda si apre subito, nel clic
 * (altrimenti il browser la bloccherebbe), e riceve il file appena arriva.
 * Se il browser blocca comunque la scheda, il documento si scarica: la
 * pagina dell'app non si perde.
 */
export async function apriAllegato(a: VoceAllegato): Promise<void> {
  const scheda = window.open('', '_blank');
  try {
    const url = URL.createObjectURL(await blobDi(a.uuid));
    if (scheda) scheda.location.href = url;
    else salva(url, a.nome);
    setTimeout(() => URL.revokeObjectURL(url), VITA_ANTEPRIMA_MS);
  } catch (e) {
    scheda?.close();
    throw e;
  }
}

/** Scarica il documento con il suo nome */
export async function scaricaAllegato(a: VoceAllegato): Promise<void> {
  const url = URL.createObjectURL(await blobDi(a.uuid));
  salva(url, a.nome);
  setTimeout(() => URL.revokeObjectURL(url), VITA_ANTEPRIMA_MS);
}
