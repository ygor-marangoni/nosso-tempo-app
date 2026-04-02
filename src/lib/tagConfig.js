const CANONICAL_TAGS = {
  assistirSerie: 'Assistir s\u00e9rie',
  comerJuntos: 'Comer juntos',
  passear: 'Passear',
  jogar: 'Jogar',
  chamego: 'Chamego',
  cinema: 'Cinema',
  treinar: 'Treinar',
  estudar: 'Estudar',
  ouvirMusica: 'Ouvir m\u00fasica',
  cozinhar: 'Cozinhar',
  dormirJuntos: 'Dormir juntos',
  sairComAmigos: 'Sair com amigos',
  peripecias: 'Perip\u00e9cias',
};

export const TAG_MAP = {
  [CANONICAL_TAGS.assistirSerie]: 'tv',
  [CANONICAL_TAGS.comerJuntos]: 'utensils',
  [CANONICAL_TAGS.passear]: 'map-pin',
  [CANONICAL_TAGS.jogar]: 'gamepad-2',
  [CANONICAL_TAGS.chamego]: 'heart',
  [CANONICAL_TAGS.cinema]: 'clapperboard',
  [CANONICAL_TAGS.treinar]: 'dumbbell',
  [CANONICAL_TAGS.estudar]: 'book-open',
  [CANONICAL_TAGS.ouvirMusica]: 'music',
  [CANONICAL_TAGS.cozinhar]: 'chef-hat',
  [CANONICAL_TAGS.dormirJuntos]: 'moon',
  [CANONICAL_TAGS.sairComAmigos]: 'users',
  [CANONICAL_TAGS.peripecias]: 'flame',
};

export const DEFAULT_TAGS = Object.keys(TAG_MAP);

const TAG_ALIASES = {
  'assistir serie': CANONICAL_TAGS.assistirSerie,
  'assistir s\u00e9rie': CANONICAL_TAGS.assistirSerie,
  'assistir s\u00c3\u00a9rie': CANONICAL_TAGS.assistirSerie,
  'ouvir musica': CANONICAL_TAGS.ouvirMusica,
  'ouvir m\u00fasica': CANONICAL_TAGS.ouvirMusica,
  'ouvir m\u00c3\u00basica': CANONICAL_TAGS.ouvirMusica,
  'peripecias': CANONICAL_TAGS.peripecias,
  'perip\u00e9cias': CANONICAL_TAGS.peripecias,
  'perip\u00c3\u00a9cias': CANONICAL_TAGS.peripecias,
};

function toTagAliasKey(value = '') {
  return String(value).trim().replace(/\s+/g, ' ').toLowerCase();
}

export function normalizeTagName(tagName = '') {
  const trimmed = String(tagName || '').trim();
  if (!trimmed) return '';
  return TAG_ALIASES[toTagAliasKey(trimmed)] || trimmed;
}

export function normalizeActivities(activities = []) {
  return [...new Set((activities || []).map(normalizeTagName).filter(Boolean))];
}

export function normalizeCustomTag(tag) {
  if (!tag?.name) return null;
  return {
    ...tag,
    icon: tag.icon || 'sparkles',
    name: normalizeTagName(tag.name),
  };
}

export function normalizeCustomTags(customTags = []) {
  return (customTags || []).reduce((acc, tag) => {
    const normalizedTag = normalizeCustomTag(tag);
    if (!normalizedTag) return acc;

    const exists = acc.some(item => item.name.toLowerCase() === normalizedTag.name.toLowerCase());
    if (!exists) acc.push(normalizedTag);

    return acc;
  }, []);
}

export const ICON_OPTIONS = [
  'heart', 'star', 'smile', 'laugh', 'baby', 'users', 'user', 'crown', 'gem',
  'sun', 'moon', 'cloud', 'snowflake', 'flame', 'leaf', 'flower-2', 'tree-pine', 'waves', 'mountain', 'sunset', 'rainbow', 'zap', 'umbrella',
  'coffee', 'pizza', 'cake', 'wine', 'utensils', 'cooking-pot', 'ice-cream', 'candy', 'popcorn', 'salad', 'beer',
  'music', 'film', 'tv', 'gamepad-2', 'headphones', 'mic', 'camera', 'ticket', 'party-popper', 'clapperboard',
  'dumbbell', 'bike', 'footprints', 'volleyball', 'compass', 'trophy', 'tent', 'map-pin', 'map', 'navigation',
  'car', 'plane', 'train', 'ship', 'bus',
  'home', 'bed', 'sofa', 'gift', 'shopping-bag', 'shopping-cart', 'shirt',
  'phone', 'message-circle', 'mail', 'video', 'book-open',
  'sparkles', 'palette', 'paintbrush', 'feather', 'anchor', 'flag', 'rocket', 'alarm-clock', 'dog', 'cat',
];

export const PALETTE_OPTIONS = [
  { id: 'rosa', name: 'Rosa de Cinema', swatches: ['#ff7a9c', '#ef5087', '#ffdce5'] },
  { id: 'lavanda', name: 'Ros\u00e9 Veludo', swatches: ['#b56c8d', '#9a5475', '#f0d8e4'] },
  { id: 'azul', name: 'Amora Silvestre', swatches: ['#95597d', '#7a4666', '#e9d1df'] },
  { id: 'sage', name: 'Terracota Serena', swatches: ['#a96957', '#8f5345', '#efd5cb'] },
  { id: 'pessego', name: 'Coral do Entardecer', swatches: ['#df6652', '#c35140', '#ffd3cb'] },
  { id: 'neutro', name: 'Bordeaux Cl\u00e1ssico', swatches: ['#965f6f', '#7a4b59', '#e7d1d6'] },
];

export function allTags(customTags = []) {
  const customNames = normalizeCustomTags(customTags)
    .map(tag => tag.name)
    .filter(name => !DEFAULT_TAGS.includes(name));

  return [...DEFAULT_TAGS, ...customNames];
}

export function tagIcon(tagName, customTags = []) {
  const normalizedName = normalizeTagName(tagName);
  if (TAG_MAP[normalizedName]) return TAG_MAP[normalizedName];

  const custom = normalizeCustomTags(customTags).find(tag => tag.name.toLowerCase() === normalizedName.toLowerCase());
  return custom ? custom.icon : 'sparkles';
}
