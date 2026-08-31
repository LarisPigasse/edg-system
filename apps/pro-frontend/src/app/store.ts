// src/app/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { uiSliceReducer, persistenceMiddleware } from '@edg/ui';
import { authReducer } from '@edg/auth';

/**
 * Lo store compone i due slice condivisi dai pacchetti.
 *
 * ⚠️ Le chiavi `ui` e `auth` non sono arbitrarie: i selector di @edg/ui e
 * @edg/auth sono scritti nella forma `(state: { ui: ... })` e `{ auth: ... }`.
 * È l'unico vincolo che i pacchetti impongono allo store dell'applicazione.
 */
export const store = configureStore({
  reducer: {
    ui: uiSliceReducer,
    auth: authReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['ui/initializeFromStorage'],
      },
    }).concat(persistenceMiddleware),
  devTools: import.meta.env.DEV,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
