/**
 * CenteredPage Component
 *
 * Container per pagine STANDALONE, renderizzate fuori da MainLayout e che
 * quindi occupano davvero l'intero schermo (login, forgot-password, ecc.):
 * il min-h-screen interno presuppone che non ci siano già un Header e un
 * Footer sopra e sotto, altrimenti l'altezza totale supera i 100vh e compare
 * una scrollbar verticale indesiderata.
 *
 * Per una pagina di contenuto dentro MainLayout (una route qualsiasi che
 * vive nel layout con Header/Footer) NON usare questo componente: usare
 * invece il pattern di NotFound.tsx — un div con `min-h-[50vh]` invece di
 * `min-h-screen`, che si adatta allo spazio già disponibile nel layout.
 *
 * Features:
 * - Full viewport height with centered content
 * - Responsive padding and constraints
 * - Optional background variant
 * - Loading state support
 * - Animated entrance
 */

import React from "react";

import { Spinner } from "../../feedback";

interface CenteredPageProps {
  /**
   * Page content
   */
  children: React.ReactNode;

  /**
   * Background surface variant
   */
  variant?: "base" | "primary" | "secondary" | "modal";

  /**
   * Maximum width constraint
   */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "none";

  /**
   * Vertical padding
   */
  padding?: "sm" | "md" | "lg";

  /**
   * Show loading spinner
   */
  isLoading?: boolean;

  /**
   * Loading message
   */
  loadingMessage?: string;

  /**
   * Enable entrance animation
   */
  animate?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

export const CenteredPage: React.FC<CenteredPageProps> = ({
  children,
  variant = "base",
  maxWidth = "md",
  padding = "md",
  isLoading = false,
  loadingMessage = "Caricamento...",
  animate = true,
  className = "",
}) => {
  // Max width configurations
  const maxWidthClasses = {
    sm: "max-w-sm", // 384px
    md: "max-w-md", // 448px
    lg: "max-w-lg", // 512px
    xl: "max-w-xl", // 576px
    none: "max-w-none",
  };

  // Padding configurations
  const paddingClasses = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  // Animation classes
  const animationClasses = animate ? "animate-in fade-in-0 slide-in-from-bottom-4 duration-500" : "";

  // ⚠️ Mappa esplicita: Tailwind genera le utility analizzando il sorgente,
  // quindi una classe composta a runtime (bg-bg- + variant) non viene mai
  // prodotta. Funzionava solo finché quelle classi comparivano altrove.
  const surfaceClasses = {
    base: 'bg-bg-base',
    primary: 'bg-bg-primary',
    secondary: 'bg-bg-secondary',
    modal: 'bg-bg-modal',
  } as const;

  return (
    <div
      className={`min-h-screen flex items-center justify-center ${paddingClasses[padding]} ${className} ${surfaceClasses[variant]}`}
    >
      <div
        className={`
          w-full ${maxWidthClasses[maxWidth]} 
          ${animationClasses}
        `}
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <Spinner size="md" />
            <div className="text-center">
              <p className="text-text-secondary text-sm">{loadingMessage}</p>
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

export default CenteredPage;
