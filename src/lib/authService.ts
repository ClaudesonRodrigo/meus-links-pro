// src/lib/authService.ts

import { GoogleAuthProvider, signInWithPopup, User, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebaseClient"; // Nossas configurações do Firebase

// Função para gerar um 'slug' (URL amigável) a partir de um nome
const generateSlug = (displayName: string) => {
  const slug = displayName
    .toLowerCase()
    .replace(/\s+/g, '-') // substitui espaços por hífens
    .replace(/[^\w\-]+/g, ''); // remove caracteres especiais
  return `${slug}-${Math.floor(1000 + Math.random() * 9000)}`; // adiciona 4 números aleatórios para garantir que seja único
};

// A função principal de login com Google
export const signInWithGoogle = async (): Promise<User | null> => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Após o login, verificar se o usuário já existe no nosso banco de dados
    const userDocRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userDocRef);

    // Se o usuário NÃO existe (primeiro login), criamos os dados dele
    if (!docSnap.exists()) {
      const pageSlug = generateSlug(user.displayName || "usuario");

      // 1. Cria o documento na coleção 'users'
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        pageSlug: pageSlug,
        createdAt: new Date(),
        plan: 'free', // <-- ATUALIZAÇÃO IMPORTANTE
      });

      // 2. Cria o documento na coleção 'pages'
      await setDoc(doc(db, "pages", pageSlug), {
        userId: user.uid,
        slug: pageSlug,
        title: user.displayName,
        bio: `Bem-vindo à minha página!`,
        profileImageUrl: user.photoURL,
        theme: 'light', // <-- Adiciona tema padrão
        links: [
          { 
            title: "Meu Site Pessoal", 
            url: "https://seusite.com", 
            type: "website", 
            order: 1,
            icon: 'globe' // <-- Adiciona ícone padrão
          }
        ]
      });
    }

    return user;
  } catch (error) {
    console.error("Erro ao fazer login com Google:", error);
    return null;
  }
};

// Função de Logout
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
    // O 'onAuthStateChanged' no nosso AuthContext vai detectar isso
    // e atualizar o estado do usuário automaticamente.
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
  }
};