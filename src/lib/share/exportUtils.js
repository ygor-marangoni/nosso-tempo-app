/**
 * Funcoes de exportacao e compartilhamento do recap.
 * Cliente-only: importado dinamicamente para evitar SSR e reduzir bundle.
 */

/**
 * Captura um elemento DOM como PNG em resolucao fixa.
 * No mobile, o preview usa zoom para caber na tela; por isso a exportacao
 * precisa neutralizar esse zoom no clone para evitar cortes laterais.
 */
export async function captureCard(element, format = 'story') {
  const { toPng } = await import('html-to-image');

  const exportSize =
    format === 'story'
      ? { width: 1080, height: 1920, sourceWidth: 270, sourceHeight: 480 }
      : { width: 1080, height: 1350, sourceWidth: 270, sourceHeight: 338 };

  const dataUrl = await toPng(element, {
    pixelRatio: 1,
    cacheBust: true,
    skipFonts: false,
    width: exportSize.sourceWidth,
    height: exportSize.sourceHeight,
    canvasWidth: exportSize.width,
    canvasHeight: exportSize.height,
    style: {
      zoom: '1',
      transform: 'none',
      width: `${exportSize.sourceWidth}px`,
      height: `${exportSize.sourceHeight}px`,
    },
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

  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const file = new File([blob], filename, { type: 'image/png' });

    if (typeof navigator !== 'undefined' && navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: `${coupleName} - Recap de ${monthName || 'este mes'}`,
      });
      return 'shared';
    }
  } catch (err) {
    if (err?.name === 'AbortError') return 'aborted';
  }

  downloadPng(dataUrl, filename);
  return 'downloaded';
}

/**
 * Forca o download de uma imagem como PNG.
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
 * Necessario para garantir que imagens externas sejam capturadas corretamente.
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
