export default function manifest() {
  return {
    name: 'Nosso Tempo',
    short_name: 'Nosso Tempo',
    description: 'O espaço privado do casal para guardar memórias, fotos, registros e marcos juntos.',
    start_url: '/',
    display: 'standalone',
    background_color: '#fffbfc',
    theme_color: '#ef5087',
    lang: 'pt-BR',
    icons: [
      {
        src: '/favicon.svg?v=20260402',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
