// packages/ui/src/config/types.ts
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

/** Configurazione completa che l'applicazione consegna a @edg/ui. */
export interface EdgConfig {
  app: EdgAppConfig;
  routes: EdgRoutes;
  modules: EdgModuleConfig[];
  layout: EdgLayoutConfig;
}

/** Valore restituito da `useEdgConfig`: la configurazione più gli helper derivati. */
export interface EdgConfigValue extends EdgConfig {
  /** Modulo attivo per il pathname corrente, o null. */
  getActiveModule: (pathname: string) => EdgModuleConfig | null;
  /** True se il pathname corrisponde alla home. */
  isHomeActive: (pathname: string) => boolean;
}
