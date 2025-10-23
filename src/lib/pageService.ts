// src/lib/pageService.ts

import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, DocumentData } from "firebase/firestore";
import { db } from "./firebaseClient";

// Tipo para os dados de um link individual
export type LinkData = {
  title: string;
  url: string;
  type: string;
  order: number;
};

// Tipo para os dados da página inteira
export type PageData = {
  title: string;
  bio: string;
  links: LinkData[];
  // Adicione outros campos que você possa ter
}

/**
 * Busca os dados da página de um usuário.
 * Primeiro, busca o 'pageSlug' do usuário na coleção 'users'.
 * Depois, usa o slug para buscar os dados na coleção 'pages'.
 * @param userId - O ID do usuário autenticado.
 * @returns Os dados da página ou null se não for encontrada.
 */
export const getPageDataForUser = async (userId: string): Promise<{ slug: string, data: DocumentData } | null> => {
  try {
    // 1. Buscar o documento do usuário para obter o pageSlug
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      console.error("Documento de usuário não encontrado!");
      return null;
    }

    const pageSlug = userDocSnap.data()?.pageSlug;
    if (!pageSlug) {
      console.error("pageSlug não encontrado para o usuário!");
      return null;
    }

    // 2. Usar o pageSlug para buscar os dados da página
    const pageDocRef = doc(db, "pages", pageSlug);
    const pageDocSnap = await getDoc(pageDocRef);

    if (pageDocSnap.exists()) {
      return { slug: pageSlug, data: pageDocSnap.data() };
    } else {
      console.log("Nenhum documento de página encontrado!");
      return null;
    }
  } catch (error) {
    console.error("Erro ao buscar dados da página:", error);
    return null;
  }
};

/**
 * Adiciona um novo link ao array de links de uma página.
 * @param pageSlug - O slug da página a ser atualizada.
 * @param newLink - O objeto do novo link a ser adicionado.
 */
export const addLinkToPage = async (pageSlug: string, newLink: LinkData): Promise<void> => {
  try {
    const pageDocRef = doc(db, "pages", pageSlug);
    await updateDoc(pageDocRef, {
      links: arrayUnion(newLink) // arrayUnion adiciona o item ao array sem duplicar
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
      links: arrayRemove(linkToDelete) // arrayRemove encontra e remove o item do array
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
      links: updatedLinks // Substitui o array antigo pelo novo
    });
  } catch (error) {
    console.error("Erro ao atualizar os links:", error);
    throw new Error("Não foi possível atualizar os links.");
  }
};

/**
 * Busca os dados de uma página pública diretamente pelo seu slug.
 * @param slug - O identificador da página na URL.
 * @returns Os dados da página ou null se não for encontrada.
 */
export const getPageDataBySlug = async (slug: string): Promise<DocumentData | null> => {
  try {
    const pageDocRef = doc(db, "pages", slug);
    const pageDocSnap = await getDoc(pageDocRef);

    if (pageDocSnap.exists()) {
      return pageDocSnap.data();
    } else {
      console.log("Nenhum documento de página encontrado para este slug!");
      return null;
    }
  } catch (error) {
    console.error("Erro ao buscar dados da página pelo slug:", error);
    return null;
  }
};