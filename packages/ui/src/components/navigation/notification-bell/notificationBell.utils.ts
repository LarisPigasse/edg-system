// packages/ui/src/components/navigation/notification-bell/notificationBell.utils.ts
//
// Helper puri della campanella: il numero sul pulsante e il "quando" delle voci.

/** Oltre questo il numero diventa "64+": la campanella resta piccola */
export const BADGE_MAX = 64;

export const badgeText = (n: number): string => (n > BADGE_MAX ? `${BADGE_MAX}+` : String(n));

const ora = (d: Date) => d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
const stessoGiorno = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** "adesso", "8 min fa", "oggi alle 08:16", "ieri alle 18:04", "16 ott", "16 ott 2025" */
export function relativeTime(iso: string, now: Date = new Date()): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const minuti = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (minuti < 1) return 'adesso';
  if (minuti < 60) return `${minuti} min fa`;
  if (stessoGiorno(d, now)) return `oggi alle ${ora(d)}`;
  const ieri = new Date(now);
  ieri.setDate(now.getDate() - 1);
  if (stessoGiorno(d, ieri)) return `ieri alle ${ora(d)}`;
  return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', ...(d.getFullYear() !== now.getFullYear() ? { year: 'numeric' } : {}) });
}
