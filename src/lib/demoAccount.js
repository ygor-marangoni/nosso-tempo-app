const DEMO_SESSION_KEY = 'nt_demo_session_v1';
const DEMO_STATE_KEY = 'nt_demo_state_v1';

export const DEMO_CREDENTIALS = {
  email: 'teste@nosso-tempo.local',
  password: '123456',
};

export const DEMO_USER = {
  uid: 'demo-user-1',
  email: DEMO_CREDENTIALS.email,
  displayName: 'Ygor',
  photoURL: '',
  isDemo: true,
  providerData: [{ providerId: 'demo' }],
};

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function nowIso() {
  return new Date().toISOString();
}

function createSvgDataUrl({ title, subtitle, colors }) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 680">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${colors[0]}" />
          <stop offset="100%" stop-color="${colors[1]}" />
        </linearGradient>
      </defs>
      <rect width="900" height="680" rx="44" fill="url(#bg)" />
      <circle cx="180" cy="150" r="74" fill="rgba(255,255,255,0.18)" />
      <circle cx="760" cy="560" r="110" fill="rgba(255,255,255,0.12)" />
      <rect x="92" y="440" width="716" height="110" rx="24" fill="rgba(255,255,255,0.16)" />
      <text x="90" y="250" fill="#ffffff" font-family="Figtree, Arial, sans-serif" font-size="28" letter-spacing="4">NOSSO TEMPO</text>
      <text x="90" y="340" fill="#ffffff" font-family="Figtree, Arial, sans-serif" font-size="68" font-weight="700">${title}</text>
      <text x="90" y="490" fill="#ffffff" font-family="Figtree, Arial, sans-serif" font-size="32">${subtitle}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function migrateLegacyDemoCopy(state) {
  if (!state?.config?.demoMode && !state?.userProfile?.isDemo) return state;

  const legacyAlbumPhotoUrl = createSvgDataUrl({
    title: 'Memoria querida',
    subtitle: 'Um espacinho so para voces dois',
    colors: ['#ffa0b8', '#ff7a9c'],
  });
  const updatedAlbumPhotoUrl = createSvgDataUrl({
    title: 'Memória querida',
    subtitle: 'Um espacinho só para vocês dois',
    colors: ['#ffa0b8', '#ff7a9c'],
  });

  return {
    ...state,
    album: (state.album || []).map(item =>
      item.id === 'demo-album-1' && item.url === legacyAlbumPhotoUrl ? { ...item, url: updatedAlbumPhotoUrl } : item,
    ),
    entries: (state.entries || []).map(item =>
      item.id === 'demo-entry-1' && item.note === 'Noite leve, cafe e episodio novo.'
        ? { ...item, note: 'Noite leve, café e episódio novo.' }
        : item,
    ),
    phrases: (state.phrases || []).map(item =>
      item.id === 'demo-phrase-1' && item.text === 'Voce e meu lugar favorito.'
        ? { ...item, text: 'Você é meu lugar favorito.' }
        : item,
    ),
    timeline: (state.timeline || []).map(item => {
      if (item.id === 'demo-milestone-1' && item.desc === 'O inicio da historia que virou o app.') {
        return { ...item, desc: 'O início da história que virou o app.' };
      }

      if (item.id === 'demo-milestone-2' && item.desc === 'Marco de teste para voce ver a linha do tempo funcionando.') {
        return { ...item, desc: 'Marco de teste para você ver a linha do tempo funcionando.' };
      }

      return item;
    }),
  };
}

