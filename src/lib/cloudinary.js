function normalizePublicId(publicId = '') {
  return publicId.replace(/\.[a-z0-9]+$/i, '').replace(/^\/+|\/+$/g, '');
}

function insertTransformSegment(url, transformation) {
  if (!url || !transformation) return url || '';
  return url.replace('/upload/', `/upload/${transformation}/`);
}

export function buildCloudinaryDeliveryUrls(secureUrl, { thumbWidth = 640 } = {}) {
  if (!secureUrl) {
    return {
      thumbUrl: '',
      url: '',
    };
  }

  return {
    url: insertTransformSegment(secureUrl, 'q_auto:good'),
    thumbUrl: insertTransformSegment(secureUrl, `c_limit,w_${thumbWidth},q_auto:good`),
  };
}

export async function uploadCloudinaryImage(file, { publicId, context, tags } = {}) {
  const normalizedPublicId = normalizePublicId(publicId);

  const signatureResponse = await fetch('/api/cloudinary/sign-upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      context,
      publicId: normalizedPublicId,
      tags,
    }),
  });

  if (!signatureResponse.ok) {
    throw new Error('Não foi possível preparar o upload da imagem.');
  }

  const { apiKey, cloudName, params, signature, timestamp } = await signatureResponse.json();
  const formData = new FormData();

  formData.append('api_key', apiKey);
  formData.append('file', file);
  formData.append('public_id', params.public_id);
  formData.append('signature', signature);
  formData.append('timestamp', String(timestamp));

  if (params.context) formData.append('context', params.context);
  if (params.invalidate) formData.append('invalidate', params.invalidate);
  if (params.overwrite) formData.append('overwrite', params.overwrite);
  if (params.tags) formData.append('tags', params.tags);

  const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  const payload = await uploadResponse.json();

  if (!uploadResponse.ok) {
    throw new Error(payload?.error?.message || 'Falha no upload da imagem.');
  }

  return payload;
}

export async function destroyCloudinaryImage(publicId) {
  if (!publicId) return;

  const response = await fetch('/api/cloudinary/destroy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ publicId: normalizePublicId(publicId) }),
  });

  if (!response.ok) {
    throw new Error('Não foi possível remover a imagem.');
  }

  return response.json();
}
