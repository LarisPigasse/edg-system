// src/features/vigilo/pages/VigiloHome.tsx
//
// Home di Vigilo: la dashboard. Finché la procedura di avvio non è fatta,
// RichiedeAvvio porta chi configura alla procedura e mostra agli altri che
// Vigilo è in preparazione. L'addetto (solo vigilo.own, B9b) va a "Le mie
// scadenze".
import React from 'react';
import { Navigate } from 'react-router-dom';

import { Dashboard } from '../components/dashboard/Dashboard';
import { RichiedeAvvio } from '../components/RichiedeAvvio';
import { eAddetto } from '../utils/capacita';

const VigiloHome: React.FC = () => (
  <RichiedeAvvio>{profilo => (eAddetto(profilo.capacita) ? <Navigate to='mie-scadenze' replace /> : <Dashboard profilo={profilo} />)}</RichiedeAvvio>
);

export default VigiloHome;
