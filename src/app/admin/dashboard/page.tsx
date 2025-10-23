// src/app/admin/dashboard/page.tsx
'use client';

import React, { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { signOutUser } from '@/lib/authService';
import { getPageDataForUser, addLinkToPage, deleteLinkFromPage, updateLinksOnPage, PageData, LinkData } from '@/lib/pageService';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [pageData, setPageData] = useState<PageData | null>(null);
  const [pageSlug, setPageSlug] = useState<string | null>(null);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [isLoadingData, setIsLoadingData] = useState(true);

  // NOVOS ESTADOS PARA CONTROLAR A EDIÇÃO
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingUrl, setEditingUrl] = useState('');

  // Função para buscar os dados
  const fetchPageData = async () => {
    if (user) {
      setIsLoadingData(true);
      const result = await getPageDataForUser(user.uid);
      if (result) {
        setPageData(result.data as PageData);
        setPageSlug(result.slug);
      }
      setIsLoadingData(false);
    }
  };

  // Efeito para buscar os dados quando o usuário é carregado
  useEffect(() => {
    if (!loading && user) {
      fetchPageData();
    }
  }, [user, loading]);

  // Efeito para proteger a rota
  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin/login');
    }
  }, [user, loading, router]);

  // Handler para o botão de sair
  const handleLogout = async () => {
    await signOutUser();
  };
  
  // FUNÇÃO PARA ADICIONAR UM NOVO LINK
  const handleAddLink = async (e: FormEvent) => {
    e.preventDefault();
    if (!pageSlug || !newLinkTitle || !newLinkUrl) {
      alert("Por favor, preencha todos os campos.");
      return;
    }
    const newLink: LinkData = {
      title: newLinkTitle,
      url: newLinkUrl,
      type: "website",
      order: pageData?.links.length ? pageData.links.length + 1 : 1,
    };
    try {
      await addLinkToPage(pageSlug, newLink);
      setNewLinkTitle('');
      setNewLinkUrl('');
      await fetchPageData();
    } catch (error) {
      alert("Falha ao adicionar o link.");
    }
  };

  // FUNÇÃO PARA EXCLUIR UM LINK
  const handleDeleteLink = async (linkToDelete: LinkData) => {
    if (!window.confirm(`Tem certeza que deseja excluir o link "${linkToDelete.title}"?`)) {
      return;
    }
    if (!pageSlug) {
      alert("Erro: ID da página não encontrado.");
      return;
    }
    try {
      await deleteLinkFromPage(pageSlug, linkToDelete);
      await fetchPageData();
    } catch (error) {
      alert("Falha ao excluir o link.");
    }
  };

  // FUNÇÕES PARA GERENCIAR O MODO DE EDIÇÃO
  const handleEditClick = (link: LinkData, index: number) => {
    setEditingIndex(index);
    setEditingTitle(link.title);
    setEditingUrl(link.url);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingTitle('');
    setEditingUrl('');
  };

  const handleUpdateLink = async (indexToUpdate: number) => {
    if (!pageSlug || !pageData) return;
    const updatedLinks = [...pageData.links];
    updatedLinks[indexToUpdate] = {
      ...updatedLinks[indexToUpdate],
      title: editingTitle,
      url: editingUrl,
    };
    try {
      await updateLinksOnPage(pageSlug, updatedLinks);
      handleCancelEdit();
      await fetchPageData();
    } catch (error) {
      alert("Falha ao atualizar o link.");
    }
  };

  if (loading || isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl">Carregando...</p>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          {/* ...código da navBar (inalterado)... */}
        </nav>

        <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Bem-vindo, {pageData?.title || user.displayName}!
            </h2>
            <p className="text-gray-700 mb-2">
              Edite sua página de links abaixo.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Adicionar Novo Link</h3>
            <form onSubmit={handleAddLink}>
              <div className="mb-4">
                <label htmlFor="linkTitle" className="block text-sm font-medium text-gray-700">Título</label>
                <input
                  type="text"
                  id="linkTitle"
                  value={newLinkTitle}
                  onChange={(e) => setNewLinkTitle(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Ex: Meu Portfólio"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="linkUrl" className="block text-sm font-medium text-gray-700">URL</label>
                <input
                  type="url"
                  id="linkUrl"
                  value={newLinkUrl}
                  onChange={(e) => setNewLinkUrl(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="https://..."
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out"
              >
                Adicionar Link
              </button>
            </form>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Meus Links Atuais
            </h3>
            <div className="bg-white p-6 rounded-lg shadow space-y-4">
              {pageData?.links && pageData.links.length > 0 ? (
                pageData.links.map((link, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-md">
                    {editingIndex === index ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                        <input
                          type="url"
                          value={editingUrl}
                          onChange={(e) => setEditingUrl(e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                        <div className="flex justify-end space-x-2">
                          <button onClick={handleCancelEdit} className="bg-gray-200 text-gray-800 hover:bg-gray-300 font-semibold py-1 px-3 rounded-md text-sm">Cancelar</button>
                          <button onClick={() => handleUpdateLink(index)} className="bg-green-600 text-white hover:bg-green-700 font-semibold py-1 px-3 rounded-md text-sm">Salvar</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-800">{link.title}</p>
                          <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">{link.url}</a>
                        </div>
                        <div className='space-x-2'>
                          <button onClick={() => handleEditClick(link, index)} className="bg-blue-100 text-blue-700 hover:bg-blue-200 font-semibold py-1 px-3 rounded-md text-sm">Editar</button>
                          <button onClick={() => handleDeleteLink(link)} className="bg-red-100 text-red-700 hover:bg-red-200 font-semibold py-1 px-3 rounded-md text-sm">Excluir</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500">Você ainda não tem links. Adicione um acima!</p>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return null;
}