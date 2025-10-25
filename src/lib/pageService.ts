// src/lib/pageService.ts

import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, DocumentData } from "firebase/firestore";
import { db } from "./firebaseClient";

// Tipo para os dados de um link individual (com campo 'icon' opcional)
export type LinkData = {
  title: string;
  url: string;
  type: string;
  order: number;
  icon?: string; // NOVO CAMPO
};

// Tipo para os dados da página inteira (com campo 'theme' opcional)
export type PageData = {
  title: string;
  bio: string;
  links: LinkData[];
  theme?: string; // NOVO CAMPO
  profileImageUrl?: string; // Adicionado para garantir que o tipo esteja completo
}

/**
 * Busca os dados da página de um usuário.
 */
export const getPageDataForUser = async (userId: string): Promise<{ slug: string, data: DocumentData } | null> => {
  try {
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

/**
 * ATUALIZA O TEMA DE UMA PÁGINA.
 * @param pageSlug - O slug da página a ser atualizada.
 * @param theme - O nome do tema (ex: 'light', 'dark').
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