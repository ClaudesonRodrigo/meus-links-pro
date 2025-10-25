// src/lib/authService.ts

import { GoogleAuthProvider, signInWithPopup, User, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebaseClient";

// Função para gerar um 'slug' (URL amigável) a partir de um nome
const generateSlug = (displayName: string) => {
  if (!displayName) { // Adiciona um fallback caso displayName seja nulo ou vazio
      displayName = "usuario";
  }
  const slugBase = displayName
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .toLowerCase()
    .replace(/\s+/g, '-') // substitui espaços por hífens
    .replace(/[^\w\-]+/g, '') // remove caracteres especiais não permitidos em slugs
    .replace(/--+/g, '-') // substitui múltiplos hífens por um único
    .replace(/^-+|-+$/g, ''); // remove hífens no início ou fim
  // Garante que o slug base não esteja vazio
  const finalSlugBase = slugBase || 'usuario';
  return `${finalSlugBase}-${Math.floor(1000 + Math.random() * 9000)}`; // adiciona 4 números aleatórios
};

// A função principal de login com Google
export const signInWithGoogle = async (): Promise<User | null> => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const userDocRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userDocRef);

    // Se o usuário NÃO existe (primeiro login)
    if (!docSnap.exists()) {
      console.log("Novo usuário detectado. Criando documentos...");
      const pageSlug = generateSlug(user.displayName || "usuario"); // Gera o slug

      // 1. Tenta criar o documento na coleção 'users'
      try {
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          pageSlug: pageSlug, // Salva o slug gerado
          createdAt: new Date(),
          plan: 'free', // Define o plano padrão como gratuito
        });
        console.log("Documento 'users' criado com sucesso para UID:", user.uid);
      } catch (error) {
        // Log detalhado se a criação do 'users' falhar (improvável com as regras atuais)
        console.error("ERRO DETALHADO ao criar documento 'users':", error);
        // Considerar se deve retornar null ou tentar prosseguir
        // return null; // Retornar null aqui pode ser mais seguro
      }

      // 2. Tenta criar o documento na coleção 'pages'
      try {
        await setDoc(doc(db, "pages", pageSlug), { // Usa o pageSlug como ID do documento
          userId: user.uid, // Salva o UID do dono da página
          slug: pageSlug, // Salva o slug dentro do documento também (pode ser útil)
          title: user.displayName || "Minha Página", // Usa displayName ou um padrão
          bio: `Bem-vindo à minha página! Edite esta bio no painel.`, // Bio padrão
          profileImageUrl: user.photoURL || null, // URL da foto do Google ou null
          theme: 'light', // Tema padrão
          links: [ // Array de links inicial
            {
              title: "Meu Site Pessoal",
              url: "https://seusite.com", // URL de exemplo
              type: "website", // Tipo (pode ser usado no futuro)
              order: 1, // Ordem de exibição
              icon: 'globe' // Ícone padrão
            }
          ]
        });
        console.log("Documento 'pages' criado com sucesso com slug:", pageSlug);
      } catch (error) {
        // Log DETALHADO se a criação do 'pages' falhar (provavelmente regras de segurança)
        console.error("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        console.error("ERRO DETALHADO ao criar documento 'pages':", error);
        console.error("VERIFIQUE AS REGRAS DE SEGURANÇA DO FIRESTORE!");
        console.error("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        // Não retorna null aqui para que o login funcione, mas o dashboard mostrará o erro
      }
    } else {
      console.log("Usuário existente:", user.uid);
    }

    return user; // Retorna o usuário autenticado
  } catch (error) {
    // Captura erros do processo de autenticação do Google (ex: popup bloqueado, erro de rede)
    console.error("Erro GERAL no processo signInWithGoogle:", error);
    // Verifica se é erro de domínio não autorizado (útil para deploy)
    // @ts-ignore
    if (error.code === 'auth/unauthorized-domain') {
      alert("Erro: O domínio do site não está autorizado no Firebase. Verifique a configuração de Authentication -> Settings -> Authorized domains.");
    }
    return null; // Retorna null se a autenticação falhar
  }
};

// Função de Logout
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
    console.log("Usuário deslogado com sucesso.");
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
  }
};