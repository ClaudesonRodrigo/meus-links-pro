// src/lib/pageService.ts

import {
  doc, getDoc, updateDoc, arrayUnion, arrayRemove, DocumentData,
  collection, query, where, getDocs // Adicionar imports Firestore necessários
} from "firebase/firestore";
import { db } from "./firebaseClient";

// Tipo para os dados de um link individual (com campo 'icon' opcional)
export type LinkData = {
  title: string;
  url: string;
  type: string; // Mantido para futura customização, se necessário
  order: number;
  icon?: string; // NOVO CAMPO para nome do ícone (ex: 'github', 'instagram')
};

// Tipo para os dados da página inteira (com campo 'theme' opcional)
export type PageData = {
  title: string;
  bio: string;
  profileImageUrl?: string; // Tornar opcional caso o usuário não tenha foto
  links: LinkData[];
  theme?: string; // NOVO CAMPO para nome do tema (ex: 'dark', 'ocean')
  userId: string; // Adicionado para garantir que o tipo esteja completo e para regras de segurança
  slug: string; // Adicionado para garantir que o tipo esteja completo
};

// --- ADICIONADO TIPO UserData (pode ser movido para um arquivo types.ts no futuro) ---
export type UserData = {
  plan: string;
  pageSlug: string;
  displayName?: string;
  email?: string;
  role?: string;
  // Adicione outros campos da coleção 'users' se houver
};
// --- FIM ADIÇÃO UserData ---

/**
 * Busca os dados da página de um usuário pelo ID do usuário.
 * Usado principalmente no Dashboard.
 * @param userId - O ID do usuário autenticado.
 * @returns Um objeto contendo o slug e os dados da página, ou null.
 */
export const getPageDataForUser = async (userId: string): Promise<{ slug: string, data: DocumentData } | null> => {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      console.error("Documento de usuário não encontrado para getPageDataForUser!");
      return null;
    }

    const pageSlug = userDocSnap.data()?.pageSlug;
    if (!pageSlug) {
      // Tenta buscar diretamente na coleção pages como fallback (caso users.pageSlug não exista por algum motivo)
      console.warn(`pageSlug não encontrado no documento /users/${userId}. Tentando fallback na coleção 'pages'...`);
      const pagesRef = collection(db, "pages");
      const q = query(pagesRef, where("userId", "==", userId));
      const pagesSnap = await getDocs(q);
      if (!pagesSnap.empty) {
        const pageDoc = pagesSnap.docs[0];
        console.log(`Fallback bem-sucedido: encontrado /pages/${pageDoc.id} para userId ${userId}`);
        return { slug: pageDoc.id, data: pageDoc.data() };
      } else {
         console.error(`Fallback falhou: Nenhum documento em /pages encontrado para userId ${userId}.`);
         return null; // Retorna null se nem o fallback funcionar
      }
    }

    // Usar o pageSlug original para buscar os dados da página
    const pageDocRef = doc(db, "pages", pageSlug);
    const pageDocSnap = await getDoc(pageDocRef);

    if (pageDocSnap.exists()) {
      // Retorna tanto o slug quanto os dados
      return { slug: pageSlug, data: pageDocSnap.data() };
    } else {
      console.warn(`Documento /pages/${pageSlug} (referenciado por /users/${userId}) não foi encontrado!`);
      // Poderia tentar o fallback aqui também se quisesse ser redundante
      return null;
    }
  } catch (error) {
    console.error("Erro ao buscar dados da página do usuário:", error);
    return null;
  }
};


/**
 * Adiciona um novo link ao array de links de uma página específica.
 * @param pageSlug - O slug da página a ser atualizada.
 * @param newLink - O objeto do novo link a ser adicionado.
 */
export const addLinkToPage = async (pageSlug: string, newLink: LinkData): Promise<void> => {
  try {
    const pageDocRef = doc(db, "pages", pageSlug);
    await updateDoc(pageDocRef, {
      links: arrayUnion(newLink)
    });
  } catch (error) {
    console.error("Erro ao adicionar novo link:", error);
    throw new Error("Não foi possível adicionar o link.");
  }
};

/**
 * Remove um link específico do array de links de uma página.
 * @param pageSlug - O slug da página a ser atualizada.
 * @param linkToDelete - O objeto exato do link a ser removido.
 */
export const deleteLinkFromPage = async (pageSlug: string, linkToDelete: LinkData): Promise<void> => {
  try {
    const pageDocRef = doc(db, "pages", pageSlug);
    await updateDoc(pageDocRef, {
      links: arrayRemove(linkToDelete)
    });
  } catch (error) {
    console.error("Erro ao excluir link:", error);
    throw new Error("Não foi possível excluir o link.");
  }
};

/**
 * ATUALIZA O ARRAY DE LINKS INTEIRO NO DOCUMENTO.
 * @param pageSlug - O slug da página a ser atualizada.
 * @param updatedLinks - O array de links completo e atualizado.
 */
