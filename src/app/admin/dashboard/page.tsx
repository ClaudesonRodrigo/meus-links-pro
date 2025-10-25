// src/app/admin/dashboard/page.tsx
'use client';

import React, { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { signOutUser } from '@/lib/authService';
import { getPageDataForUser, addLinkToPage, deleteLinkFromPage, updateLinksOnPage, updatePageTheme, PageData, LinkData } from '@/lib/pageService';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [pageData, setPageData] = useState<PageData | null>(null);
  const [pageSlug, setPageSlug] = useState<string | null>(null);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkIcon, setNewLinkIcon] = useState('');
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingUrl, setEditingUrl] = useState('');
  const [editingIcon, setEditingIcon] = useState('');
  const [copyButtonText, setCopyButtonText] = useState('Copiar');

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

  useEffect(() => {
    if (!loading && user) {
      fetchPageData();
    }
  }, [user, loading]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin/login');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await signOutUser();
  };

  const handleAddLink = async (e: FormEvent) => {
    e.preventDefault();
    if (!pageSlug || !newLinkTitle || !newLinkUrl) {
      alert("Por favor, preencha o Título e a URL.");
      return;
    }
    const newLink: LinkData = {
      title: newLinkTitle,
      url: newLinkUrl,
      icon: newLinkIcon || undefined,
      type: "website",
      order: pageData?.links.length ? pageData.links.length + 1 : 1,
    };
    try {
      await addLinkToPage(pageSlug, newLink);
      setNewLinkTitle('');
      setNewLinkUrl('');
      setNewLinkIcon('');
      await fetchPageData();
    } catch (error) {
      alert("Falha ao adicionar o link.");
    }
  };

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

  const handleEditClick = (link: LinkData, index: number) => {
    setEditingIndex(index);
    setEditingTitle(link.title);
    setEditingUrl(link.url);
    setEditingIcon(link.icon || '');
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingTitle('');
    setEditingUrl('');
    setEditingIcon('');
  };

  const handleUpdateLink = async (indexToUpdate: number) => {
    if (!pageSlug || !pageData) return;
    const updatedLinks = [...pageData.links];
    updatedLinks[indexToUpdate] = {
      ...updatedLinks[indexToUpdate],
      title: editingTitle,
      url: editingUrl,
      icon: editingIcon || undefined,
    };
    try {
      await updateLinksOnPage(pageSlug, updatedLinks);
      handleCancelEdit();
      await fetchPageData();
    } catch (error) {
      alert("Falha ao atualizar o link.");
    }
  };

  const handleCopyUrl = () => {
    if (!pageSlug) return;
    const shareableUrl = `${window.location.origin}/${pageSlug}`;
    navigator.clipboard.writeText(shareableUrl);
    setCopyButtonText('Copiado!');
    setTimeout(() => {
      setCopyButtonText('Copiar');
    }, 2000);
  };

  const handleThemeChange = async (theme: string) => {
    if (!pageSlug) return;
    try {
      await updatePageTheme(pageSlug, theme);
      await fetchPageData();
    } catch (error) {
      alert("Falha ao atualizar o tema.");
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
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-800">Meu Painel</h1>
              </div>
              <div className="flex items-center">
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md text-sm transition duration-150 ease-in-out"
                >
                  Sair
                </button>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Bem-vindo, {pageData?.title || user.displayName}!
            </h2>
            <p className="text-gray-700 mb-2">
              Gerencie sua página de links abaixo.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Sua Página está no Ar!</h3>
            <p className="text-gray-600 mb-4">Compartilhe este link com seu público:</p>
            <div className="flex flex-col sm:flex-row items-center gap-2 p-3 bg-gray-100 rounded-md">
              <span className="text-blue-600 truncate font-mono text-sm">
                {`${typeof window !== 'undefined' ? window.location.origin : ''}/${pageSlug}`}
              </span>
              <button
                onClick={handleCopyUrl}
                className="w-full sm:w-auto sm:ml-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md text-sm transition-all duration-200 ease-in-out whitespace-nowrap"
              >
                {copyButtonText}
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Aparência</h3>
            <p className="text-gray-600 mb-4">Escolha um tema para sua página.</p>
            <div className="flex gap-4">
              <button onClick={() => handleThemeChange('light')} className={`p-4 rounded-lg border-2 ${pageData?.theme !== 'dark' ? 'border-blue-600' : 'border-gray-300'}`}>Claro</button>
              <button onClick={() => handleThemeChange('dark')} className={`p-4 rounded-lg border-2 ${pageData?.theme === 'dark' ? 'border-blue-600' : 'border-gray-300'}`}>Escuro</button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Adicionar Novo Link</h3>
            <form onSubmit={handleAddLink} className="space-y-4">
              <div>
                <label htmlFor="linkTitle" className="block text-sm font-medium text-gray-700">Título</label>
                <input
                  type="text" id="linkTitle" value={newLinkTitle} onChange={(e) => setNewLinkTitle(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Ex: Meu Portfólio"
                />
              </div>
              <div>
                <label htmlFor="linkUrl" className="block text-sm font-medium text-gray-700">URL</label>
                <input
                  type="url" id="linkUrl" value={newLinkUrl} onChange={(e) => setNewLinkUrl(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="https://..."
                />
              </div>
              <div>
                <label htmlFor="linkIcon" className="block text-sm font-medium text-gray-700">Ícone (opcional)</label>
                <input
                  type="text" id="linkIcon" value={newLinkIcon} onChange={(e) => setNewLinkIcon(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Ex: github, instagram, linkedin, globe"
                />
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md">Adicionar Link</button>
            </form>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Meus Links Atuais</h3>
            <div className="bg-white p-6 rounded-lg shadow space-y-4">
              {pageData?.links && pageData.links.length > 0 ? (
                pageData.links.map((link, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-md">
                    {editingIndex === index ? (
                      <div className="space-y-3">
                        <input
                          type="text" value={editingTitle} onChange={(e) => setEditingTitle(e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                        <input
                          type="url" value={editingUrl} onChange={(e) => setEditingUrl(e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                        <input
                          type="text" value={editingIcon} onChange={(e) => setEditingIcon(e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" placeholder="Ícone (opcional)"
                        />
                        <div className="flex justify-end space-x-2">
                          <button onClick={handleCancelEdit} className="bg-gray-200 text-gray-800 hover:bg-gray-300 font-semibold py-1 px-3 rounded-md text-sm">Cancelar</button>
                          <button onClick={() => handleUpdateLink(index)} className="bg-green-600 text-white hover:bg-green-700 font-semibold py-1 px-3 rounded-md text-sm">Salvar</button>
                        </div>
                      </div>
                    ) : (
                      // ALTERAÇÃO PARA RESPONSIVIDADE AQUI
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div className="flex-1 min-w-0"> {/* Garante que o texto quebre se necessário */}
                          <p className="font-semibold text-gray-800 truncate">{link.title}</p> {/* truncate evita que título muito longo quebre o layout */}
                          <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline break-all">{link.url}</a> {/* break-all para URLS longas */}
                        </div>
                        {/* Container dos botões agora é flexível */}
                        <div className='flex flex-col sm:flex-row gap-2 sm:gap-0 sm:space-x-2 w-full sm:w-auto'>
                          <button onClick={() => handleEditClick(link, index)} className="w-full sm:w-auto bg-blue-100 text-blue-700 hover:bg-blue-200 font-semibold py-1 px-3 rounded-md text-sm">Editar</button>
                          <button onClick={() => handleDeleteLink(link)} className="w-full sm:w-auto bg-red-100 text-red-700 hover:bg-red-200 font-semibold py-1 px-3 rounded-md text-sm">Excluir</button>
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