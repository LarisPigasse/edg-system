import React from "react";
import { Link } from "react-router-dom";

import { useEdgConfig } from '../../../config';

interface FooterProps {
  className?: string;
  showVersionInfo?: boolean;
}

const Footer: React.FC<FooterProps> = ({ className = "", showVersionInfo = true }) => {
  const { app, routes } = useEdgConfig();

  return (
    <footer className={`bg-bg-primary border-t border-border-default ${className}`}>
      <div className="w-full px-4 py-2">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          {/* Copyright e Info Versione */}
          <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-4">
            <span className="text-text-secondary text-xs">
              {app.copyright}
            </span>

            {showVersionInfo && (
              <div className="bg-bg-info flex items-center text-xs px-2 py-0.5 rounded">
                <span className="text-text-primary font-medium text-xs">
                  v{app.version}
                </span>
                {/* Indicatore ambiente di sviluppo */}
                {app.version.includes("dev") && (
                  <span className="ml-1.5 w-1.5 h-1.5 bg-action-warning rounded-full" title="Ambiente di sviluppo"></span>
                )}
              </div>
            )}
          </div>

          {/* Centro: riservato a scorciatoie future (es. stampa, esportazione).
              Vuoto di proposito: nascosto su mobile per non lasciare uno
              spazio morto nel layout impilato, presente su sm+ solo per
              tenere il posto e spingere gli altri due blocchi ai bordi. */}
          <div className="hidden sm:flex flex-1 items-center justify-center" aria-hidden="true" />

          {/* Links Footer */}
          <div className="flex flex-wrap justify-center sm:justify-end items-center space-x-4 text-xs">
            <Link to={routes.terms} className="text-text-secondary hover:text-text-menu-active transition-colors">
              Termini
            </Link>
            <Link to={routes.support} className="text-text-secondary hover:text-text-menu-active transition-colors">
              Supporto
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
