// src/core/components/ui/tabs/Tabs.data.ts
import type { ComponentData } from "../../../types";

export const tabsData: ComponentData = {
  id: "tabs",
  title: "Tabs",
  description:
    "Un componente per organizzare contenuti in sezioni navigabili, con tre varianti visive e supporto per lo scroll su mobile.",
  category: "navigation",
  importPath: 'import { Tabs, type TabItem } from "@edg/ui";',
  origin: "Custom Component",
  dependence: "Button, ThemedSurface",
  props: [
    {
      name: "items",
      type: "TabItem[]",
      required: true,
      description:
        "Un array di oggetti che definisce le schede: id, label, contenuto, un'icona opzionale (componente Lucide, mostrata a sinistra della label) e disabled.",
    },
    { name: "defaultTab", type: "string", description: "L'ID della scheda da attivare di default." },
    {
      name: "variant",
      type: '"default" | "pills" | "underline"',
      defaultValue: '"default"',
      description: "La variante stilistica delle schede.",
    },
    { name: "size", type: '"sm" | "md" | "lg"', defaultValue: '"md"', description: "La dimensione dei pulsanti delle schede." },
    { name: "onTabChange", type: "(tabId: string) => void", description: "Callback eseguita quando l'utente cambia scheda." },
  ],
  examples: [
    {
      title: "Variante 'default'",
      description: "La variante standard, adatta per la maggior parte dei layout.",
      code: `const items = [
  { id: 'profilo', label: 'Profilo', icon: User, content: 'Contenuto del profilo...' },
  { id: 'account', label: 'Account', icon: Settings, content: 'Contenuto account...' },
  { id: 'notifiche', label: 'Notifiche', icon: Bell, content: 'Contenuto delle notifiche...' }
];

<Tabs items={items} defaultTab="profilo" />`,
    },
    {
      title: "Variante 'pills'",
      description: "Uno stile moderno con uno sfondo a 'pillola' per l'elemento attivo.",
      code: `<Tabs items={items} variant="pills" />`,
    },
    {
      title: "Variante 'underline'",
      description: "Uno stile minimale con una linea inferiore che evidenzia la scheda attiva.",
      code: `<Tabs items={items} variant="underline" />`,
    },
    {
      title: "Con Scheda Disabilitata",
      description: "È possibile disabilitare singole schede.",
      code: `const itemsConDisabilitato = [
  { id: 'attivo', label: 'Attivo', content: 'Contenuto attivo' },
  { id: 'disabilitato', label: 'Disabilitato', content: 'N/A', disabled: true },
];

<Tabs items={itemsConDisabilitato} />`,
    },
  ],
  notes:
    "Il componente gestisce internamente lo stato della scheda attiva. Il contenuto di ogni scheda può essere un qualsiasi nodo React (testo, altri componenti, ecc.). L'icona opzionale di ogni scheda si affianca sempre a sinistra della label. Su schermi piccoli, l'elenco delle schede diventa scrollabile orizzontalmente.",
};
