// src/app/admin/dashboard/page.tsx
'use client';

import React, { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { signOutUser } from '@/lib/authService';
import { getPageDataForUser, addLinkToPage, deleteLinkFromPage, updateLinksOnPage, updatePageTheme, PageData, LinkData } from '@/lib/pageService';
import { FaLock } from 'react-icons/fa'; // Importar ícone de cadeado

// Definição dos temas disponíveis (com flag 'isPro')
const themes = [
  { name: 'light', label: 'Claro', colorClass: 'bg-gray-100', isPro: false },
  { name: 'dark', label: 'Escuro', colorClass: 'bg-gray-900', isPro: false },
  { name: 'ocean', label: 'Oceano', colorClass: 'bg-gradient-to-r from-ocean-start to-ocean-end', isPro: true },
  { name: 'sunset', label: 'Pôr do Sol', colorClass: 'bg-gradient-to-r from-sunset-start to-sunset-end', isPro: true },
  { name: 'forest', label: 'Floresta', colorClass: 'bg-forest-bg', isPro: true },
  { name: 'bubblegum', label: 'Chiclete', colorClass: 'bg-bubblegum-bg', isPro: true },
];

export default function DashboardPage() {
  // 1. EXTRAIR userData DO useAuth
  const { user, userData, loading } = useAuth();
  const router = useRouter();

  const [pageData, setPageData] = useState<PageData | null>(null);
  const [pageSlug, setPageSlug] = useState<string | null>(null);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkIcon, setNewLinkIcon] = useState('');
  const [isLoadingData, setIsLoadingData] = useState(true); // Carregando dados da página
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingUrl, setEditingUrl] = useState('');
  const [editingIcon, setEditingIcon] = useState('');
  const [copyButtonText, setCopyButtonText] = useState('Copiar');

  // 2. DETERMINAR SE O PLANO É PRO (baseado no userData do contexto)
  const isProPlan = userData?.plan === 'pro';

  // Função para buscar os dados da página do usuário logado
  const fetchPageData = async () => {
    if (user) {
      setIsLoadingData(true);
      const result = await getPageDataForUser(user.uid);
      if (result) {
        setPageData(result.data as PageData);
        setPageSlug(result.slug);
      } else {
        console.error("Não foi possível carregar os dados da página.");
      }
      setIsLoadingData(false);
    }
  };

  // Busca dados quando o usuário é carregado
  useEffect(() => {
    // 'loading' vem do AuthContext, 'user' é o usuário do Auth
    if (!loading && user) {
      fetchPageData();
    }
  }, [user, loading]);

  // Protege a rota: redireciona para login se não estiver logado
  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin/login');
    }
  }, [user, loading, router]);

  // Função para fazer logout
  const handleLogout = async () => {
    await signOutUser();
    // O AuthContext vai detectar a mudança e o useEffect acima redirecionará
  };

  // Função para adicionar um novo link
  const handleAddLink = async (e: FormEvent) => {
    e.preventDefault();
    if (!pageSlug || !newLinkTitle || !newLinkUrl) {
      alert("Por favor, preencha pelo menos o Título e a URL.");
      return;
    }
    const newLink: LinkData = {
      title: newLinkTitle,
      url: newLinkUrl,
      ...(newLinkIcon && { icon: newLinkIcon }),
      type: "website",
      order: pageData?.links?.length ? pageData.links.length + 1 : 1,
    };
    try {
      await addLinkToPage(pageSlug, newLink);
      setNewLinkTitle('');
      setNewLinkUrl('');
      setNewLinkIcon('');
      await fetchPageData();
    } catch (error) {
      console.error("Erro ao adicionar link:", error);
      alert("Falha ao adicionar o link. Tente novamente.");
    }
  };

  // Função para excluir um link
  const handleDeleteLink = async (linkToDelete: LinkData) => {
    if (!window.confirm(`Tem certeza que deseja excluir o link "${linkToDelete.title}"?`)) {
      return;
    }
    if (!pageSlug) {
      alert("Erro crítico: ID da página não encontrado.");
      return;
    }
    try {
      await deleteLinkFromPage(pageSlug, linkToDelete);
      await fetchPageData();
    } catch (error) {
      console.error("Erro ao excluir link:", error);
      alert("Falha ao excluir o link. Tente novamente.");
    }
  };

  // Funções para controlar o modo de edição de um link
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
    if (!pageSlug || !pageData || !pageData.links) return;
    const updatedLinks = [...pageData.links];
    updatedLinks[indexToUpdate] = {
      ...updatedLinks[indexToUpdate],
      title: editingTitle,
      url: editingUrl,
      ...(editingIcon ? { icon: editingIcon } : { icon: undefined }),
    };
    try {
      await updateLinksOnPage(pageSlug, updatedLinks);
      handleCancelEdit();
      await fetchPageData();
    } catch (error) {
      console.error("Erro ao atualizar link:", error);
      alert("Falha ao atualizar o link. Tente novamente.");
    }
  };

  // Função para copiar a URL pública
  const handleCopyUrl = () => {
    if (!pageSlug) return;
    const shareableUrl = `${window.location.origin}/${pageSlug}`;
    navigator.clipboard.writeText(shareableUrl)
      .then(() => {
        setCopyButtonText('Copiado!');
        setTimeout(() => setCopyButtonText('Copiar'), 2000);
      })
      .catch(err => {
        console.error('Erro ao copiar URL:', err);
        alert('Não foi possível copiar a URL.');
      });
  };

  // Função chamada ao clicar num botão de tema
  const handleThemeChange = async (themeName: string) => {
    // 3. VERIFICAÇÃO ADICIONAL DE LÓGICA FREEMIUM
    const theme = themes.find(t => t.name === themeName);
    if (!theme) return;

    if (theme.isPro && !isProPlan) {
      alert('Este é um tema Pro! Faça upgrade para usá-lo.');
      return;
    }
    
    if (!pageSlug) return;
    try {
      await updatePageTheme(pageSlug, themeName);
      setPageData(prevData => prevData ? { ...prevData, theme: themeName } : null);
    } catch (error) {
      console.error("Erro ao mudar tema:", error);
      alert("Falha ao atualizar o tema. Tente novamente.");
    }
  };

  // Exibe "Carregando..." enquanto o AuthContext (loading) ou os dados da página (isLoadingData) não estão prontos
  if (loading || isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl">Carregando...</p>
      </div>
    );
  }

  // Renderiza o dashboard se o usuário estiver logado
  if (user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm sticky top-0 z-10">
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
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-semibold text-gray-900">
                Bem-vindo, {pageData?.title || user.displayName || 'Usuário'}!
              </h2>
              {/* 4. EXIBIR O PLANO ATUAL (AGORA LENDO DO userData) */}
              <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                isProPlan ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
              }`}>
                Plano: {isProPlan ? 'Pro' : 'Gratuito'}
              </span>
            </div>
            <p className="text-gray-700 mb-2">
              Gerencie sua página de links abaixo.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Sua Página está no Ar!</h3>
            <p className="text-gray-600 mb-4">Compartilhe este link com seu público:</p>
            <div className="flex flex-col sm:flex-row items-center gap-2 p-3 bg-gray-100 rounded-md">
              <span className="text-blue-600 truncate font-mono text-sm">
                {`${typeof window !== 'undefined' ? window.location.origin : ''}/${pageSlug || 'carregando-slug...'}`}
              </span>
              <button
                onClick={handleCopyUrl}
                disabled={!pageSlug}
                className={`w-full sm:w-auto sm:ml-auto text-white font-medium py-2 px-4 rounded-md text-sm transition-all duration-200 ease-in-out whitespace-nowrap ${
                  !pageSlug ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {copyButtonText}
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Aparência</h3>
            <p className="text-gray-600 mb-4">Escolha um tema para sua página pública.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {themes.map((theme) => {
                const isActive = (pageData?.theme || 'light') === theme.name;
                // 5. LÓGICA DE DESABILITAR
                const isDisabled = theme.isPro && !isProPlan;

                return (
                  <button
                    key={theme.name}
                    onClick={() => handleThemeChange(theme.name)} // handleThemeChange agora tem a lógica de verificação
                    disabled={isDisabled}
                    className={`relative p-4 rounded-lg border-2 text-center transition-all duration-150 ease-in-out focus:outline-none ${
                      isActive
                        ? 'border-blue-600 ring-2 ring-blue-300'
                        : isDisabled
                          ? 'border-gray-200 opacity-50 cursor-not-allowed'
                          : 'border-gray-300 hover:border-gray-400'
                    }`}
                    aria-pressed={isActive}
                    aria-disabled={isDisabled}
                  >
                    <div className={`h-10 w-full rounded mb-2 border border-gray-200 ${theme.colorClass}`}></div>
                    <span className="text-sm font-medium text-gray-700 flex items-center justify-center gap-1">
                      {theme.label}
                      {/* 6. ÍCONE DE CADEADO */}
                      {isDisabled && <FaLock className="text-gray-400 w-3 h-3" />}
                    </span>
                  </button>
                );
              })}
            </div>
            {/* 7. MENSAGEM DE UPGRADE */}
            {!isProPlan && (
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Gostou dos temas coloridos? ✨{' '}
                  <a href="#" onClick={(e) => { e.preventDefault(); alert('Página de upgrade em breve!'); }} className="text-blue-600 hover:underline font-medium">
                    Faça upgrade para o plano Pro!
                  </a>
                </p>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Adicionar Novo Link</h3>
            <form onSubmit={handleAddLink} className="space-y-4">
              <div>
                <label htmlFor="linkTitle" className="block text-sm font-medium text-gray-700">Título</label>
                <input required type="text" id="linkTitle" value={newLinkTitle} onChange={(e) => setNewLinkTitle(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Ex: Meu Portfólio"
                />
              </div>
              <div>
                <label htmlFor="linkUrl" className="block text-sm font-medium text-gray-700">URL</label>
                <input required type="url" id="linkUrl" value={newLinkUrl} onChange={(e) => setNewLinkUrl(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="https://..."
                />
              </div>
              <div>
                <label htmlFor="linkIcon" className="block text-sm font-medium text-gray-700">Ícone (opcional)</label>
                <input type="text" id="linkIcon" value={newLinkIcon} onChange={(e) => setNewLinkIcon(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Ex: github, instagram, linkedin, globe"
                />
                 <p className="mt-1 text-xs text-gray-500">Use nomes em minúsculo. (ex: github, instagram, globe)</p>
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out">Adicionar Link</button>
            </form>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Meus Links Atuais</h3>
            <div className="bg-white p-6 rounded-lg shadow space-y-4">
              {pageData?.links && pageData.links.length > 0 ? (
                pageData.links.map((link, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-md border border-gray-200">
                    {editingIndex === index ? (
                      <div className="space-y-3">
                        <div>
                           <label className="text-xs font-medium text-gray-500">Título</label>
                           <input type="text" value={editingTitle} onChange={(e) => setEditingTitle(e.target.value)}
                             className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm" />
                        </div>
                        <div>
                           <label className="text-xs font-medium text-gray-500">URL</label>
                          <input type="url" value={editingUrl} onChange={(e) => setEditingUrl(e.target.value)}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm" />
                        </div>
                         <div>
                           <label className="text-xs font-medium text-gray-500">Ícone</label>
                          <input type="text" value={editingIcon} onChange={(e) => setEditingIcon(e.target.value)}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm" placeholder="Ícone (opcional)" />
                        </div>
                        <div className="flex justify-end space-x-2 pt-2">
                          <button onClick={handleCancelEdit} className="bg-gray-200 text-gray-800 hover:bg-gray-300 font-semibold py-1 px-3 rounded-md text-sm">Cancelar</button>
                          <button onClick={() => handleUpdateLink(index)} className="bg-green-600 text-white hover:bg-green-700 font-semibold py-1 px-3 rounded-md text-sm">Salvar</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 truncate">{link.title}</p>
                          <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline break-all">{link.url}</a>
                           {link.icon && <p className="text-xs text-gray-500 mt-1">Ícone: {link.icon}</p>}
                        </div>
                        <div className='flex flex-col sm:flex-row gap-2 sm:gap-0 sm:space-x-2 w-full sm:w-auto mt-2 sm:mt-0'>
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