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
