// src/app/admin/dashboard/page.tsx
'use client';

import React, { useEffect, useState, FormEvent, useCallback } from 'react'; // Adicionar useCallback
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { signOutUser } from '@/lib/authService';
// Importar as novas funções de admin e o tipo UserData
import {
  getPageDataForUser, addLinkToPage, deleteLinkFromPage, updateLinksOnPage,
  updatePageTheme, PageData, LinkData, UserData, // Adicionar UserData
  findUserByEmail, updateUserPlan // Adicionar funções admin
} from '@/lib/pageService';
import { FaLock, FaSearch } from 'react-icons/fa'; // Adicionar FaSearch

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
  // HOOKS E ESTADOS EXISTENTES
  const { user, userData, loading } = useAuth(); // userData agora pode ter 'role'
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

  // Determina se o plano é Pro (baseado nos dados do usuário logado)
  const isProPlan = userData?.plan === 'pro';

  // --- NOVOS ESTADOS PARA O PAINEL ADMIN ---
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [foundUser, setFoundUser] = useState<(UserData & { uid: string }) | null>(null); // Inclui UID
  const [adminMessage, setAdminMessage] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);
  // --- FIM DOS NOVOS ESTADOS ---

  // SEU NÚMERO DE WHATSAPP (com código do país, sem '+' ou espaços)
  const whatsappNumber = "5579996337995";

  // Função para gerar link do WhatsApp
  const generateWhatsAppLink = (planType: 'Mensal' | 'Anual', price: string) => {
    const message = `Olá! Gostaria de fazer o upgrade para o plano Pro ${planType} (R$${price}).`;
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  };

  // Determina se é admin QUANDO userData carregar
  useEffect(() => {
    if (!loading && userData) { // Verifica se loading terminou E userData existe
        setIsAdmin(userData.role === 'admin');
    } else if (!loading && !userData && user) {
        // Caso estranho: usuário logado mas sem dados no Firestore ainda?
        console.warn("Usuário logado mas userData ainda é null/undefined após carregamento.");
        setIsAdmin(false);
    } else {
        setIsAdmin(false); // Garante que é false durante o loading ou se não houver userData
    }
  }, [userData, loading, user]); // Adiciona 'user' como dependência


  // Função fetchPageData precisa ser estável com useCallback
  const fetchPageData = useCallback(async () => {
    if (user) {
      setIsLoadingData(true);
      const result = await getPageDataForUser(user.uid);
      if (result) {
        setPageData(result.data as PageData);
        setPageSlug(result.slug);
      } else {
        console.error("Não foi possível carregar os dados da página do usuário logado.");
        // Considerar mostrar um erro para o usuário aqui
        setPageData(null); // Limpa dados antigos se falhar
        setPageSlug(null);
      }
      setIsLoadingData(false);
    } else {
       setIsLoadingData(false); // Garante que pare de carregar se não houver usuário
    }
  }, [user]); // Depende apenas de 'user'

  // Busca dados quando o usuário é carregado
  useEffect(() => {
    // Só busca dados se não estiver carregando a autenticação E houver um usuário
    if (!loading && user) {
      fetchPageData();
    } else if (!loading && !user) {
       // Se terminou de carregar e não há usuário, não precisa buscar dados da página
       setIsLoadingData(false);
    }
  }, [user, loading, fetchPageData]); // Adiciona fetchPageData como dependência

  // Protege a rota: redireciona para login se não estiver logado E não estiver carregando
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
    const currentLinks = pageData?.links || [];
    const newOrder = currentLinks.length > 0 ? Math.max(...currentLinks.map(l => l.order)) + 1 : 1;

    const newLink: LinkData = {
      title: newLinkTitle,
      url: newLinkUrl,
      ...(newLinkIcon.trim() && { icon: newLinkIcon.trim().toLowerCase() }), // Salva lowercase e só se não for vazio
      type: "website", // Pode ser 'website', 'social', etc. no futuro
      order: newOrder,
    };
    try {
      await addLinkToPage(pageSlug, newLink);
      setNewLinkTitle('');
      setNewLinkUrl('');
      setNewLinkIcon('');
      await fetchPageData(); // Recarrega os dados para mostrar o novo link
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
      // Importante: O Firestore arrayRemove precisa do objeto EXATO.
      // Se houver problemas, pode ser necessário buscar o documento, encontrar o link pelo título/url e então remover.
      // Mas vamos tentar diretamente primeiro.
      await deleteLinkFromPage(pageSlug, linkToDelete);
      await fetchPageData(); // Recarrega os dados
    } catch (error) {
      console.error("Erro ao excluir link:", error);
      alert("Falha ao excluir o link. Verifique o console ou tente novamente.");
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
    // Limpar os estados de edição seria bom aqui também
    setEditingTitle('');
    setEditingUrl('');
    setEditingIcon('');
  };

  const handleUpdateLink = async (indexToUpdate: number) => {
    if (!pageSlug || !pageData || !pageData.links || editingIndex !== indexToUpdate) return;

    // Cria uma cópia do array de links
    const updatedLinks = [...pageData.links];

    // Atualiza o link específico na cópia
    updatedLinks[indexToUpdate] = {
      ...updatedLinks[indexToUpdate], // Mantém outras propriedades como 'order' e 'type'
      title: editingTitle,
      url: editingUrl,
      // Se editingIcon não estiver vazio, adiciona a propriedade 'icon', senão garante que ela não exista
      ...(editingIcon.trim() ? { icon: editingIcon.trim().toLowerCase() } : { icon: undefined }),
    };

    // Remove a propriedade 'icon' explicitamente se ela ficou vazia após a edição
    // O Firestore trata `undefined` como remoção de campo.
    if (!editingIcon.trim()) {
      delete updatedLinks[indexToUpdate].icon;
    }


    try {
      // Envia o array de links *completo* atualizado para o Firestore
      await updateLinksOnPage(pageSlug, updatedLinks);
      handleCancelEdit(); // Sai do modo de edição
      await fetchPageData(); // Recarrega os dados para mostrar a atualização
    } catch (error) {
      console.error("Erro ao atualizar link:", error);
      alert("Falha ao atualizar o link. Tente novamente.");
    }
  };


  // Função para copiar a URL pública
  const handleCopyUrl = () => {
    if (!pageSlug) return;
    const shareableUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/${pageSlug}`;
    navigator.clipboard.writeText(shareableUrl)
      .then(() => {
        setCopyButtonText('Copiado!');
        setTimeout(() => setCopyButtonText('Copiar'), 2000); // Volta para 'Copiar' após 2s
      })
      .catch(err => {
        console.error('Erro ao copiar URL:', err);
        alert('Não foi possível copiar a URL.');
      });
  };

  // Função chamada ao clicar num botão de tema
  const handleThemeChange = async (themeName: string) => {
    const theme = themes.find(t => t.name === themeName);
    if (!theme) return;

    // Verifica se é tema Pro e se o usuário não tem plano Pro
    if (theme.isPro && !isProPlan) {
      alert('Este é um tema Pro! Faça upgrade para usá-lo.');
      // Poderia rolar a página para a seção de upgrade aqui:
      // document.getElementById('upgrade-section')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    if (!pageSlug) {
        alert("Erro: Slug da página não encontrado para salvar o tema.");
        return;
    };

    try {
      await updatePageTheme(pageSlug, themeName);
      // Atualiza o estado local para refletir a mudança imediatamente
      setPageData(prevData => prevData ? { ...prevData, theme: themeName } : null);
    } catch (error) {
      console.error("Erro ao mudar tema:", error);
      alert("Falha ao atualizar o tema. Tente novamente.");
    }
  };

  // --- FUNÇÕES DO PAINEL ADMIN ---
  const handleSearchUser = async (e: FormEvent) => {
    e.preventDefault();
    if (!searchEmail) return;
    setIsSearching(true);
    setAdminMessage(null);
    setFoundUser(null); // Limpa usuário anterior
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
    setAdminMessage(null); // Limpa mensagem anterior
    try {
      await updateUserPlan(foundUser.uid, newPlan);
      // Atualiza o estado local do usuário encontrado para refletir a mudança
      setFoundUser(prev => prev ? { ...prev, plan: newPlan } : null);
      setAdminMessage(`Plano do usuário ${foundUser.email} atualizado para '${newPlan}' com sucesso!`);
    } catch (error) {
      console.error("Erro ao atualizar plano:", error);
      setAdminMessage(`Falha ao atualizar o plano: ${(error as Error).message}`);
    } finally {
      setIsUpdatingPlan(false);
    }
  };
  // --- FIM DAS FUNÇÕES DO PAINEL ADMIN ---


  // Exibe "Carregando..." SE (estiver carregando autenticação) OU (NÃO for admin E estiver carregando dados da página)
  // Isso garante que o admin veja o painel mesmo que os dados da PÁGINA dele falhem ao carregar.
  if (loading || (!isAdmin && isLoadingData)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl">Carregando...</p>
      </div>
    );
  }

  // Se terminou de carregar e NÃO HÁ USUÁRIO, não renderiza nada (o useEffect de proteção já deve ter redirecionado)
   if (!user) {
     return null;
   }

  // Renderiza o dashboard se o usuário estiver logado
  return (
    <div className="min-h-screen bg-gray-50">
      {/* --- NAV BAR --- */}
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
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

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

        {/* --- Bloco Bem-vindo (Exibido para todos os usuários) --- */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              {/* Usa userData do contexto se pageData ainda não carregou */}
              Bem-vindo, {pageData?.title || userData?.displayName || user.displayName || 'Usuário'}!
            </h2>
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${
              isProPlan ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
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

        {/* --- Blocos relacionados à página do usuário (só exibem se pageSlug existir) --- */}
        {pageSlug && (
          <>
            {/* Bloco Sua Página */}
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

            {/* Bloco de Aparência */}
            <div className="bg-white p-6 rounded-lg shadow mb-8" id="appearance-section">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Aparência</h3>
              <p className="text-gray-600 mb-4">Escolha um tema para sua página pública.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {themes.map((theme) => {
                  const isActive = (pageData?.theme || 'light') === theme.name;
                  const isDisabledByPlan = theme.isPro && !isProPlan;

                  return (
                    <button
                      key={theme.name}
                      onClick={() => handleThemeChange(theme.name)}
                      disabled={isDisabledByPlan}
                      className={`relative p-4 rounded-lg border-2 text-center transition-all duration-150 ease-in-out focus:outline-none ${
                        isActive
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

              {/* Seção de Upgrade via WhatsApp */}
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

            {/* Bloco Adicionar Novo Link */}
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

            {/* Bloco Meus Links Atuais */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Meus Links Atuais</h3>
              <div className="bg-white p-6 rounded-lg shadow space-y-4">
                {/* Verifica se pageData existe ANTES de tentar acessar pageData.links */}
                {pageData?.links && pageData.links.length > 0 ? (
                  // Ordena os links pela propriedade 'order' antes de mapear, se 'order' existir
                  [...pageData.links] // Cria cópia para não mutar o estado original
                    .sort((a, b) => (a.order || 0) - (b.order || 0)) // Ordena por 'order', tratando 'undefined' como 0
                    .map((link, index) => ( // O 'index' aqui é do array ordenado, pode não ser o original
                    <div key={link.url + index} className="p-3 bg-gray-50 rounded-md border border-gray-200"> {/* Usa URL + index como chave */}
                      {editingIndex === index ? ( // Cuidado: index aqui é do array ordenado
                        // --- Formulário de Edição ---
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
                        // --- Exibição Normal do Link ---
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-800 truncate">{link.title}</p>
                            <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline break-all">{link.url}</a>
                             {link.icon && <p className="text-xs text-gray-500 mt-1">Ícone: {link.icon}</p>}
                          </div>
                          <div className='flex flex-col sm:flex-row gap-2 sm:gap-0 sm:space-x-2 w-full sm:w-auto mt-2 sm:mt-0'>
                            <button onClick={() => handleEditClick(link, index)} className="w-full sm:w-auto bg-blue-100 text-blue-700 hover:bg-blue-200 font-semibold py-1 px-3 rounded-md text-sm">Editar</button>
                            {/* Passa o objeto 'link' completo para handleDeleteLink */}
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
        {/* --- Fim dos Blocos da Página --- */}


        {/* --- PAINEL DE ADMIN CONDICIONAL --- */}
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

              {/* Mensagem de Status/Erro */}
              {adminMessage && (
                <p className={`text-sm mb-4 p-3 rounded-md ${
                  adminMessage.includes('sucesso')
                    ? 'bg-green-100 text-green-700'
                    : adminMessage.includes('não encontrado')
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700' // Erro genérico
                  }`}
                >
                  {adminMessage}
                </p>
              )}

              {/* Detalhes do Usuário Encontrado e Botões de Ação */}
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
                    {/* Botão para Ativar Pro (se estiver free) */}
                    {foundUser.plan === 'free' && (
                      <button
                        onClick={() => handleChangePlan('pro')}
                        disabled={isUpdatingPlan}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-1 px-3 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUpdatingPlan ? 'Atualizando...' : 'Ativar Plano Pro'}
                      </button>
                    )}
                    {/* Botão para Desativar Pro (se estiver pro) */}
                    {foundUser.plan === 'pro' && (
                      <button
                        onClick={() => handleChangePlan('free')}
                        disabled={isUpdatingPlan}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-1 px-3 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUpdatingPlan ? 'Atualizando...' : 'Desativar Pro (Tornar Gratuito)'}
                      </button>
                    )}
                     {/* Botão para limpar a busca */}
                     <button
                       onClick={() => { setFoundUser(null); setSearchEmail(''); setAdminMessage(null);}}
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
        {/* --- FIM DO PAINEL DE ADMIN --- */}

      </main>
    </div>
  );
}