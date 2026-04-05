'use client';

import { UserProfile, Show, SignInButton } from '@clerk/nextjs';

export default function PerfilPage() {
  return (
    <Show
      when="signed-in"
      fallback={
        <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center bg-[#F4F7F6] px-4">
          <h1 className="text-2xl font-bold text-gray-800">Perfil</h1>
          <p className="mt-2 mb-6 max-w-sm text-center text-sm text-gray-500">
            Inicia sesión para ver y editar tu cuenta.
          </p>
          <SignInButton mode="modal">
            <button
              type="button"
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              Iniciar sesión
            </button>
          </SignInButton>
        </div>
      }
    >
      <div className="min-h-[calc(100vh-80px)] bg-[#F4F7F6] py-8">
        <div className="mx-auto flex max-w-4xl flex-col items-stretch px-4">
          <h1 className="mb-6 font-display text-2xl font-bold text-gray-900">Perfil</h1>
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <UserProfile
              routing="hash"
              appearance={{
                elements: {
                  rootBox: 'w-full',
                  card: 'w-full border-0 shadow-none',
                },
              }}
            />
          </div>
        </div>
      </div>
    </Show>
  );
}
