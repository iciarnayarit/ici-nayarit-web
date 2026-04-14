'use client';

import { useEffect } from 'react';

type GlobalErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalErrorPage({ error, reset }: GlobalErrorPageProps) {
  useEffect(() => {
    console.error('Error global:', error);
  }, [error]);

  return (
    <html lang="es">
      <body className="m-0 bg-white font-sans">
        <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Error del sistema</p>
          <h1 className="text-2xl font-bold text-gray-900">Estamos corrigiendo un problema</h1>
          <p className="text-sm text-gray-600">
            Se produjo un error inesperado al cargar el sitio. Vuelve a intentarlo.
          </p>
          {error.digest ? (
            <p className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500">
              Código: {error.digest}
            </p>
          ) : null}
          <button
            type="button"
            onClick={reset}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
          >
            Reintentar
          </button>
        </main>
      </body>
    </html>
  );
}
