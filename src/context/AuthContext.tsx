// src/context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, DocumentData } from 'firebase/firestore'; // 1. IMPORTAR FUNÇÕES DO FIRESTORE
import { auth, db } from '@/lib/firebaseClient'; // Importar 'db' também

// 2. DEFINIR UM TIPO PARA OS DADOS DO FIRESTORE (pode expandir depois)
type UserData = {
  plan: string;
  pageSlug: string;
  displayName?: string; // Incluir outros campos úteis
  email?: string;
  // Adicione outros campos que você tenha na coleção 'users'
};

// 3. ATUALIZAR O TIPO DO CONTEXTO
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
  const [userData, setUserData] = useState<UserData | null>(null); // 4. NOVO ESTADO
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (userAuth) => {
      if (userAuth) {
        // Usuário está logado (Firebase Auth confirmou)
        setUser(userAuth);

        // 5. BUSCAR DADOS ADICIONAIS NO FIRESTORE
        const userDocRef = doc(db, "users", userAuth.uid);
        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            setUserData(docSnap.data() as UserData); // Armazena os dados do Firestore
          } else {
            console.log("Documento do usuário não encontrado no Firestore!");
            setUserData(null); // Garante que não há dados antigos
          }
        } catch (error) {
          console.error("Erro ao buscar dados do usuário no Firestore:", error);
          setUserData(null);
        }

      } else {
        // Usuário está deslogado
        setUser(null);
        setUserData(null); // 6. LIMPAR OS DADOS DO FIRESTORE
      }
      setLoading(false); // Marca que a verificação terminou
    });

    // Limpa o listener ao desmontar
    return () => unsubscribe();
  }, []); // Array vazio garante que rode apenas uma vez

  return (
    // 7. FORNECER 'userData' NO CONTEXTO
    <AuthContext.Provider value={{ user, userData, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Hook customizado para usar o contexto
export const useAuth = () => useContext(AuthContext);