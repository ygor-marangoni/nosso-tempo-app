export const runtime = 'nodejs';

function json(data, status = 200) {
  return Response.json(data, { status });
}

export async function POST(request) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return json({ error: 'Cloudinary não configurado.' }, 500);
  }

  const { publicId } = await request.json();

  if (!publicId) {
    return json({ error: 'publicId é obrigatório.' }, 400);
  }

  const credentials = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
  const body = new URLSearchParams({
    invalidate: 'true',
    public_id: publicId,
  });

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  const payload = await response.json();

  if (!response.ok) {
    return json({ error: payload?.error?.message || 'Falha ao remover imagem.' }, response.status);
  }

  return json(payload);
}
