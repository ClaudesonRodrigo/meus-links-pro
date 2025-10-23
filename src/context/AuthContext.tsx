// src/context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebaseClient';

// Definimos o tipo de valor que nosso contexto irá fornecer
type AuthContextType = {
  user: User | null;
  loading: boolean;
};

// Criamos o contexto com um valor inicial padrão
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

// Este é o nosso componente Provedor
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged é o "ouvinte" do Firebase que verifica o status do login
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Usuário está logado
        setUser(user);
      } else {
        // Usuário está deslogado
        setUser(null);
      }
      setLoading(false); // Marca que a verificação inicial terminou
    });

    // Limpa o ouvinte quando o componente é desmontado
    return () => unsubscribe();
  }, []); // O array vazio [] garante que este efeito rode apenas uma vez

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Hook customizado para facilitar o uso do contexto em outras partes do app
export const useAuth = () => useContext(AuthContext);