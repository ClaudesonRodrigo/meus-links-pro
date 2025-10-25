// tailwind.config.mjs

/** @type {import('tailwindcss').Config} */
const config = {
  // Adiciona a configuração para o modo escuro funcionar com classes
  darkMode: 'class',

  // Informa ao Tailwind onde ele deve procurar por classes CSS
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  // Seção para estender o tema padrão do Tailwind (não precisamos no momento)
  theme: {
    extend: {},
  },

  // Seção para adicionar plugins (não precisamos no momento)
  plugins: [],
};

export default config;