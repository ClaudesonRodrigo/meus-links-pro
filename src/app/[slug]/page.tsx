// src/app/[slug]/page.tsx

import { getPageDataBySlug } from "@/lib/pageService";
import { notFound } from "next/navigation";
import Image from 'next/image';

// Tipos para garantir que os dados estão corretos
type Link = {
  title: string;
  url: string;
};

type PageData = {
  title: string;
  bio: string;
  profileImageUrl: string;
  links: Link[];
};

// CORREÇÃO APLICADA AQUI: Desestruturamos 'slug' diretamente de 'params'
export default async function UserPage({ params: { slug } }: { params: { slug: string } }) {
  // Agora usamos 'slug' diretamente, que já foi resolvido pelo Next.js
  const pageData = await getPageDataBySlug(slug) as PageData | null;

  // Se a página não for encontrada no Firestore, o Next.js mostrará uma página 404
  if (!pageData) {
    notFound();
  }

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      <main className="container mx-auto max-w-2xl px-4 py-8 md:py-16">
        <div className="flex flex-col items-center text-center">
          {/* Imagem de Perfil */}
          {pageData.profileImageUrl && (
            <Image
              src={pageData.profileImageUrl}
              alt={`Foto de perfil de ${pageData.title}`}
              width={128}
              height={128}
              className="rounded-full mb-4 border-4 border-white shadow-lg"
              priority // Prioriza o carregamento da imagem principal
            />
          )}

          {/* Título e Bio */}
          <h1 className="text-3xl font-bold text-gray-800">
            {pageData.title}
          </h1>
          <p className="mt-2 text-gray-600">
            {pageData.bio}
          </p>
        </div>

        {/* Lista de Links */}
        <section className="mt-8 space-y-4">
          {pageData.links?.map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer" // Importante para segurança e SEO
              className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105 duration-300 ease-in-out"
            >
              {link.title}
            </a>
          ))}
        </section>
      </main>
    </div>
  );
}