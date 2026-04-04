import { MONTHS_PT, formatTime } from '@/lib/dateUtils';

function formatRecapTime(hours = 0) {
  const totalMinutes = Math.max(0, Math.round(Number(hours || 0) * 60));

  if (totalMinutes === 0) return '0min';
  if (totalMinutes < 60) return `${totalMinutes}min`;

  return `${Math.max(1, Math.round(totalMinutes / 60))}h`;
}

/**
 * Calcula os dados do recap mensal a partir dos dados do casal.
 * Filtra pelo mês corrente.
 */
export function calcMonthRecap({ entries = [], album = [], phrases = [], config = {} }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed

  // Entradas do mês corrente
  const monthEntries = entries.filter(e => {
    if (!e.date) return false;
    const d = new Date(`${e.date}T12:00:00`);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const totalHours = monthEntries.reduce((s, e) => s + (e.hours || 0), 0);
  const momentCount = monthEntries.length;

  // Atividade favorita (mais frequente no mês)
  const actCount = {};
  monthEntries.forEach(e => {
    (e.activities || []).forEach(a => {
      if (a) actCount[a] = (actCount[a] || 0) + 1;
    });
  });
  const topActivity = Object.entries(actCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  // Melhor dia (mais horas em um único dia)
  const byDate = {};
  monthEntries.forEach(e => {
    byDate[e.date] = (byDate[e.date] || 0) + (e.hours || 0);
  });
  const bestDayEntry = Object.entries(byDate).sort((a, b) => b[1] - a[1])[0];
  const bestDay = bestDayEntry
    ? {
        date: bestDayEntry[0],
        hours: bestDayEntry[1],
        hoursFormatted: formatTime(bestDayEntry[1]),
        label: new Date(`${bestDayEntry[0]}T12:00:00`).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'short',
        }).replace('.', ''),
      }
    : null;

  // Fotos do álbum no mês (até 3, mais recentes primeiro)
  const monthPhotos = (album || [])
    .filter(p => {
      if (!p.date) return false;
      const d = new Date(`${p.date}T12:00:00`);
      return d.getFullYear() === year && d.getMonth() === month;
    })
    .sort((a, b) => new Date(`${b.date}T12:00:00`) - new Date(`${a.date}T12:00:00`))
    .slice(0, 3);

  // Opções de foto para seleção no modal
  const photoOptions = [];
  monthPhotos.forEach(p =>
    photoOptions.push({
      type: 'album',
      url: p.url,
      thumbUrl: p.thumbUrl || p.url,
      label: p.caption || 'Foto do álbum',
    })
  );
  if (config.couplePhotoUrl) {
    photoOptions.push({
      type: 'couple',
      url: config.couplePhotoUrl,
      thumbUrl: config.couplePhotoUrl,
      label: 'Foto do casal',
    });
  }

  // Frase aleatória (usa a primeira disponível por estabilidade)
  const phrase =
    (phrases || []).find(item => typeof item?.text === 'string' && item.text.trim())?.text ?? null;

  return {
    year,
    month,
    monthName: MONTHS_PT[month],
    totalHours,
    totalHoursFormatted: formatRecapTime(totalHours),
    momentCount,
    topActivity,
    bestDay,
    phrase,
    monthPhotos,
    photoOptions,
    name1: config.name1 || '',
    name2: config.name2 || '',
    hasData: momentCount > 0 || totalHours > 0,
  };
}
