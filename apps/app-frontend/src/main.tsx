import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Il tema e le utility Tailwind arrivano dal design system condiviso
import '@edg/ui/styles.css';

import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
