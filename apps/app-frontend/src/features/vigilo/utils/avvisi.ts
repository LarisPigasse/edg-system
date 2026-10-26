// src/features/vigilo/utils/avvisi.ts
//
// Un avviso di Vigilo come voce della campanella (ADR091): titolo sopra,
// soggetto e stato sotto; pallino rosso, arancio o normale come i colori
// della dashboard; il clic porta alla scadenza (scheda del soggetto, o
// elenco delle scadenze per un promemoria) con il pannello già aperto
// (?scadenza=).
import type { EdgNotificationTone } from '@edg/ui';

import type { ModuleNotification } from '../../../core/notifications';
import type { TonoAvviso, VoceAvviso } from '../types/avvisi';

const TONO: Record<TonoAvviso, EdgNotificationTone> = { pericolo: 'danger', attenzione: 'warning', normale: 'default' };

/** "Iveco S-Way 01 (GH128KM) · scade tra 2 giorni · 24 ott" */
export const dettaglioAvviso = (v: VoceAvviso) => {
  const chi = v.soggetto ? `${v.soggetto.nome}${v.soggetto.identificativo ? ` (${v.soggetto.identificativo})` : ''}` : null;
  return [chi, v.stato].filter(Boolean).join(' · ');
};

/** Dove si apre una scadenza: scheda del soggetto, o elenco se non ha soggetto */
export const percorsoScadenza = (base: string, scadenza: string, soggetto?: string | null) =>
  soggetto ? `${base}/soggetti/${soggetto}?scadenza=${scadenza}` : `${base}/scadenze?scadenza=${scadenza}`;

/** Quando è nato un avviso: "oggi, 08:16", "ieri, 18:02", "24 ott, 08:16" (con l'anno se non è quest'anno) */
export function quandoAvviso(iso: string, adesso = new Date()): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const ora = d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  const giorno = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const fa = Math.round((giorno(adesso) - giorno(d)) / 86400000);
  if (fa === 0) return `oggi, ${ora}`;
  if (fa === 1) return `ieri, ${ora}`;
  const data = d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', ...(d.getFullYear() !== adesso.getFullYear() ? { year: 'numeric' } : {}) });
  return `${data}, ${ora}`;
}

export const notificaDi = (v: VoceAvviso, base: string): ModuleNotification => ({
  id: v.uuid,
  text: v.titolo,
  detail: dettaglioAvviso(v),
  tone: TONO[v.tono] ?? 'default',
  unread: v.consegna === 'inviato',
  resolved: v.consegna === 'risolto',
  date: v.creatoIl,
  href: v.scadenza ? percorsoScadenza(base, v.scadenza.uuid, v.soggetto?.uuid) : undefined,
});
