/**
 * Funções de exportação e compartilhamento do recap.
 * Cliente-only: importado dinamicamente para evitar SSR e reduzir bundle.
 */

/**
 * Captura um elemento DOM como PNG de alta resolução.
 * Usa html-to-image com pixelRatio 4 para gerar imagens nítidas.
 */
export async function captureCard(element, format = 'story') {
  const { toPng } = await import('html-to-image');

  const dataUrl = await toPng(element, {
    pixelRatio: 5, // 270×5 = 1350px → Story 1350×2400, Post 1350×1688
    cacheBust: true,
    skipFonts: false,
  });

  return dataUrl;
}

/**
 * Compartilha via Web Share API (se suportado) ou faz download do PNG.
 * Retorna 'shared' | 'downloaded' | 'aborted'.
 */
export async function shareOrDownload({ dataUrl, monthName, name1, name2 }) {
  const filename = `nosso-recap-${monthName || 'mes'}.png`;
  const coupleName = [name1, name2].filter(Boolean).join(' & ') || 'Nosso Tempo';

  // Tenta compartilhamento nativo (mobile-first)
  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const file = new File([blob], filename, { type: 'image/png' });

    if (typeof navigator !== 'undefined' && navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: `${coupleName} — Recap de ${monthName || 'este mês'}`,
      });
      return 'shared';
    }
  } catch (err) {
    if (err?.name === 'AbortError') return 'aborted';
    // Cai no fallback de download
  }

  // Fallback: download direto
  downloadPng(dataUrl, filename);
  return 'downloaded';
}

/**
 * Força o download de uma imagem como PNG.
 */
export function downloadPng(dataUrl, filename = 'nosso-recap.png') {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  requestAnimationFrame(() => document.body.removeChild(a));
}

/**
 * Converte uma URL de imagem para data URI (base64).
 * Necessário para garantir que imagens externas sejam capturadas corretamente.
 * Retorna null em caso de erro (ex.: CORS).
 */
export async function urlToDataUri(url) {
  if (!url) return null;
  if (url.startsWith('data:')) return url;
  try {
    const res = await fetch(url, { mode: 'cors' });
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}
