// tailwind.config.mjs

/** @type {import('tailwindcss').Config} */
const config = {
  // Não precisamos mais do darkMode: 'class' aqui

  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Adicionamos cores para usar com as variáveis CSS
      colors: {
        'theme-bg': 'var(--color-bg)',
        'theme-text': 'var(--color-text)',
        'theme-text-muted': 'var(--color-text-muted)', // Cor para textos secundários
        'theme-button-bg': 'var(--color-button-bg)',
        'theme-button-text': 'var(--color-button-text)',
        'theme-button-hover-bg': 'var(--color-button-hover-bg)',
        'theme-image-border': 'var(--color-image-border)', // Cor da borda da imagem
        // Cores específicas para usar nos gradientes ou diretamente
        ocean: {
          start: '#1cb5e0',
          end: '#000046',
        },
        sunset: {
          start: '#ff7e5f',
          end: '#feb47b',
        },
        forest: {
          bg: '#1A4D2E', // Verde escuro
          text: '#FAF3E0', // Creme
        },
        bubblegum: {
          bg: '#FFC0CB', // Rosa claro
          textdark: '#333333', // Texto escuro para fundo claro
          buttonText: '#D14A89' // Rosa mais escuro para texto do botão
        }
      },
      // Adicionamos backgroundImage para os gradientes
      backgroundImage: {
        'gradient-ocean': 'linear-gradient(to right, var(--color-ocean-start, #1cb5e0), var(--color-ocean-end, #000046))',
        'gradient-sunset': 'linear-gradient(to right, var(--color-sunset-start, #ff7e5f), var(--color-sunset-end, #feb47b))',
      }
    },
  },
  plugins: [],
};

export default config;