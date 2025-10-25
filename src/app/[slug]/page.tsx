// src/app/[slug]/page.tsx
'use client';

import { useEffect, useState, use } from 'react';
import { getPageDataBySlug, PageData, LinkData } from "@/lib/pageService"; // Import tipos de pageService
import { notFound } from "next/navigation";
import Image from 'next/image';
// Importa apenas da react-icons
import { FaGithub, FaInstagram, FaLinkedin, FaGlobe, FaTwitter, FaFacebook, FaYoutube, FaTiktok, FaWhatsapp, FaEnvelope, FaLink, FaSquareXTwitter } from 'react-icons/fa6'; // Usando FaSquareXTwitter para o ícone X

// Mapeamento de nomes de ícones para componentes (APENAS react-icons)
const iconMap: { [key: string]: React.ElementType } = {
  github: FaGithub,
  instagram: FaInstagram,
  linkedin: FaLinkedin,
  globe: FaGlobe,
  website: FaGlobe,
  twitter: FaSquareXTwitter, // Atualizado para o ícone X mais recente da Fa6
  x: FaSquareXTwitter,     // Alias para 'twitter'
  facebook: FaFacebook,
  youtube: FaYoutube,
  tiktok: FaTiktok,
  whatsapp: FaWhatsapp,
  email: FaEnvelope,
  link: FaLink,
  // Adicione mais mapeamentos da react-icons/fa6 ou outras sub-bibliotecas dela
};

export default function UserPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);

  const [pageData, setPageData] = useState<PageData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let currentThemeClass = '';

    const fetchData = async () => {
      // console.log("Buscando dados para slug:", resolvedParams.slug);
      const data = await getPageDataBySlug(resolvedParams.slug) as PageData | null;
      if (!isMounted) return;

      if (!data) {
        // console.error("Página não encontrada para slug:", resolvedParams.slug);
        notFound();
      } else {
        // console.log("Dados recebidos:", data);
        setPageData(data);
        const themeName = data.theme || 'light';
        currentThemeClass = `theme-${themeName}`;
        // console.log("Aplicando tema:", currentThemeClass);

        document.documentElement.className = document.documentElement.className
          .replace(/theme-\w+/g, '')
          .trim();

        if (themeName !== 'light') {
          document.documentElement.classList.add(currentThemeClass);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      // console.log("Limpando tema:", currentThemeClass);
      if (currentThemeClass && currentThemeClass !== 'theme-light') {
        document.documentElement.classList.remove(currentThemeClass);
      }
      document.documentElement.className = document.documentElement.className.replace(/theme-\w+/g, '').trim();
    };
  }, [resolvedParams.slug]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (pageData) setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, [pageData]);

  if (!pageData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl animate-pulse">Carregando...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${
        pageData.theme === 'ocean' ? 'bg-gradient-ocean text-theme-text' :
        pageData.theme === 'sunset' ? 'bg-gradient-sunset text-theme-text' :
        'bg-theme-bg text-theme-text'
      }`}
     >
      <main className="container mx-auto max-w-2xl px-4 py-8 md:py-16">
        <div className={`flex flex-col items-center text-center mb-8 transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {pageData.profileImageUrl && (
            <Image
              src={pageData.profileImageUrl}
              alt={`Foto de perfil de ${pageData.title}`}
              width={128} height={128}
              className="rounded-full mb-4 border-4 border-theme-image-border shadow-lg object-cover"
              priority
            />
          )}
          <h1 className="text-3xl font-bold text-theme-text">{pageData.title}</h1>
          <p className="mt-2 text-theme-text-muted">{pageData.bio}</p>
        </div>

        <section className="mt-8 space-y-4">
          {pageData.links?.map((link, index) => {
            // Usa lowercase para buscar no map, garantindo consistência
            const iconKey = link.icon ? link.icon.toLowerCase() : undefined;
            const IconComponent = iconKey ? (iconMap[iconKey] || FaLink) : null; // Usa FaLink como fallback se ícone existir mas não for mapeado
            return (
              <a
                key={index} href={link.url} target="_blank" rel="noopener noreferrer"
                className={`flex items-center justify-center gap-3 w-full text-center bg-theme-button-bg hover:bg-theme-button-hover-bg text-theme-button-text font-semibold py-4 px-6 rounded-lg shadow-md transition-all duration-500 ease-out transform hover:scale-[1.03] hover:shadow-xl active:scale-[0.98] ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}
                style={{ transitionDelay: `${index * 100 + 300}ms` }}
              >
                {IconComponent && <IconComponent size={20} className="flex-shrink-0" />}
                <span className="truncate">{link.title}</span>
              </a>
            );
          })}
        </section>
      </main>
    </div>
  );
}