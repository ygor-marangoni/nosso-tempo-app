export function todayLocalDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function formatTime(h) {
  const totalMin = Math.round(h * 60);
  const hrs = Math.floor(totalMin / 60);
  const mins = totalMin % 60;
  return mins > 0 ? `${hrs}h ${mins}min` : `${hrs}h`;
}

export function relativeTime(dateStr) {
  const diff = Date.now() - new Date(`${dateStr}T12:00:00`).getTime();
  const days = Math.floor(diff / 86400000);

  if (days === 0) return 'hoje';
  if (days === 1) return 'há 1 dia';
  if (days < 30) return `há ${days} dias`;

  const months = Math.floor(days / 30.44);
  if (months < 12) return months === 1 ? 'há 1 mês' : `há ${months} meses`;

  const years = Math.floor(months / 12);
  const remainder = months % 12;
  const yearsLabel = years === 1 ? '1 ano' : `${years} anos`;
  const monthsLabel = remainder === 1 ? '1 mês' : `${remainder} meses`;

  return remainder === 0 ? `há ${yearsLabel}` : `há ${yearsLabel} e ${monthsLabel}`;
}

export function timeBetween(olderDate, newerDate) {
  const diff = new Date(`${newerDate}T12:00:00`) - new Date(`${olderDate}T12:00:00`);
  const days = Math.floor(diff / 86400000);

  if (days === 0) return 'no mesmo dia';
  if (days === 1) return '1 dia depois';
  if (days < 30) return `${days} dias depois`;

  const months = Math.floor(days / 30.44);
  if (months < 12) return months === 1 ? '1 mês depois' : `${months} meses depois`;

  const years = Math.floor(months / 12);
  const remainder = months % 12;
  const yearsLabel = years === 1 ? '1 ano' : `${years} anos`;
  const monthsLabel = remainder === 1 ? '1 mês' : `${remainder} meses`;

  return remainder === 0 ? `${yearsLabel} depois` : `${yearsLabel} e ${monthsLabel} depois`;
}

export function calcRelationshipTime(startDate) {
  const start = new Date(`${startDate}T12:00:00`);
  const now = new Date();
  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let days = now.getDate() - start.getDate();

  if (days < 0) {
    months -= 1;
    days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return { years, months, days };
}

export const MONTHS_PT = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
export const MONTHS_SHORT_PT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

export function formatDatePt(dateStr) {
  const d = new Date(`${dateStr}T12:00:00`);
  return `${d.getDate()} de ${MONTHS_PT[d.getMonth()]}, ${d.getFullYear()}`;
}

export function formatDateShortPt(dateStr) {
  const d = new Date(`${dateStr}T12:00:00`);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}
