const LONG_CACHE_HEADER = 'public,max-age=31536000,immutable';

let supportsWebpCache = null;

function canUseDom() {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

function detectWebpSupport() {
  if (!canUseDom()) return false;
  if (supportsWebpCache !== null) return supportsWebpCache;

  const canvas = document.createElement('canvas');
  supportsWebpCache = canvas.toDataURL('image/webp', 0.8).startsWith('data:image/webp');
  return supportsWebpCache;
}

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.decoding = 'async';
    image.onerror = error => {
      URL.revokeObjectURL(objectUrl);
      reject(error);
    };
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.src = objectUrl;
  });
}

function getTargetDimensions(image, maxWidth, maxHeight) {
  const widthScale = maxWidth ? maxWidth / image.width : 1;
  const heightScale = maxHeight ? maxHeight / image.height : 1;
  const scale = Math.min(1, widthScale, heightScale);

  return {
    width: Math.max(1, Math.round(image.width * scale)),
    height: Math.max(1, Math.round(image.height * scale)),
  };
}

function getOutputFormat(preferWebp = true) {
  if (preferWebp && detectWebpSupport()) {
    return { contentType: 'image/webp', extension: 'webp' };
  }

  return { contentType: 'image/jpeg', extension: 'jpg' };
}

function canvasToBlob(canvas, contentType, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (!blob) {
        reject(new Error('Não foi possível processar a imagem.'));
        return;
      }

      resolve(blob);
    }, contentType, quality);
  });
}

function drawImageHighQuality(context, image, width, height) {
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';

  let source = image;
  let sourceWidth = image.width;
  let sourceHeight = image.height;

  while (sourceWidth / 2 > width && sourceHeight / 2 > height) {
    const nextWidth = Math.max(width, Math.round(sourceWidth / 2));
    const nextHeight = Math.max(height, Math.round(sourceHeight / 2));
    const stepCanvas = document.createElement('canvas');
    stepCanvas.width = nextWidth;
    stepCanvas.height = nextHeight;

    const stepContext = stepCanvas.getContext('2d');
    if (!stepContext) break;

    stepContext.imageSmoothingEnabled = true;
    stepContext.imageSmoothingQuality = 'high';
    stepContext.drawImage(source, 0, 0, sourceWidth, sourceHeight, 0, 0, nextWidth, nextHeight);

    source = stepCanvas;
    sourceWidth = nextWidth;
    sourceHeight = nextHeight;
  }

  context.drawImage(source, 0, 0, sourceWidth, sourceHeight, 0, 0, width, height);
}

async function renderVariant(image, options = {}) {
  const {
    maxWidth = 800,
    maxHeight,
    quality = 0.9,
    preferWebp = true,
  } = options;

  const canvas = document.createElement('canvas');
  const { width, height } = getTargetDimensions(image, maxWidth, maxHeight);
  canvas.width = width;
  canvas.height = height;
  const { contentType, extension } = getOutputFormat(preferWebp);

  const context = canvas.getContext('2d', { alpha: contentType !== 'image/jpeg' });
  if (!context) {
    throw new Error('Não foi possível preparar a imagem.');
  }

  if (contentType === 'image/jpeg') {
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
  }

  drawImageHighQuality(context, image, width, height);
  const dataUrl = canvas.toDataURL(contentType, quality);
  const blob = await canvasToBlob(canvas, contentType, quality);

  return {
    blob,
    contentType,
    dataUrl,
    extension,
    height,
    size: blob.size,
    width,
  };
}

export function createImageUploadMetadata(contentType) {
  return {
    cacheControl: LONG_CACHE_HEADER,
    contentType,
  };
}

export async function buildImageVariant(file, options = {}) {
  const image = await loadImageFromFile(file);
  return renderVariant(image, options);
}

export async function buildResponsiveImageSet(file, options = {}) {
  const {
    fullWidth = 1280,
    fullHeight,
    fullQuality = 0.9,
    thumbWidth = 480,
    thumbHeight,
    thumbQuality = 0.84,
    preferWebp = true,
  } = options;

  const image = await loadImageFromFile(file);
  const full = await renderVariant(image, {
    maxWidth: fullWidth,
    maxHeight: fullHeight,
    preferWebp,
    quality: fullQuality,
  });

  let thumb = full;
  let thumbIsSeparate = false;

  if ((thumbWidth && image.width > thumbWidth) || (thumbHeight && image.height > thumbHeight)) {
    thumb = await renderVariant(image, {
      maxWidth: thumbWidth,
      maxHeight: thumbHeight,
      preferWebp,
      quality: thumbQuality,
    });
    thumbIsSeparate = true;
  }

  return {
    full,
    fullHeight: full.height,
    fullWidth: full.width,
    previewUrl: thumb.dataUrl,
    thumb,
    thumbIsSeparate,
  };
}

/**
 * Mantido por compatibilidade com o restante do app.
 * @param {File} file
 * @param {number} maxWidth
 * @returns {Promise<{ blob: Blob, contentType: string, dataUrl: string, extension: string, height: number, size: number, width: number }>}
 */
export function resizeImage(file, maxWidth = 800) {
  return buildImageVariant(file, { maxWidth });
}
