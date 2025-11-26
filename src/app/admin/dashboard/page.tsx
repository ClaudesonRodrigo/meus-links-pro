// src/app/admin/dashboard/page.tsx
'use client';

import React, { useEffect, useState, FormEvent, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { signOutUser } from '@/lib/authService';
import {
  getPageDataForUser, addLinkToPage, deleteLinkFromPage, updateLinksOnPage,
  updatePageTheme, updatePageBackground, PageData, LinkData, UserData,
  findUserByEmail, updateUserPlan
} from '@/lib/pageService';
import { FaLock, FaSearch, FaChartBar } from 'react-icons/fa';

// Definição dos temas disponíveis
const themes = [
  { name: 'light', label: 'Claro', colorClass: 'bg-gray-100', isPro: false },
  { name: 'dark', label: 'Escuro', colorClass: 'bg-gray-900', isPro: false },

  // Novos Temas PRO
  { name: 'developer', label: 'Desenvolvedor', colorClass: 'bg-[#0d1117] border border-[#238636]', isPro: true },
  { name: 'realtor', label: 'Corretor (Luxo)', colorClass: 'bg-neutral-900 border border-yellow-600', isPro: true },
  { name: 'restaurant', label: 'Restaurante', colorClass: 'bg-red-900', isPro: true },
  { name: 'mechanic', label: 'Oficina', colorClass: 'bg-slate-800 border-l-4 border-cyan-500', isPro: true },
  { name: 'influencer', label: 'Influencer', colorClass: 'bg-gradient-to-tr from-yellow-400 to-purple-600', isPro: true },

  // Temas Pro Antigos
  { name: 'ocean', label: 'Oceano', colorClass: 'bg-gradient-to-r from-ocean-start to-ocean-end', isPro: true },
  { name: 'sunset', label: 'Pôr do Sol', colorClass: 'bg-gradient-to-r from-sunset-start to-sunset-end', isPro: true },
  { name: 'forest', label: 'Floresta', colorClass: 'bg-forest-bg', isPro: true },
  { name: 'bubblegum', label: 'Chiclete', colorClass: 'bg-bubblegum-bg', isPro: true },
];

export default function DashboardPage() {
  const { user, userData, loading } = useAuth();
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

  // Estado para a imagem de fundo personalizada
  const [customBgUrl, setCustomBgUrl] = useState('');

  const isProPlan = userData?.plan === 'pro';

  const [isAdmin, setIsAdmin] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [foundUser, setFoundUser] = useState<(UserData & { uid: string }) | null>(null);
  const [adminMessage, setAdminMessage] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);

  const whatsappNumber = "5579996337995";

  const generateWhatsAppLink = (planType: 'Mensal' | 'Anual', price: string) => {
    const message = `Olá! Gostaria de fazer o upgrade para o plano Pro ${planType} (R$${price}).`;
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  };

  useEffect(() => {
    if (!loading && userData) {
      setIsAdmin(userData.role === 'admin');
    } else {
      setIsAdmin(false);
    }
  }, [userData, loading, user]);

  const fetchPageData = useCallback(async () => {
    if (user) {
      setIsLoadingData(true);
      const result = await getPageDataForUser(user.uid);
      if (result) {
        const data = result.data as PageData;
        setPageData(data);
        setPageSlug(result.slug);
        // Carrega a imagem de fundo atual se existir
        if (data.backgroundImage) {
          setCustomBgUrl(data.backgroundImage);
        }
      } else {
        console.error("Não foi possível carregar os dados da página do usuário logado.");
        setPageData(null);
        setPageSlug(null);
      }
      setIsLoadingData(false);
    } else {
      setIsLoadingData(false);
    }
  }, [user]);

  useEffect(() => {
    if (!loading && user) {
      fetchPageData();
    } else if (!loading && !user) {
      setIsLoadingData(false);
    }
  }, [user, loading, fetchPageData]);

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
      alert("Por favor, preencha pelo menos o Título e a URL.");
      return;
    }
    const currentLinks = pageData?.links || [];
    const newOrder = currentLinks.length > 0 ? Math.max(...currentLinks.map(l => l.order)) + 1 : 1;

    const newLink: LinkData = {
      title: newLinkTitle,
      url: newLinkUrl,
      ...(newLinkIcon.trim() && { icon: newLinkIcon.trim().toLowerCase() }),
      type: "website",
      order: newOrder,
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
      alert("Falha ao excluir o link. Verifique o console ou tente novamente.");
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
    if (!pageSlug || !pageData || !pageData.links || editingIndex !== indexToUpdate) return;

    const updatedLinks = [...pageData.links];

    updatedLinks[indexToUpdate] = {
      ...updatedLinks[indexToUpdate],
      title: editingTitle,
      url: editingUrl,
      ...(editingIcon.trim() ? { icon: editingIcon.trim().toLowerCase() } : { icon: undefined }),
    };

    if (!editingIcon.trim()) {
      delete updatedLinks[indexToUpdate].icon;
    }

    try {
      await updateLinksOnPage(pageSlug, updatedLinks);
      handleCancelEdit();
      await fetchPageData();
    } catch (error) {
      console.error("Erro ao atualizar link:", error);
      alert("Falha ao atualizar o link. Tente novamente.");
    }
  };

  const handleCopyUrl = () => {
    if (!pageSlug) return;
    const shareableUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/${pageSlug}`;
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

  const handleThemeChange = async (themeName: string) => {
    const theme = themes.find(t => t.name === themeName);
    if (!theme) return;

    if (theme.isPro && !isProPlan) {
      alert('Este é um tema Pro! Faça upgrade para usá-lo.');
      return;
    }

    if (!pageSlug) {
      alert("Erro: Slug da página não encontrado para salvar o tema.");
      return;
    };

    try {
      await updatePageTheme(pageSlug, themeName);
      setPageData(prevData => prevData ? { ...prevData, theme: themeName } : null);
    } catch (error) {
      console.error("Erro ao mudar tema:", error);
      alert("Falha ao atualizar o tema. Tente novamente.");
    }
  };

  // Função para salvar a imagem de fundo
  const handleSaveBackground = async () => {
    if (!isProPlan) {
      alert("Imagem de fundo personalizada é um recurso Pro!");
      return;
    }
    if (!pageSlug) return;

    try {
      await updatePageBackground(pageSlug, customBgUrl);
      setPageData(prevData => prevData ? { ...prevData, backgroundImage: customBgUrl } : null);
      alert("Imagem de fundo atualizada!");
    } catch (error) {
      console.error("Erro ao salvar imagem de fundo:", error);
      alert("Erro ao salvar imagem.");
    }
  };

  const handleSearchUser = async (e: FormEvent) => {
    e.preventDefault();
    if (!searchEmail) return;
    setIsSearching(true);
    setAdminMessage(null);
    setFoundUser(null);
    try {
      const userResult = await findUserByEmail(searchEmail);
      if (userResult) {
        setFoundUser(userResult);
      } else {
        setAdminMessage(`Usuário com email "${searchEmail}" não encontrado.`);
      }
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      setAdminMessage("Ocorreu um erro ao buscar o usuário. Verifique o console.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleChangePlan = async (newPlan: 'pro' | 'free') => {
    if (!foundUser) return;
    setIsUpdatingPlan(true);
    setAdminMessage(null);
    try {
      await updateUserPlan(foundUser.uid, newPlan);
      setFoundUser(prev => prev ? { ...prev, plan: newPlan } : null);
      setAdminMessage(`Plano do usuário ${foundUser.email} atualizado para '${newPlan}' com sucesso!`);
    } catch (error) {
      console.error("Erro ao atualizar plano:", error);
      setAdminMessage(`Falha ao atualizar o plano: ${(error as Error).message}`);
    } finally {
      setIsUpdatingPlan(false);
    }
  };

  if (loading || (!isAdmin && isLoadingData)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl">Carregando...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-800">Meu Painel {isAdmin && <span className="text-red-600 text-sm">(Admin)</span>}</h1>
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
              Bem-vindo, {pageData?.title || userData?.displayName || user.displayName || 'Usuário'}!
            </h2>
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${isProPlan ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
              }`}>
              Plano: {isProPlan ? 'Pro' : 'Gratuito'}
            </span>
          </div>
          <p className="text-gray-700 mb-2">
            Gerencie sua página de links abaixo.
          </p>
          {isLoadingData && !pageData && <p className="text-sm text-yellow-600">Carregando dados da sua página...</p>}
          {!isLoadingData && !pageData && !isAdmin && <p className="text-sm text-red-600">Não foi possível carregar os dados da sua página. Tente recarregar.</p>}
        </div>

        {pageSlug && (
          <>
            <div className="bg-white p-6 rounded-lg shadow mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Sua Página está no Ar!</h3>
              <p className="text-gray-600 mb-4">Compartilhe este link com seu público:</p>
              <div className="flex flex-col sm:flex-row items-center gap-2 p-3 bg-gray-100 rounded-md">
                <span className="text-blue-600 truncate font-mono text-sm">
                  {`${typeof window !== 'undefined' ? window.location.origin : ''}/${pageSlug}`}
                </span>
                <button
                  onClick={handleCopyUrl}
                  className={`w-full sm:w-auto sm:ml-auto text-white font-medium py-2 px-4 rounded-md text-sm transition-all duration-200 ease-in-out whitespace-nowrap bg-blue-600 hover:bg-blue-700`}
                >
                  {copyButtonText}
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow mb-8" id="appearance-section">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Aparência</h3>
              <p className="text-gray-600 mb-4">Escolha um tema para sua página pública.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                {themes.map((theme) => {
                  const isActive = (pageData?.theme || 'light') === theme.name;
                  const isDisabledByPlan = theme.isPro && !isProPlan;

                  return (
                    <button
                      key={theme.name}
                      onClick={() => handleThemeChange(theme.name)}
                      disabled={isDisabledByPlan}
                      className={`relative p-4 rounded-lg border-2 text-center transition-all duration-150 ease-in-out focus:outline-none ${isActive
                        ? 'border-blue-600 ring-2 ring-blue-300'
                        : isDisabledByPlan
                          ? 'border-gray-200 opacity-50 cursor-not-allowed'
                          : 'border-gray-300 hover:border-gray-400'
                        }`}
                      aria-pressed={isActive}
                      aria-disabled={isDisabledByPlan}
                    >
                      <div className={`h-10 w-full rounded mb-2 border border-gray-200 ${theme.colorClass}`}></div>
                      <span className="text-sm font-medium text-gray-700 flex items-center justify-center gap-1">
                        {theme.label}
                        {isDisabledByPlan && <FaLock className="text-gray-400 w-3 h-3" />}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Seção de Imagem de Fundo Personalizada */}
              <div className="border-t pt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-2 flex items-center gap-2">
                  Imagem de Fundo Personalizada
                  {!isProPlan && <FaLock className="text-gray-400 w-4 h-4" />}
                </h4>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="url"
                    placeholder="Cole o link da sua imagem aqui (https://...)"
                    className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={customBgUrl}
                    onChange={(e) => setCustomBgUrl(e.target.value)}
                    disabled={!isProPlan}
                  />
                  <button
                    onClick={handleSaveBackground}
                    disabled={!isProPlan}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Salvar Imagem
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Cole a URL direta de uma imagem (ex: Google Images, Unsplash).</p>
              </div>

              {!isProPlan && (
                <div className="mt-8 pt-6 border-t border-gray-200" id="upgrade-section">
                  <h4 className="text-lg font-semibold text-center text-gray-800 mb-4">
                    ✨ Desbloqueie todos os temas com o Plano Pro! ✨
                  </h4>
                  <p className="text-center text-gray-600 mb-6">
                    Escolha seu plano e fale conosco no WhatsApp para ativar:
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <a
                      href={generateWhatsAppLink('Mensal', '9,99')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out"
                    >
                      Pro Mensal - R$9,99
                    </a>
                    <a
                      href={generateWhatsAppLink('Anual', '90,00')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out"
                    >
                      Pro Anual - R$90,00 <span className="text-xs opacity-80">(Economize!)</span>
                    </a>
                  </div>
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
                  <p className="mt-1 text-xs text-gray-500">Use nomes em minúsculo. (ex: github, instagram, globe, link)</p>
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out">Adicionar Link</button>
              </form>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Meus Links Atuais</h3>
              <div className="bg-white p-6 rounded-lg shadow space-y-4">
                {pageData?.links && pageData.links.length > 0 ? (
                  [...pageData.links]
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map((link, index) => (
                      <div key={link.url + index} className="p-3 bg-gray-50 rounded-md border border-gray-200">
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
                              <p className="mt-1 text-xs text-gray-500">Ex: github, instagram, linkedin, globe</p>
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

                              <div className="flex items-center text-xs text-gray-600 mt-1 gap-1" title="Total de cliques">
                                <FaChartBar className="text-blue-500" />
                                <span className="font-medium">{link.clicks || 0} cliques</span>
                              </div>
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
          </>
        )}

        {isAdmin && (
          <div className="mt-12 border-t-2 border-red-600 pt-8">
            <h3 className="text-2xl font-bold text-red-700 mb-6 text-center">
              🛡️ Painel do Super Admin 🛡️
            </h3>
            <div className="bg-white p-6 rounded-lg shadow-lg border border-red-200">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Gerenciar Planos de Usuários</h4>
              <form onSubmit={handleSearchUser} className="flex flex-col sm:flex-row gap-2 mb-4">
                <input
                  type="email"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  placeholder="Digite o email do usuário"
                  required
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                />
                <button
                  type="submit"
                  disabled={isSearching}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out flex items-center justify-center disabled:opacity-50"
                >
                  <FaSearch className="mr-2 h-4 w-4" /> {isSearching ? 'Buscando...' : 'Buscar Usuário'}
                </button>
              </form>

              {adminMessage && (
                <p className={`text-sm mb-4 p-3 rounded-md ${adminMessage.includes('sucesso')
                  ? 'bg-green-100 text-green-700'
                  : adminMessage.includes('não encontrado')
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                  }`}
                >
                  {adminMessage}
                </p>
              )}

              {foundUser && (
                <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Usuário:</span> {foundUser.displayName || '(Sem nome)'} ({foundUser.email})
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">UID:</span> {foundUser.uid}
                  </p>
                  <p className="text-sm text-gray-700 mb-3">
                    <span className="font-semibold">Plano Atual:</span>
                    <span className={`ml-1 font-medium px-2 py-0.5 rounded ${foundUser.plan === 'pro' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                      {foundUser.plan === 'pro' ? 'Pro' : 'Gratuito'}
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {foundUser.plan === 'free' && (
                      <button
                        onClick={() => handleChangePlan('pro')}
                        disabled={isUpdatingPlan}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-1 px-3 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUpdatingPlan ? 'Atualizando...' : 'Ativar Plano Pro'}
                      </button>
                    )}
                    {foundUser.plan === 'pro' && (
                      <button
                        onClick={() => handleChangePlan('free')}
                        disabled={isUpdatingPlan}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-1 px-3 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUpdatingPlan ? 'Atualizando...' : 'Desativar Pro (Tornar Gratuito)'}
                      </button>
                    )}
                    <button
                      onClick={() => { setFoundUser(null); setSearchEmail(''); setAdminMessage(null); }}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-1 px-3 rounded-md text-sm"
                    >
                      Limpar Busca
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}