// src/features/vigilo/components/dopoAvvio.ts
//
// Per il manifest: una pagina caricata a richiesta che si apre solo dopo la
// procedura di avvio (RichiedeAvvio). Uso: dopoAvvio(() => import('../pages/X')).
import { createElement, lazy, type ComponentType } from 'react';

import { RichiedeAvvio } from './RichiedeAvvio';

export const dopoAvvio = (carica: () => Promise<{ default: ComponentType }>) =>
  lazy(async () => {
    const { default: Pagina } = await carica();
    const Protetta: ComponentType = () => createElement(RichiedeAvvio, null, createElement(Pagina));
    return { default: Protetta };
  });
