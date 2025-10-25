// src/context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, DocumentData } from 'firebase/firestore'; // IMPORTAR FUNÇÕES DO FIRESTORE
import { auth, db } from '@/lib/firebaseClient'; // IMPORTAR 'db'

// DEFINIR UM TIPO PARA OS NOSSOS DADOS DO USUÁRIO NO FIRESTORE
type UserData = {
  plan: string;
  pageSlug: string;
  displayName?: string;
  email?: string;
  // Adicione qualquer outro campo que você tenha na coleção 'users'
};

// ATUALIZAR O TIPO DO CONTEXTO
type AuthContextType = {
  user: User | null; // O objeto User do Firebase Auth
  userData: UserData | null; // Nossos dados adicionais do Firestore
  loading: boolean; // Indica se a verificação inicial está ocorrendo
};

// Valor inicial do contexto
const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
});

// Componente Provedor
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null); // NOVO ESTADO
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged é o "ouvinte" do Firebase
    const unsubscribe = onAuthStateChanged(auth, async (userAuth) => {
      setLoading(true); // Inicia carregamento ao detectar mudança
      if (userAuth) {
        // Usuário está logado (Firebase Auth confirmou)
        setUser(userAuth);

        // BUSCAR DADOS ADICIONAIS NO FIRESTORE
        const userDocRef = doc(db, "users", userAuth.uid);
        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            setUserData(docSnap.data() as UserData); // Armazena os dados do Firestore
            // console.log("Dados do usuário carregados:", docSnap.data()); // Log opcional
          } else {
            console.warn("Documento do usuário não encontrado no Firestore para UID:", userAuth.uid);
            setUserData(null); // Garante que não há dados antigos
          }
        } catch (error) {
          console.error("Erro ao buscar dados do usuário no Firestore:", error);
          setUserData(null);
        }

      } else {
        // Usuário está deslogado
        setUser(null);
        setUserData(null); // LIMPAR OS DADOS DO FIRESTORE
      }
      setLoading(false); // Marca que a verificação terminou
    });

    // Limpa o listener ao desmontar
    return () => unsubscribe();
  }, []); // Array vazio garante que rode apenas uma vez na montagem inicial

  return (
    // FORNECER 'userData' NO CONTEXTO
    <AuthContext.Provider value={{ user, userData, loading }}>
      {/* Renderiza children apenas quando o carregamento inicial termina para evitar piscar */}
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Hook customizado para usar o contexto
export const useAuth = () => useContext(AuthContext);