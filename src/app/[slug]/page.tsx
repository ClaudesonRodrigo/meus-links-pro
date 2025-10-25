// src/app/[slug]/page.tsx
'use client';

import { useEffect, useState, use } from 'react';
import { getPageDataBySlug, PageData, LinkData } from "@/lib/pageService"; // Import tipos de pageService
import { notFound } from "next/navigation";
import Image from 'next/image';
// Importa ícones que vamos usar
import { FaGithub, FaInstagram, FaLinkedin, FaGlobe, FaTwitter, FaFacebook, FaYoutube, FaTiktok, FaWhatsapp, FaEnvelope, FaLink } from 'react-icons/fa';
// Para o ícone X (Twitter), podemos usar a versão mais recente da react-icons/fa6 se preferir:
// import { FaSquareXTwitter } from 'react-icons/fa6';

// Mapeamento de nomes de ícones para componentes (lowercase para consistência)
const iconMap: { [key: string]: React.ElementType } = {
  github: FaGithub,
  instagram: FaInstagram,
  linkedin: FaLinkedin,
  globe: FaGlobe, // Ícone genérico para site
  website: FaGlobe, // Alias para 'globe'
  twitter: FaTwitter, // Mantendo FaTwitter por enquanto, pode trocar por FaSquareXTwitter
  // x: FaSquareXTwitter,     // Alias se usar o ícone X
  facebook: FaFacebook,
  youtube: FaYoutube,
  tiktok: FaTiktok,
  whatsapp: FaWhatsapp,
  email: FaEnvelope,
  link: FaLink, // Ícone genérico de link
  // Adicione mais mapeamentos conforme necessário (lembre-se de importar o ícone)
};

export default function UserPage({ params }: { params: Promise<{ slug: string }> }) {
  // Resolve a promise dos params usando o hook 'use'
  const resolvedParams = use(params);

  const [pageData, setPageData] = useState<PageData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false); // Estado para controlar animação de entrada

  // Efeito para buscar dados e aplicar/limpar classe de tema no HTML
  useEffect(() => {
    let isMounted = true; // Flag para evitar race conditions
    let currentThemeClass = ''; // Para guardar a classe e remover na limpeza

    const fetchData = async () => {
      // console.log("Buscando dados para slug:", resolvedParams.slug);
      const data = await getPageDataBySlug(resolvedParams.slug) as PageData | null;
      if (!isMounted) return; // Se desmontou enquanto buscava, não faz nada

      if (!data) {
        // console.error("Página não encontrada para slug:", resolvedParams.slug);
        notFound(); // Redireciona para 404
      } else {
        // console.log("Dados recebidos:", data);
        setPageData(data); // Atualiza estado com os dados da página

        // Lógica para aplicar o tema
        const themeName = data.theme || 'light'; // Padrão 'light' se não definido
        currentThemeClass = `theme-${themeName}`;
        // console.log("Aplicando tema:", currentThemeClass);

        // Limpa classes de tema anteriores antes de adicionar a nova na tag <html>
        document.documentElement.className = document.documentElement.className
          .replace(/theme-\w+/g, '') // Remove classes theme-* existentes
          .trim();

        if (themeName !== 'light') { // Só adiciona classe se não for o tema padrão
             document.documentElement.classList.add(currentThemeClass);
        }
      }
    };

    fetchData();

    // Função de limpeza executada quando o componente desmonta ou o slug muda
    return () => {
      isMounted = false; // Marca como desmontado
      // console.log("Limpando tema:", currentThemeClass);
      // Remove a classe de tema atual do HTML para não afetar outras páginas
      if (currentThemeClass && currentThemeClass !== 'theme-light') {
        document.documentElement.classList.remove(currentThemeClass);
      }
      // Garante limpeza total de classes de tema
      document.documentElement.className = document.documentElement.className.replace(/theme-\w+/g, '').trim();
    };
  }, [resolvedParams.slug]); // Re-executa se o slug na URL mudar

  // Efeito para controlar a animação de entrada
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pageData) {
        setIsLoaded(true); // Ativa a animação após dados carregarem e um pequeno delay
      }
    }, 100);
    return () => clearTimeout(timer); // Limpa o timer se o componente desmontar
  }, [pageData]); // Depende do pageData para saber quando começar

  // Tela de carregamento enquanto pageData é null
  if (!pageData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl animate-pulse">Carregando...</p> {/* Animação simples de loading */}
      </div>
    );
  }

  // Renderização da página principal
  return (
    // As classes de fundo e texto usam variáveis CSS definidas em globals.css
    // Adiciona classe de gradiente específica se for o tema correspondente
    <div className={`min-h-screen font-sans transition-colors duration-300 ${
        pageData.theme === 'ocean' ? 'bg-gradient-ocean text-theme-text' :
        pageData.theme === 'sunset' ? 'bg-gradient-sunset text-theme-text' :
        'bg-theme-bg text-theme-text' // Aplica fundo/texto base para outros temas
      }`}
     >
      <main className="container mx-auto max-w-2xl px-4 py-8 md:py-16">
        {/* Seção do Perfil (Imagem, Título, Bio) com animação */}
        <div className={`flex flex-col items-center text-center mb-8 transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {pageData.profileImageUrl && (
            <Image
              src={pageData.profileImageUrl}
              alt={`Foto de perfil de ${pageData.title}`}
              width={128} height={128}
              // Borda usa variável CSS
              className="rounded-full mb-4 border-4 border-theme-image-border shadow-lg object-cover"
              priority // Otimiza carregamento da imagem principal
            />
          )}
          {/* Título e Bio usam variáveis CSS de texto */}
          <h1 className="text-3xl font-bold text-theme-text">{pageData.title || 'Nome do Usuário'}</h1>
          <p className="mt-2 text-theme-text-muted">{pageData.bio || 'Edite sua bio no painel.'}</p>
        </div>

        {/* Seção dos Links com animação em cascata */}
        <section className="mt-8 space-y-4">
          {pageData.links?.map((link, index) => {
            // Pega o componente do ícone do mapeamento (lowercase) ou usa um ícone padrão
            const iconKey = link.icon ? link.icon.toLowerCase() : undefined;
            const IconComponent = iconKey ? (iconMap[iconKey] || FaLink) : null; // Usa FaLink como fallback
            return (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                // Botão usa variáveis CSS para cores e hover
                className={`flex items-center justify-center gap-3 w-full text-center bg-theme-button-bg hover:bg-theme-button-hover-bg text-theme-button-text font-semibold py-4 px-6 rounded-lg shadow-md transition-all duration-500 ease-out transform hover:scale-[1.03] hover:shadow-xl active:scale-[0.98] ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}
                // Delay na animação para efeito cascata
                style={{ transitionDelay: `${index * 100 + 300}ms` }}
              >
                {IconComponent && <IconComponent size={20} className="flex-shrink-0" />}
                <span className="truncate">{link.title}</span> {/* Truncate para títulos longos */}
              </a>
            );
          })}
        </section>
      </main>
    </div>
  );
}