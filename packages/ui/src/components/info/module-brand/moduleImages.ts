// Immagini dei moduli trovate da un frontend (ADR054)
//
// Ogni frontend raccoglie le sue con import.meta.glob (che Vite risolve solo
// nel codice dell'applicazione, non in un pacchetto condiviso) e le passa qui:
//
//   const files = import.meta.glob<string>('./*/*.png', { eager: true, query: '?url', import: 'default' });
//   export const MODULE_IMAGES = buildModuleImages(files);
import type { BrandElement, ModuleBrandImages } from './types';
import { BRAND_FILE_NAMES } from './defaults';

const ELEMENT_BY_FILE = Object.fromEntries(
  Object.entries(BRAND_FILE_NAMES).map(([element, file]) => [file, element as BrandElement])
) as Record<string, BrandElement>;

/** Da { './vigilo/icon.png': url, ... } a { vigilo: { icon: url }, ... }; i file con altri nomi si ignorano */
export function buildModuleImages(files: Record<string, string>): Record<string, ModuleBrandImages> {
  const result: Record<string, ModuleBrandImages> = {};
  for (const [path, url] of Object.entries(files)) {
    const match = /^\.\/([^/]+)\/([^/]+)$/.exec(path);
    const element = match ? ELEMENT_BY_FILE[match[2]] : undefined;
    if (!match || !element) continue;
    (result[match[1]] ??= {})[element] = url;
  }
  return result;
}