export const updateLinksOnPage = async (pageSlug: string, updatedLinks: LinkData[]): Promise<void> => {
  try {
    const pageDocRef = doc(db, "pages", pageSlug);
    await updateDoc(pageDocRef, {
      links: updatedLinks
    });
  } catch (error) {
    console.error("Erro ao atualizar os links:", error);
    throw new Error("Não foi possível atualizar os links.");
  }
};

/**
 * Busca os dados de uma página pública diretamente pelo seu slug.
 * @param slug - O identificador (ID do documento) da página na coleção 'pages'.
 * @returns Os dados completos da página ou null se não for encontrada.
 */
export const getPageDataBySlug = async (slug: string): Promise<DocumentData | null> => {
  try {
    const pageDocRef = doc(db, "pages", slug);
    const pageDocSnap = await getDoc(pageDocRef);

    if (pageDocSnap.exists()) {
      return pageDocSnap.data();
    } else {
      console.log(`Nenhum documento de página encontrado para o slug: ${slug}`);
      return null;
    }
  } catch (error) {
    console.error("Erro ao buscar dados da página pelo slug:", error);
    return null;
  }
};

/**
 * ATUALIZA APENAS O CAMPO 'theme' DE UMA PÁGINA.
 * @param pageSlug - O slug da página a ser atualizada.
 * @param theme - O nome do novo tema (ex: 'light', 'dark', 'ocean').
 */
export const updatePageTheme = async (pageSlug: string, theme: string): Promise<void> => {
  try {
    const pageDocRef = doc(db, "pages", pageSlug);
    await updateDoc(pageDocRef, {
      theme: theme
    });
  } catch (error) {
    console.error("Erro ao atualizar o tema:", error);
    throw new Error("Não foi possível atualizar o tema.");
  }
};


// --- NOVAS FUNÇÕES DE ADMIN ---

/**
 * Busca um usuário pelo seu email. Requer índice no Firestore.
 * @param email - O email do usuário a ser encontrado.
 * @returns Os dados do usuário (incluindo UID) ou null se não encontrado.
 */
export const findUserByEmail = async (email: string): Promise<(UserData & { uid: string }) | null> => {
  if (!email) return null; // Evita query vazia
  try {
    const usersRef = collection(db, "users");
    // Cria uma query para buscar pelo campo 'email'
    const q = query(usersRef, where("email", "==", email.trim())); // Adiciona trim() para segurança
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log(`Nenhum usuário encontrado com o email: ${email}`);
      return null;
    }

    // Pega o primeiro resultado (emails devem ser únicos, mas a query pode retornar mais se houver erro)
    if (querySnapshot.docs.length > 1) {
       console.warn(`Múltiplos usuários encontrados com o email ${email}. Retornando o primeiro.`);
    }
    const userDoc = querySnapshot.docs[0];
    // Retorna um objeto combinado com o UID e os dados do documento
    return { uid: userDoc.id, ...(userDoc.data() as UserData) };

  } catch (error) {
    console.error("Erro ao buscar usuário por email:", error);
    // Verificar se é erro de índice faltando
    // @ts-expect-error - O 'error' pego no catch é 'unknown', mas sabemos que erros do Firebase têm a propriedade 'code'.
    if (error.code === 'failed-precondition') {
      console.error("ERRO: Índice do Firestore provavelmente faltando para a coleção 'users' no campo 'email'. Verifique o console do Firebase para criar o índice.");
      alert("Erro ao buscar: Índice do banco de dados necessário. Verifique o console para mais detalhes.");
    }
    return null;
  }
};


/**
 * Atualiza o plano de um usuário específico (requer permissão de admin via regras).
 * @param targetUserId - O UID do usuário cujo plano será atualizado.
 * @param newPlan - O novo status do plano ('free' or 'pro').
 */
export const updateUserPlan = async (targetUserId: string, newPlan: 'free' | 'pro'): Promise<void> => {
  if (!targetUserId) {
    throw new Error("UID do usuário alvo não pode ser vazio.");
  }
  try {
    const userDocRef = doc(db, "users", targetUserId);
    await updateDoc(userDocRef, {
      plan: newPlan
    });
    console.log(`Plano do usuário ${targetUserId} atualizado para ${newPlan}`);
  } catch (error) {
    console.error(`Erro ao atualizar plano do usuário ${targetUserId}:`, error);
    // Tenta dar uma mensagem de erro mais útil baseada no código do erro
    // @ts-expect-error - O 'error' pego no catch é 'unknown', mas sabemos que erros do Firebase têm a propriedade 'code'.
    if (error.code === 'permission-denied') {
        throw new Error("Permissão negada. Verifique as regras de segurança do Firestore e se você está logado como admin.");
    }
    throw new Error("Falha ao atualizar o plano do usuário."); // Re-lança para tratamento no UI
  }
};

// --- FIM DAS NOVAS FUNÇÕES DE ADMIN ---