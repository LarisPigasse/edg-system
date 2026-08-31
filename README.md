# edg-system

Monorepo del sistema **frontend** della piattaforma EDG: le applicazioni e i pacchetti
che condividono.

I microservizi (auth, log, email, gateway, Traefik, database) restano in `edg-docker`:
qui vive solo ciò che gira nel browser. Vedi ADR010 e ADR011 in
`edg-docker/docs/dev-knowledge/decisions.json`.

```
edg-system/
├── apps/
│   ├── app-frontend/     utenti finali — tutti i moduli, abilitati per cliente  (:5174)
│   └── pro-frontend/     operatori EDG — gestione di moduli, clienti e account  (:5173)
└── packages/
    ├── ui/               @edg/ui   — design system, tema, layout, stato UI
    └── auth/             @edg/auth — login, sessione, permessi, client HTTP
```

## Perché

Prima di questo monorepo il design system esisteva in tre copie (`pro-frontend`,
`app-frontend`, `asset-frontend`) che divergevano: una correzione applicata a una
non raggiungeva le altre. Qui il codice condiviso ha una sola sede, e se una
modifica lo rompe il build delle applicazioni fallisce subito.

## Come funziona il confine fra pacchetti e applicazioni

`@edg/ui` **non conosce** l'applicazione che lo ospita. Nome, rotte, moduli del menu
e parametri di layout gli arrivano da `<EdgConfigProvider config={...}>`; l'unico
altro vincolo è che lo store Redux monti `uiSliceReducer` sotto la chiave `ui`.
È ciò che permette alla stessa shell di servire il gestionale operatori e il
portale clienti senza duplicazioni.

La dipendenza va in una direzione sola: `apps → @edg/auth → @edg/ui`.

I due frontend condividono tutto il design e si distinguono per un solo elemento
grafico: l'icona del marchio, scelta con `app.icon` nella configurazione
(`'icon'` per il portale utenti, `'iconPro'` per il gestionale). Il catalogo del
design system (`/design/tema` e `/design/componenti`) vive solo in `pro-frontend`,
che è lo strumento degli operatori.

## Comandi

```bash
npm install              # una volta sola, dalla radice: installa tutti i workspace
npm run dev:app          # avvia app-frontend
npm run dev:pro          # avvia pro-frontend
npm run build            # build di tutti i workspace
npm run lint             # lint di tutti i workspace
```
