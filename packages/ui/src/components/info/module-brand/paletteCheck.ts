// Classi Tailwind presenti nel CSS caricato (ADR054)
//
// Tailwind genera solo le classi che trova nei sorgenti: quelle salvate nel
// catalogo funzionano se compaiono anche nel codice o nella tavolozza
// garantita (styles/brand-palette.css). Invece di tenere una seconda lista,
// si guarda il CSS davvero caricato dalla pagina: se una classe non c'è, a
// video non avrebbe effetto e l'editor lo segnala.

let cachedSignature = '';
let cachedSelectors = '';

/** Tutti i selettori dei fogli di stile, in un'unica stringa (ricalcolata se il CSS cambia, es. HMR) */
function loadedSelectors(): string {
  const sheets = Array.from(document.styleSheets);
  const signature = sheets
    .map(sheet => {
      try {
        return sheet.cssRules.length;
      } catch {
        return 0; // fogli di altra origine: illeggibili, e comunque non sono di Tailwind
      }
    })
    .join(',');
  if (signature === cachedSignature) return cachedSelectors;

  const parts: string[] = [];
  const walk = (rules: CSSRuleList) => {
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSStyleRule) parts.push(rule.selectorText);
      // @layer, @media, @supports e regole annidate
      if ('cssRules' in rule && (rule as CSSGroupingRule).cssRules) walk((rule as CSSGroupingRule).cssRules);
    }
  };
  for (const sheet of sheets) {
    try {
      walk(sheet.cssRules);
    } catch {
      /* foglio di altra origine */
    }
  }
  cachedSignature = signature;
  cachedSelectors = parts.join('\n');
  return cachedSelectors;
}

/** Un nome di classe finisce dove non può più continuare (".text-red-5" non vale per ".text-red-500") */
const CONTINUES_NAME = /[A-Za-z0-9_\-\\]/;

function hasClass(selectors: string, cls: string): boolean {
  const needle = `.${CSS.escape(cls)}`;
  let from = selectors.indexOf(needle);
  while (from !== -1) {
    const next = selectors[from + needle.length];
    if (next === undefined || !CONTINUES_NAME.test(next)) return true;
    from = selectors.indexOf(needle, from + 1);
  }
  return false;
}

/** Le classi della stringa che il CSS caricato non conosce (senza duplicati) */
export function findMissingClasses(classes: string | null | undefined): string[] {
  const list = Array.from(new Set((classes ?? '').split(/\s+/).filter(Boolean)));
  if (list.length === 0 || typeof document === 'undefined') return [];
  const selectors = loadedSelectors();
  return list.filter(cls => !hasClass(selectors, cls));
}
