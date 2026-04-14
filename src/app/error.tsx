'use client';

import { useEffect } from 'react';

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error('Error de ruta:', error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Error temporal</p>
      <h1 className="text-2xl font-bold text-gray-900">No pudimos cargar esta sección</h1>
      <p className="text-sm text-gray-600">
        Ocurrió un problema en el servidor. Intenta de nuevo en unos segundos.
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
  );
}