export function createDefaultDemoState() {
  const createdAt = nowIso();
  const relationshipStart = '2023-02-14';
  const couplePhotoUrl = createSvgDataUrl({
    title: 'Ygor e Ju',
    subtitle: 'Conta de teste local para navegar no app sem Firebase',
    colors: ['#ff7a9c', '#ef5087'],
  });
  const albumPhotoUrl = createSvgDataUrl({
    title: 'Memória querida',
    subtitle: 'Um espacinho só para vocês dois',
    colors: ['#ffa0b8', '#ff7a9c'],
  });
  const timelinePhotoUrl = createSvgDataUrl({
    title: 'Primeira viagem',
    subtitle: 'Um marco salvo apenas no navegador',
    colors: ['#ffdce5', '#ff7a9c'],
  });

  return {
    userProfile: {
      id: DEMO_USER.uid,
      uid: DEMO_USER.uid,
      coupleId: 'demo-couple-1',
      email: DEMO_USER.email,
      name: 'Ygor',
      role: 'owner',
      isDemo: true,
    },
    coupleId: 'demo-couple-1',
    couple: {
      id: 'demo-couple-1',
      ownerUid: DEMO_USER.uid,
      partnerUid: 'demo-partner-1',
      createdAt,
      updatedAt: createdAt,
      isDemo: true,
    },
    config: {
      name1: 'Ygor',
      name2: 'Julianne',
      startDate: relationshipStart,
      palette: 'rosa',
      inviteCode: 'DEMO2026',
      couplePhotoUrl,
      couplePhotoPath: null,
      customTags: [{ name: 'Cafeteria', icon: 'coffee' }],
      demoMode: true,
    },
    members: [
      {
        id: DEMO_USER.uid,
        uid: DEMO_USER.uid,
        email: DEMO_USER.email,
        joinedAt: createdAt,
        name: 'Ygor',
        role: 'owner',
      },
      {
        id: 'demo-partner-1',
        uid: 'demo-partner-1',
        email: 'julianne@nosso-tempo.local',
        joinedAt: createdAt,
        name: 'Julianne',
        role: 'partner',
      },
    ],
    entries: [
      {
        id: 'demo-entry-1',
        date: '2026-03-28',
        hours: 3.5,
        activities: ['Passear', 'Cafeteria'],
        note: 'Noite leve, café e episódio novo.',
        createdAt,
        createdBy: DEMO_USER.uid,
        createdByName: 'Ygor',
      },
      {
        id: 'demo-entry-2',
        date: '2026-03-30',
        hours: 5,
        activities: ['Passear', 'Cozinhar'],
        note: 'Passeio longo e jantar juntos em casa.',
        createdAt,
        createdBy: DEMO_USER.uid,
        createdByName: 'Ygor',
      },
    ],
    album: [
      {
        id: 'demo-album-1',
        date: '2026-03-30',
        caption: 'Fim de tarde especial',
        description: 'Foto de exemplo salva localmente.',
        url: albumPhotoUrl,
        storagePath: null,
        createdAt,
        createdBy: DEMO_USER.uid,
        createdByName: 'Ygor',
      },
    ],
    timeline: [
      {
        id: 'demo-milestone-1',
        date: '2023-02-14',
        title: 'Primeira conversa',
        desc: 'O início da história que virou o app.',
        photoUrl: null,
        photoPath: null,
        createdAt,
        createdBy: DEMO_USER.uid,
        createdByName: 'Ygor',
      },
      {
        id: 'demo-milestone-2',
        date: '2025-01-05',
        title: 'Primeira viagem',
        desc: 'Marco de teste para você ver a linha do tempo funcionando.',
        photoUrl: timelinePhotoUrl,
        photoPath: null,
        createdAt,
        createdBy: DEMO_USER.uid,
        createdByName: 'Ygor',
      },
    ],
    phrases: [
      {
        id: 'demo-phrase-1',
        text: 'Você é meu lugar favorito.',
        createdAt,
        createdBy: DEMO_USER.uid,
        createdByName: 'Ygor',
      },
      {
        id: 'demo-phrase-2',
        text: 'Nosso tempo sempre vale a pena.',
        createdAt,
        createdBy: DEMO_USER.uid,
        createdByName: 'Ygor',
      },
    ],
  };
}

export function getDemoSession() {
  if (!canUseStorage()) return false;
  return window.localStorage.getItem(DEMO_SESSION_KEY) === '1';
}

export function setDemoSession() {
  if (!canUseStorage()) return;
  window.localStorage.setItem(DEMO_SESSION_KEY, '1');
}

export function clearDemoSession() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(DEMO_SESSION_KEY);
}

export function readDemoState() {
  if (!canUseStorage()) return createDefaultDemoState();

  try {
    const raw = window.localStorage.getItem(DEMO_STATE_KEY);
    if (!raw) {
      const initial = createDefaultDemoState();
      writeDemoState(initial);
      return initial;
    }

    return migrateLegacyDemoCopy({ ...createDefaultDemoState(), ...JSON.parse(raw) });
  } catch {
    const initial = createDefaultDemoState();
    writeDemoState(initial);
    return initial;
  }
}

export function writeDemoState(state) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(DEMO_STATE_KEY, JSON.stringify(state));
}

export function resetDemoState() {
  const initial = createDefaultDemoState();
  writeDemoState(initial);
  return initial;
}

export function isDemoCredentials(email, password) {
  return email.trim().toLowerCase() === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password;
}
