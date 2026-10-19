// src/core/components/ui/tabs/Tabs.tsx
import React, { useEffect, useRef, useState } from "react";


import { useScrollEdges, type ScrollEdges } from "../../../hooks/useScrollEdges";
import { cn } from "../../../utils";

export interface TabItem {
  id: string;
  label: React.ReactNode;
  /** Icona opzionale (componente Lucide, non istanziata) mostrata a sinistra dell'etichetta. */
  icon?: React.ComponentType<{ className?: string }>;
  content: React.ReactNode;
  disabled?: boolean;
}

// ✨ NUOVO: Tipi esportati
export type TabsVariant = "default" | "pills" | "underline";
export type TabsSize = "sm" | "md" | "lg";

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  items: TabItem[];
  defaultTab?: string;
  variant?: TabsVariant;
  size?: TabsSize;
  onTabChange?: (tabId: string) => void;
  className?: string;
  /** A destra, sulla riga delle schede (es. un menu "Azioni"): resta visibile qualunque scheda sia aperta */
  actions?: React.ReactNode;
}

/** Larghezza della sfumatura ai bordi quando le schede non stanno nella riga */
const FADE_PX = 32;

/**
 * Maschera del contenitore che scorre: sfuma solo i lati dove c'è altro.
 * Una maschera, non un velo colorato: funziona su qualunque sfondo e tema.
 */
const fadeMask = ({ start, end }: ScrollEdges): React.CSSProperties | undefined => {
  if (!start && !end) return undefined;
  const g = `linear-gradient(to right, ${start ? "transparent" : "#000"} 0, #000 ${start ? FADE_PX : 0}px, #000 calc(100% - ${end ? FADE_PX : 0}px), ${end ? "transparent" : "#000"} 100%)`;
  return { maskImage: g, WebkitMaskImage: g };
};

export const Tabs: React.FC<TabsProps> = ({
  items,
  defaultTab,
  variant = "default",
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  size: _size = "md",
  onTabChange,
  className = "",
  actions,
  ...props
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || (items.length > 0 ? items[0].id : ""));
  const scrollRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());
  const edges = useScrollEdges(scrollRef, items.length);
  const primoScorrimento = useRef(true);

  // La scheda scelta resta visibile per intero, fuori dalla sfumatura (anche
  // aprendo la pagina su una scheda lontana). Solo in orizzontale: la pagina
  // non scorre. La prima volta senza animazione.
  useEffect(() => {
    const contenitore = scrollRef.current;
    const scheda = tabRefs.current.get(activeTab);
    if (!contenitore || !scheda) return;
    const c = contenitore.getBoundingClientRect();
    const s = scheda.getBoundingClientRect();
    const margine = contenitore.scrollWidth > contenitore.clientWidth ? FADE_PX : 0;
    const delta =
      s.left < c.left + margine ? s.left - c.left - margine : s.right > c.right - margine ? s.right - c.right + margine : 0;
    if (delta) {
      const calmo = primoScorrimento.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      contenitore.scrollBy({ left: delta, behavior: calmo ? "auto" : "smooth" });
    }
    primoScorrimento.current = false;
  }, [activeTab]);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  const currentTab = items.find((item) => item.id === activeTab);

  // Varianti visive
  const variantClasses = {
    default: "border-b border-border-default",
    pills: "p-1 bg-bg-secondary rounded-lg",
    underline: "border-b-2 border-transparent",
  };

  const tabClasses = {
    default: (isActive: boolean) =>
      cn(
        "px-4 py-2 -mb-px border-b-2 transition-colors",
        isActive
          ? "border-action-primary text-text-link font-medium"
          : "border-transparent text-text-secondary hover:text-text-primary hover:border-border-strong"
      ),
    pills: (isActive: boolean) =>
      cn(
        "px-4 py-1.5 rounded-md transition-all",
        isActive
          ? "bg-bg-primary text-text-primary shadow-sm"
          : "text-text-secondary hover:text-text-primary hover:bg-bg-hover"
      ),
    underline: (isActive: boolean) =>
      cn(
        "px-4 py-2 border-b-2 transition-colors",
        isActive
          ? "border-action-primary text-text-link"
          : "border-transparent text-text-secondary hover:text-text-primary hover:border-border-default"
      ),
  };

  return (
    <div className={cn("w-full", className)} {...props}>
      {/* Tab List (con le eventuali azioni a destra, fuori dallo scorrimento) */}
      <div className={cn("flex items-center gap-3", variantClasses[variant])}>
      <div ref={scrollRef} className="flex min-w-0 flex-1 overflow-x-auto overflow-y-hidden scrollbar-hide" style={fadeMask(edges)}>
        {/* anello di focus solo da tastiera e interno: il contenitore che scorre taglierebbe quello esterno */}
        {items.map((item) => (
          <button
            key={item.id}
            ref={(el) => {
              if (el) tabRefs.current.set(item.id, el);
              else tabRefs.current.delete(item.id);
            }}
            onClick={() => !item.disabled && handleTabClick(item.id)}
            disabled={item.disabled}
            className={cn(
              "inline-flex items-center gap-2 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-action-primary rounded-sm",
              tabClasses[variant](activeTab === item.id),
              item.disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {item.icon && <item.icon className="w-4 h-4 shrink-0" />}
            {item.label}
          </button>
        ))}
      </div>
      {actions && <div className="shrink-0 pb-1">{actions}</div>}
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {currentTab && (
          <div key={currentTab.id} className="animate-in fade-in slide-in-from-bottom-2 duration-200">
            {currentTab.content}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tabs;
