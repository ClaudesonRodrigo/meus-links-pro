// src/app/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaRocket, FaMobileAlt, FaPalette, FaChartLine, FaPlay, FaInstagram, FaWhatsapp, FaLinkedin } from 'react-icons/fa';

// Componente de Cabeçalho (Header)
const Header = () => (
  <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
    <div className="container mx-auto px-4 h-16 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
          M
        </div>
        <span className="text-xl font-bold text-gray-900 tracking-tight">Meus Links Pro</span>
      </div>
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/login" 
          className="text-gray-600 hover:text-blue-600 font-medium transition-colors hidden sm:block"
        >
          Entrar
        </Link>
        <Link 
          href="/admin/login"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full font-bold transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transform hover:-translate-y-0.5"
        >
          Criar Grátis
        </Link>
      </div>
    </div>
  </header>
);

// Componente Hero (Apresentação Principal)
const HeroSection = () => {
  return (
    <section className="pt-32 pb-20 overflow-hidden bg-linear-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          {/* Texto Hero */}
          <div className="lg:w-1/2 text-center lg:text-left z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                Novos temas disponíveis!
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-[1.15] mb-6">
                Todos os seus links em um <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600">único lugar.</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Pare de perder seguidores. Crie uma página personalizada, linda e profissional para a bio do seu Instagram, TikTok e LinkedIn em segundos.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link 
                  href="/admin/login"
                  className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-4 rounded-xl font-bold transition-all shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40"
                >
                  <FaRocket /> Começar Agora
                </Link>
                <Link 
                  href="#demonstracao"
                  className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-800 text-lg px-8 py-4 rounded-xl font-bold border border-gray-200 transition-all hover:border-gray-300"
                >
                  <FaPlay className="text-xs" /> Ver Demo
                </Link>
              </div>
              
              <div className="mt-8 flex items-center justify-center lg:justify-start gap-4 text-sm text-gray-500">
                <div className="flex -space-x-2">
                   {/* Avatares falsos para prova social */}
                   <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white"></div>
                   <div className="w-8 h-8 rounded-full bg-gray-400 border-2 border-white"></div>
                   <div className="w-8 h-8 rounded-full bg-gray-500 border-2 border-white"></div>
                </div>
                <p>Junte-se a +1.000 criadores</p>
              </div>
            </motion.div>
          </div>

          {/* Mockup do Celular (Visual) */}
          <div className="lg:w-1/2 relative">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative mx-auto lg:ml-auto w-[300px] h-[600px] bg-gray-900 rounded-[3rem] border-8 border-gray-800 shadow-2xl overflow-hidden ring-1 ring-gray-900/5"
            >
              {/* Entalhe (Notch) */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-xl z-20"></div>
              
              {/* Tela do Celular (Simulação da App) */}
              <div className="w-full h-full bg-linear-to-br from-indigo-500 to-purple-600 overflow-y-auto custom-scrollbar relative">
                
                {/* Conteúdo Simulado */}
                <div className="pt-16 pb-8 px-6 flex flex-col items-center text-center text-white">
                  <div className="w-24 h-24 rounded-full border-4 border-white/20 shadow-lg bg-white/10 mb-4 overflow-hidden relative">
                     {/* Imagem Placeholder - Pode substituir por Image do Next */}
                     <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80)' }}></div>
                  </div>
                  <h3 className="text-xl font-bold mb-1">Camila Souza</h3>
                  <p className="text-white/80 text-sm mb-6">Criadora de Conteúdo & Designer</p>
                  
                  {/* Botões Simulados */}
                  <div className="w-full space-y-3">
                    {['Meu Site Oficial', 'Fale no WhatsApp', 'Último Vídeo', 'Baixe meu E-book'].map((item, i) => (
                      <div key={i} className="w-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition p-4 rounded-xl font-medium border border-white/10 flex items-center justify-between group cursor-pointer">
                        <span>{item}</span>
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                      </div>
                    ))}
                  </div>

                  {/* Ícones Sociais Simulados */}
                  <div className="mt-8 flex gap-4 text-2xl">
                    <FaInstagram /> <FaWhatsapp /> <FaLinkedin />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Elementos Decorativos de Fundo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[80%] bg-blue-500/20 blur-[100px] -z-10 rounded-full"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Seção de Funcionalidades
const FeaturesSection = () => {
  const features = [
    {
      icon: <FaPalette className="text-pink-500" />,
      title: "Personalização Total",
      desc: "Escolha cores, fontes, fundos e temas prontos que combinam com sua marca."
    },
    {
      icon: <FaChartLine className="text-green-500" />,
      title: "Análise de Dados",
      desc: "Saiba exatamente quantos cliques cada link recebeu e otimize sua estratégia."
    },
    {
      icon: <FaMobileAlt className="text-blue-500" />,
      title: "Responsivo",
      desc: "Seu perfil fica perfeito em qualquer dispositivo, do celular ao desktop."
    },
    {
      icon: <FaRocket className="text-purple-500" />,
      title: "Carregamento Rápido",
      desc: "Tecnologia de ponta para que seus seguidores não esperem nem um segundo."
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Tudo o que você precisa</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Ferramentas poderosas para transformar seus seguidores em clientes fiéis.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              whileHover={{ y: -5 }}
              className="p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-2xl mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Seção de Vídeo (AGORA COM UPLOAD PRÓPRIO / ARQUIVO LOCAL)
const VideoSection = () => {
  return (
    <section id="demonstracao" className="py-20 bg-gray-900 text-white overflow-hidden relative">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
      <div className="container mx-auto px-4 relative z-10 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-8">Temos a Opção de fazer as configurações para você</h2>
        
        <div className="max-w-4xl mx-auto aspect-video bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-700 relative group">
          
          {/* PLAYER DE VÍDEO NATIVO 
             1. Coloque seu arquivo de vídeo na pasta 'public' do projeto.
             2. Nomeie o arquivo como 'demo-video.mp4' (ou altere o src abaixo).
          */}
          <video 
            className="w-full h-full object-cover"
            controls 
            preload="metadata"
            // Você pode adicionar uma imagem de capa (poster) colocando-a na pasta public também
            // poster="/poster-video.jpg" 
          >
            <source src="/video.mp4" type="video/mp4" />
            Seu navegador não suporta a tag de vídeo.
          </video>

        </div>
        <p className="mt-4 text-gray-400 text-sm">Assista a uma rápida demonstração da plataforma.</p>
      </div>
    </section>
  );
};

// Seção CTA Final
const CTASection = () => (
  <section className="py-24 bg-blue-600 text-white relative overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-full bg-[url('/public/window.svg')] opacity-10"></div>
    <div className="container mx-auto px-4 text-center relative z-10">
      <h2 className="text-3xl md:text-5xl font-bold mb-6">Pronto para elevar seu nível?</h2>
      <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">
        Crie sua conta gratuitamente hoje e comece a compartilhar seus links de forma inteligente.
      </p>
      <Link 
        href="/admin/login"
        className="inline-block bg-white text-blue-600 text-lg font-bold px-10 py-4 rounded-full shadow-2xl hover:bg-gray-100 transform hover:scale-105 transition-all"
      >
        Criar Minha Página Grátis
      </Link>
      <p className="mt-6 text-sm text-blue-200 opacity-80">
        <FaCheckCircle className="inline mr-1" /> Sem cartão de crédito necessário
      </p>
    </div>
  </section>
);

// Footer
const Footer = () => (
  <footer className="bg-gray-50 py-12 border-t border-gray-200">
    <div className="container mx-auto px-4 text-center text-gray-500">
      <div className="flex items-center justify-center gap-2 mb-4 font-bold text-gray-800 text-xl">
        Meus Links Pro
      </div>
      <p className="mb-8 text-sm">A plataforma completa para seus links na bio.</p>
      <div className="flex justify-center gap-6 mb-8">
        <a href="#" className="hover:text-blue-600 transition"><FaInstagram size={24} /></a>
        <a href="#" className="hover:text-blue-600 transition"><FaWhatsapp size={24} /></a>
        <a href="#" className="hover:text-blue-600 transition"><FaLinkedin size={24} /></a>
      </div>
      <p className="text-xs">&copy; {new Date().getFullYear()} Meus Links Pro. Todos os direitos reservados.</p>
    </div>
  </footer>
);

export default function LandingPage() {
  return (
    <div className="font-sans text-gray-900 bg-white min-h-screen selection:bg-blue-100 selection:text-blue-900">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <VideoSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}