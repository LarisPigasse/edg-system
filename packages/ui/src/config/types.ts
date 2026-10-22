// packages/ui/src/config/types.ts
import type { ReactNode } from 'react';
import type { LucideIcon } from '../utils/icons';
import type { ThemedImageKey } from '../hooks/useThemedImage';

/** Identità dell'applicazione ospite: nome, claim, copyright, versione. */
export interface EdgAppConfig {
  sigla: string;
  coloreSigla: string;
  name: string;
  titolo: string;
  colore: string;
  tagline?: string;
  copyright: string;
  version: string;
  /**
   * Icona del marchio, come chiave di `THEMED_IMAGES`: la variante chiara o
   * scura viene scelta dal tema attivo. È l'unico elemento grafico che
   * distingue un frontend dall'altro — 'icon' per il portale utenti,
   * 'iconPro' per il gestionale. Se assente vale 'icon'.
   */
  icon?: ThemedImageKey;
}

/** Voce di sottomenu di un modulo. */
export interface EdgSubMenuItem {
  id: string;
  label: string;
  href: string;
  /** Permesso richiesto per vedere la voce. Assente = sempre visibile. */
  permission?: string;
}

/** Modulo applicativo mostrato nella barra di navigazione. */
export interface EdgModuleConfig {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  children?: EdgSubMenuItem[];
  /** Permesso richiesto per vedere il modulo. Assente = sempre visibile. */
  permission?: string;
  /**
   * Titolo del modulo nell'header, quando si è dentro il modulo: compare a
   * sinistra nella seconda riga, sotto il logo dell'app (es. il titolo di
   * ADR054 reso con ModuleBrand). Assente = nessun titolo.
   */
  brand?: ReactNode;
}

/**
 * Rotte che il design system deve conoscere per costruire i propri link.
 * Ogni applicazione le mappa sui propri path.
 */
export interface EdgRoutes {
  home: string;
  login: string;
  forgotPassword: string;
  settings: string;
  changePassword: string;
  profile: string;
  notFound: string;
  terms: string;
  support: string;
}

/** Parametri di resa del layout. */
export interface EdgLayoutConfig {
  /** Chiave dell'immagine di sfondo in THEMED_IMAGES (es. 'bg'). */
  backgroundImage: ThemedImageKey;
  /** Classe del colore che vela lo sfondo nelle pagine interne. */
  innerPageBgColor: string;
  /** Classe di opacità del velo. */
  innerPageBgOpacity: string;
  /** Classe di z-index del velo. */
  innerPageBgZIndex: string;
  /** Mostra il footer. */
  footerEnabled: boolean;
}

/**
 * L'utente collegato, come lo mostra l'header (ADR081): nome della persona e,
 * sotto, l'entità a cui appartiene (il tenant). Lo calcola l'applicazione
 * (es. con @edg/auth): @edg/ui non conosce l'autenticazione.
 */
export interface EdgUser {
  name: string;
  entity?: string | null;
  /** Iniziali per l'avatar */
  initials: string;
}

/** Colore di un avviso: il pallino e, se da leggere, il numero sulla campanella */
export type EdgNotificationTone = 'default' | 'warning' | 'danger';

/** Un avviso della campanella, già tradotto dall'applicazione (ADR091) */
export interface EdgNotification {
  /** Unico fra tutte le sorgenti (es. 'vigilo:<uuid>') */
  id: string;
  /** Prima riga (in grassetto se da leggere) */
  text: string;
  /** Seconda riga, facoltativa (es. soggetto e stato) */
  detail?: string;
  /** Da dove arriva (es. 'Vigilo'), sotto il testo */
  source?: string;
  tone?: EdgNotificationTone;
  /** Da leggere */
  unread: boolean;
  /** Non serve più (es. scadenza già registrata): in grigio */
  resolved?: boolean;
  /** Quando è nato, ISO */
  date: string;
  /** Dove porta il clic; assente = il clic lo segna soltanto come letto */
  href?: string;
}

/**
 * La campanella dell'header. Dati e azioni li dà l'applicazione (es. unendo
 * le sorgenti dei moduli); @edg/ui la disegna e, al clic su una voce, porta
 * all'indirizzo della voce. Assente = nessuna campanella.
 */
export interface EdgNotifications {
  items: EdgNotification[];
  /** Da leggere in tutto (anche oltre le voci mostrate) */
  unread: number;
  loading?: boolean;
  error?: string | null;
  /** Il pannello si apre: occasione per rileggere */
  onOpen?: () => void;
  /** Clic su una voce (di norma: segnarla come letta) */
  onSelect?: (item: EdgNotification) => void;
  /** "Segna tutti come letti"; assente = nessun pulsante */
  onReadAll?: () => void;
  /** Collegamento in fondo al pannello (es. le preferenze degli avvisi) */
  footer?: { label: string; href: string };
}

/** Configurazione completa che l'applicazione consegna a @edg/ui. */
export interface EdgConfig {
  app: EdgAppConfig;
  routes: EdgRoutes;
  modules: EdgModuleConfig[];
  layout: EdgLayoutConfig;
  /** Utente collegato; assente o null = nessuno (es. prima del login) */
  user?: EdgUser | null;
  /** Campanella degli avvisi; assente o null = nessuna campanella */
  notifications?: EdgNotifications | null;
}

/** Valore restituito da `useEdgConfig`: la configurazione più gli helper derivati. */
export interface EdgConfigValue extends EdgConfig {
  /** Modulo attivo per il pathname corrente, o null. */
  getActiveModule: (pathname: string) => EdgModuleConfig | null;
  /** True se il pathname corrisponde alla home. */
  isHomeActive: (pathname: string) => boolean;
}
