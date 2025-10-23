// src/app/page.tsx

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center font-sans">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight">
            Todos os seus links importantes em um só lugar.
          </h1>

          <p className="mt-6 text-lg md:text-xl text-gray-600">
            Crie uma página personalizada para agrupar seus perfis de redes sociais, portfólio, contatos e muito mais. Perfeito para a bio do seu Instagram.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/admin/login"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-transform transform hover:scale-105 duration-300 ease-in-out"
            >
              Crie sua página grátis
            </Link>
            <Link
              href="/admin/login"
              className="w-full sm:w-auto bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-8 rounded-lg text-lg transition duration-300 ease-in-out"
            >
              Já tenho uma conta
            </Link>
          </div>
        </div>
      </main>
      
      <footer className="w-full py-6 mt-12">
        <p className="text-gray-500 text-sm">
          Desenvolvido com Next.js e Firebase.
        </p>
      </footer>
    </div>
  );
}