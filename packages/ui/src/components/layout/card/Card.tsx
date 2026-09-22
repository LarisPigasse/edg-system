// src/core/components/ui/Card.tsx
import React from "react";

import { cn } from "../../../utils";

export type CardVariant = "default" | "elevated" | "outlined" | "flat";
export type CardPadding = "none" | "sm" | "md" | "lg";
export type CardRadius = "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "full";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Contenuto del card */
  children: React.ReactNode;
  /** Variante visiva del card */
  variant?: CardVariant;
  /** Padding interno */
  padding?: CardPadding;
  /** Raggio degli angoli */
  rounded?: CardRadius;
  /** Abilita hover effects */
  hover?: boolean;
  /** Card cliccabile */
  clickable?: boolean;
  /** Callback per click */
  onClick?: () => void;
  /** Classi CSS aggiuntive */
  className?: string;
}

/**
 * Card - Componente contenitore versatile per raggruppare contenuti.
 *
 * Features:
 * - Integrazione completa con ThemedSurface
 * - 4 varianti visive (default, elevated, outlined, flat)
 * - Hover effects eleganti con border highlighting
 * - Clickable behavior con keyboard support
 * - Padding responsive e configurabile
 * - Raggio degli angoli configurabile (rounded)
 * - Focus styling con border (no ring)
 *
 * @example
 * <Card variant="elevated" padding="lg" clickable onClick={handleClick}>
 *   <h3>Titolo Card</h3>
 *   <p>Contenuto della card...</p>
 * </Card>
 */
export const Card: React.FC<CardProps> = ({
  children,
  variant = "default",
  padding = "md",
  rounded = "lg",
  hover,
  clickable = false,
  onClick,
  className = "",
  ...props
}) => {
  // Auto-enable hover se è clickable
  const enableHover = hover ?? (clickable || !!onClick);

  // Auto-enable clickable se c'è onClick
  const isClickable = clickable || !!onClick;

  // Configurazione varianti
  const variantConfig = {
    default: {
      bg: "bg-bg-primary",
      border: "border border-border-default",
      shadow: "shadow-themed-sm",
    },
    elevated: {
      bg: "bg-bg-primary",
      border: "border border-border-thin",
      shadow: "shadow-themed-md",
    },
    outlined: {
      bg: "bg-bg-primary",
      border: "border border-border-strong",
      shadow: "shadow-none",
    },
    flat: {
      bg: "bg-bg-secondary",
      border: "",
      shadow: "shadow-none",
    },
  };

  // Configurazione padding
  const paddingClasses = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  // Configurazione raggio angoli
  const radiusClasses: Record<CardRadius, string> = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
    full: "rounded-full",
  };

  const config = variantConfig[variant];

  // Classi base
  const baseClasses = cn(
    radiusClasses[rounded],
    "transition-all duration-200 ease-in-out",
    config.bg,
    config.border,
    config.shadow,
    paddingClasses[padding]
  );

  // Classi hover
  const hoverClasses = enableHover
    ? cn(
        "hover:shadow-themed-lg",
        variant === "outlined"
          ? "hover:border-border-contrast hover:shadow-themed-sm"
          : "hover:border-border-contrast",
        variant === "flat" ? "hover:shadow-themed-sm" : ""
      )
    : "";

  // Classi clickable
  const clickableClasses = isClickable
    ? cn(
        "cursor-pointer",
        // Focus styles - border highlight instead of ring
        "focus:outline-none focus:border-action-primary",
        variant === "flat"
          ? "focus:shadow-themed-sm"
          : "focus:shadow-themed-lg",
        // Active state
        "active:scale-[0.98] active:shadow-themed-sm"
      )
    : "";

  // Classi finali
  const finalClasses = cn(
    baseClasses,
    hoverClasses,
    clickableClasses,
    className
  );

  // Props finali
  const finalProps = {
    ...props,
    ...(isClickable && {
      onClick,
      tabIndex: 0,
      role: "button",
      onKeyDown: (e: React.KeyboardEvent) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      },
    }),
  };

  return (
    <div className={finalClasses} {...finalProps}>
      {children}
    </div>
  );
};

export default Card;
