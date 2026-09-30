// src/features/sistema/components/info/AlertTitle.tsx
//
// Titolo di un allarme con il gruppo integrato nel testo ed evidenziato a
// colori (ADR038) — usato da "Ultimo allarme" e dallo Storico:
//  - regole che iniziano con "Servizio" -> dopo la prima parola
//    ("Servizio vehicle-service di nuovo operativo")
//  - tutte le altre -> in coda ("... dallo stesso IP 203.0.113.7")
//  - senza raggruppamento ('*') -> nome della regola invariato
import React from 'react';

interface AlertTitleProps {
  ruleName: string;
  groupKey: string;
}

export const AlertTitle: React.FC<AlertTitleProps> = ({ ruleName, groupKey }) => {
  if (groupKey === '*') return <>{ruleName}</>;
  const key = <span className='text-text-link'>{groupKey}</span>;

  const match = /^(Servizio)(\s.*)$/i.exec(ruleName);
  return match ? (
    <>
      {match[1]} {key}
      {match[2]}
    </>
  ) : (
    <>
      {ruleName} {key}
    </>
  );
};

export default AlertTitle;
