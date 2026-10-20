'use client';

import { useEffect } from 'react';

export function PwaRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('Project Ascend PWA Service Worker registrado com sucesso:', registration.scope);
          })
          .catch((err) => {
            console.log('Falha ao registrar Service Worker do PWA:', err);
          });
      });
    }
  }, []);

  return null;
}
