// src/features/vigilo/api/file.ts
//
// Leggere un file dal servizio con il token (documenti, CSV delle spese): un
// collegamento diretto non porterebbe l'accesso, quindi si legge come blob e
// si fa scaricare. Se il token è scaduto, una chiamata con apiFetch lo
// rinnova e si riprova una volta. Gli errori arrivano in italiano dal
// servizio.
import { apiFetch, getAuthToken } from '@edg/auth';

/** Rinnova il token se serve (apiFetch lo fa da sé su un 401) */
export const rinnovaAccesso = () => apiFetch('/api/vigilo/me').catch(() => undefined);

/** Il messaggio d'errore della risposta (JSON del servizio) o uno generico */
export const messaggioDi = (testo: string, stato: number): string => {
  try {
    const j = JSON.parse(testo);
    return j.message ?? j.error ?? `Errore ${stato}`;
  } catch {
    return stato === 413 ? 'File troppo grande' : `Errore ${stato}`;
  }
};

/** Il nome del file dall'intestazione Content-Disposition (filename* in UTF-8 prima) */
export function nomeDaIntestazione(valore: string | null): string | null {
  if (!valore) return null;
  const utf8 = /filename\*=UTF-8''([^;]+)/i.exec(valore);
  if (utf8) return decodeURIComponent(utf8[1]);
  return /filename="?([^";]+)"?/i.exec(valore)?.[1] ?? null;
}

/** Il file come blob, con il nome che dà il servizio */
export async function fileConAccesso(url: string): Promise<{ blob: Blob; nome: string | null }> {
  const chiedi = () => fetch(url, { cache: 'no-store', headers: { Authorization: `Bearer ${getAuthToken() ?? ''}` } });
  let r = await chiedi();
  if (r.status === 401) {
    await rinnovaAccesso();
    r = await chiedi();
  }
  if (!r.ok) throw new Error(messaggioDi(await r.text(), r.status));
  return { blob: await r.blob(), nome: nomeDaIntestazione(r.headers.get('content-disposition')) };
}

/** Fa scaricare un indirizzo (di solito un blob già letto) con il nome dato */
export function salvaFile(url: string, nome: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = nome;
  document.body.appendChild(link);
  link.click();
  link.remove();
}
