import crypto from 'node:crypto';

export const runtime = 'nodejs';

function json(data, status = 200) {
  return Response.json(data, { status });
}

function serializeContext(context = {}) {
  return Object.entries(context)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${key}=${String(value).replace(/\|/g, '\\|').replace(/=/g, '\\=')}`)
    .join('|');
}

export async function POST(request) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return json({ error: 'Cloudinary não configurado.' }, 500);
  }

  const { context = {}, publicId = '', tags = [] } = await request.json();

  if (!publicId) {
    return json({ error: 'publicId é obrigatório.' }, 400);
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const params = {
    context: serializeContext(context),
    invalidate: 'true',
    overwrite: 'true',
    public_id: publicId,
    tags: Array.isArray(tags) ? tags.filter(Boolean).join(',') : '',
    timestamp,
  };

  const stringToSign = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  const signature = crypto
    .createHash('sha1')
    .update(`${stringToSign}${apiSecret}`)
    .digest('hex');

  return json({
    apiKey,
    cloudName,
    params,
    signature,
    timestamp,
  });
}
