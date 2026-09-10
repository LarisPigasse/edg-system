// src/core/components/ui/tabs/Tabs.showcase.tsx
import React from "react";
import Tabs from "./Tabs";
import type { TabItem } from "./Tabs";
import { TitledSurface } from "../../layout";

import { Palette, SquarePen, Settings, Bell } from "lucide-react";
import { Button } from "../../ui";
import { Input, Switch } from "../../form";

// Dati per le schede: icona a sinistra dell'etichetta tramite la prop `icon`
const showcaseItems: TabItem[] = [
  {
    id: "theme",
    label: "Tema",
    icon: Palette,
    content: (
      <div className="p-4 space-y-4 max-w-md">
        <h3 className="font-semibold text-text-primary">
          Impostazioni Tema
        </h3>
        <p className="text-text-secondary">Personalizza l'aspetto dell'applicazione.</p>
        <Switch label="Modalità Scura" description="Attiva il tema scuro per l'interfaccia." />
      </div>
    ),
  },
  {
    id: "profile",
    label: "Profilo",
    icon: SquarePen,
    content: (
      <div className="p-4 space-y-4 max-w-md">
        <Input label="Nome Utente" defaultValue="LarisPigasse" />
        <Input label="Email" type="email" defaultValue="laris.pigasse@example.com" />
        <Button>Salva Profilo</Button>
      </div>
    ),
  },
  {
    id: "notifications",
    label: "Notifiche",
    icon: Bell,
    content: (
      <div className="p-4 space-y-4 max-w-md">
        <Switch label="Notifiche Email" checked />
        <Switch label="Notifiche Push" />
      </div>
    ),
  },
  {
    id: "disabled",
    label: "Admin",
    icon: Settings,
    content: <></>,
    disabled: true,
  },
];

export const TabsShowcase: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* ✨ Esempio principale che imita lo stile di Showcase.tsx */}
      <TitledSurface title="Esempio Principale (Stile 'Underline')" padding="lg">
        <p className="mb-4 text-text-secondary">
          Questa variante utilizza una linea inferiore per indicare la scheda attiva, ideale per header e navigazioni
          principali.
        </p>
        <Tabs items={showcaseItems} defaultTab="profile" variant="underline" size="md" />
      </TitledSurface>

      <TitledSurface title="Altre Varianti Visive" variant="secondary" padding="lg">
        <div className="space-y-8">
          <div>
            <span className="mb-3 font-semibold block text-text-secondary">
              Variante 'Pills'
            </span>
            <Tabs items={showcaseItems} defaultTab="profile" variant="pills" size="sm" />
          </div>
          <div>
            <span className="mb-3 font-semibold block text-text-secondary">
              Variante 'Default'
            </span>
            <Tabs items={showcaseItems} defaultTab="profile" variant="default" size="md" />
          </div>
        </div>
      </TitledSurface>
    </div>
  );
};

export default TabsShowcase;
