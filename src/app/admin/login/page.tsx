// src/app/admin/login/page.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation'; // Hook para redirecionamento
import { signInWithGoogle } from '@/lib/authService'; // Importa nossa função de login

export default function LoginPage() {
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    const user = await signInWithGoogle();
    if (user) {
      // Se o login for bem-sucedido, redireciona para o painel
      router.push('/admin/dashboard');
    } else {
      // Opcional: mostrar uma mensagem de erro para o usuário
      alert("Houve um erro ao tentar fazer login. Tente novamente.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Acesse seu Painel
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Gerencie sua página de links de forma fácil e rápida.
        </p>
        
        <button
          onClick={handleGoogleSignIn}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition duration-300"
        >
          {/* Ícone do Google (SVG) */}
          <svg className="w-6 h-6 mr-3" viewBox="0 0 48 48">{/* ...código do SVG omitido por brevidade... */}</svg>
          Entrar com Google
        </button>
      </div>
    </div>
  );
}