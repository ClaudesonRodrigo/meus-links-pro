// src/lib/pageService.ts

import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, DocumentData } from "firebase/firestore";
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
}

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
      console.error("pageSlug não encontrado para o usuário!");
      return null;
    }

    // Usar o pageSlug para buscar os dados da página
    const pageDocRef = doc(db, "pages", pageSlug);
    const pageDocSnap = await getDoc(pageDocRef);

    if (pageDocSnap.exists()) {
      // Retorna tanto o slug quanto os dados
      return { slug: pageSlug, data: pageDocSnap.data() };
    } else {
      console.log("Nenhum documento de página encontrado para este usuário!"); // Alterado log
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