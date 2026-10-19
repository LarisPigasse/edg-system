// src/features/vigilo/pages/VigiloHome.tsx
//
// Home di Vigilo: la dashboard. Finché la procedura di avvio non è fatta,
// RichiedeAvvio porta chi configura alla procedura e mostra agli altri che
// Vigilo è in preparazione.
import React from 'react';

import { Dashboard } from '../components/dashboard/Dashboard';
import { RichiedeAvvio } from '../components/RichiedeAvvio';

const VigiloHome: React.FC = () => <RichiedeAvvio>{profilo => <Dashboard profilo={profilo} />}</RichiedeAvvio>;

export default VigiloHome;
