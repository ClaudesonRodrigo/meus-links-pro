// src/app/[slug]/page.tsx
'use client';

import { useEffect, useState, use } from 'react';
import { getPageDataBySlug } from "@/lib/pageService";
import { notFound } from "next/navigation";
import Image from 'next/image';
import { FaGithub, FaInstagram, FaLinkedin, FaGlobe } from 'react-icons/fa';

// Mapeamento de nomes de ícones para componentes
const iconMap: { [key: string]: React.ElementType } = {
  github: FaGithub,
  instagram: FaInstagram,
  linkedin: FaLinkedin,
  globe: FaGlobe,
};

type Link = {
  title: string;
  url: string;
  icon?: string;
};

type PageData = {
  title: string;
  bio: string;
  profileImageUrl: string;
  links: Link[];
  theme?: string;
};

export default function UserPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);

  const [pageData, setPageData] = useState<PageData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Efeito principal para buscar dados e aplicar o tema
  useEffect(() => {
    let isMounted = true; // Flag para evitar atualizações de estado se o componente desmontar

    const fetchData = async () => {
      const data = await getPageDataBySlug(resolvedParams.slug) as PageData | null;
      if (!isMounted) return; // Não atualiza se desmontou

      if (!data) {
        notFound();
      } else {
        setPageData(data);

        // Aplica a classe diretamente no HTML depois que os dados chegam
        if (data.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    fetchData();

    // Função de limpeza: remove a classe 'dark' quando o componente desmonta
    return () => {
      isMounted = false;
      document.documentElement.classList.remove('dark');
    };
  }, [resolvedParams.slug]); // Roda quando o slug muda

  // Efeito para a animação de entrada
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pageData) {
        setIsLoaded(true);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [pageData]); // Roda quando pageData é definido

  if (!pageData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl">Carregando...</p>
      </div>
    );
  }

  // Não precisamos mais do wrapper div com a classe 'dark' aqui
  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen font-sans text-gray-800 dark:text-gray-200 transition-colors duration-300">
      <main className="container mx-auto max-w-2xl px-4 py-8 md:py-16">
        <div className={`flex flex-col items-center text-center transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {pageData.profileImageUrl && (
            <Image
              src={pageData.profileImageUrl}
              alt={`Foto de perfil de ${pageData.title}`}
              width={128}
              height={128}
              className="rounded-full mb-4 border-4 border-white dark:border-gray-700 shadow-lg"
              priority
            />
          )}
          <h1 className="text-3xl font-bold">
            {pageData.title}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {pageData.bio}
          </p>
        </div>

        <section className="mt-8 space-y-4">
          {pageData.links?.map((link, index) => {
            const IconComponent = link.icon ? iconMap[link.icon.toLowerCase()] : null;
            return (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center gap-3 w-full text-center bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-semibold py-4 px-6 rounded-lg shadow-md transition-all duration-500 ease-out transform hover:scale-105 hover:shadow-xl active:scale-100 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}
                style={{ transitionDelay: `${index * 100 + 300}ms` }}
              >
                {IconComponent && <IconComponent size={20} />}
                <span>{link.title}</span>
              </a>
            );
          })}
        </section>
      </main>
    </div>
  );
}