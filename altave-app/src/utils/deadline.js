export const CURRENT_USER = 'Carlos Dias';
export const TODAY_LABEL = '10/09/2026';
export const TODAY_DATE = new Date('2026-09-10T00:00:00');

export const STATUS_LABEL = { aberta: 'aberta', andamento: 'em andamento', concluida: 'concluída' };
export const STATUS_LABEL_CAP = { aberta: 'Aberta', andamento: 'Em andamento', concluida: 'Concluída' };
export const STATUS_COLOR_VAR = { aberta: 'var(--aberta)', andamento: 'var(--andamento)', concluida: 'var(--concluida)' };

export const PRIORITY_TAG_CLASS = { alta: 'tag-alta', media: 'tag-media', baixa: 'tag-baixa' };
export const PRIORITY_TAG_TEXT = { alta: 'Alta', media: 'Média', baixa: 'Baixa' };
export const PRIORITY_LABEL_LONG = { alta: 'Alta prioridade', media: 'Média prioridade', baixa: 'Baixa prioridade' };
export const PRIORITY_COLOR_VAR = { alta: 'var(--alta)', media: 'var(--media)', baixa: 'var(--baixa)' };

const AVATAR_COLORS = {
  'Ana Ferreira': '#2E9E6D',
  'Carlos Dias': '#7C5CBF',
  'João Pedro': '#D6852E',
};

/** Rótulo do card logo após uma mudança de status feita nesta sessão. */
export function whenLabelFor(status) {
  if (status === 'concluida') return 'Concluída agora';
  if (status === 'andamento') return 'Em andamento agora';
  return 'Reaberta agora';
}

/** Data + hora real (hora do relógio do navegador) usada nos registros de histórico. */
export function nowTime() {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${TODAY_LABEL} às ${hh}:${mm}`;
}

export function formatDateBR(iso) {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

/**
 * Calcula a urgência do prazo de uma ordem.
 * Retorna null quando a ordem não tem prazo definido ou já está concluída
 * (uma ordem finalizada não é mais considerada "vencida").
 */
export function deadlineInfo(prazoIso, status) {
  if (!prazoIso || status === 'concluida') return null;
  const d = new Date(prazoIso + 'T00:00:00');
  const diffDays = Math.round((d - TODAY_DATE) / 86400000);
  let cls = 'dl-normal';
  if (diffDays < 0) cls = 'dl-overdue';
  else if (diffDays <= 2) cls = 'dl-soon';
  return { label: formatDateBR(prazoIso), cls, diffDays };
}

export function matchesPrazoFilter(order, filterValue) {
  if (!filterValue) return true;
  const info = deadlineInfo(order.prazo, order.status);
  if (!info) return false;
  if (filterValue === 'vencidas') return info.diffDays < 0;
  if (filterValue === 'semana') return info.diffDays >= 0 && info.diffDays <= 7;
  return true;
}

export function initials(name) {
  if (!name || name === 'Não atribuído') return '?';
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function avatarColor(name) {
  return AVATAR_COLORS[name] || 'var(--text-muted)';
}

export function nextOsNumber(orders) {
  let max = 0;
  orders.forEach((o) => {
    const n = parseInt(o.id.split('-').pop(), 10);
    if (!isNaN(n) && n > max) max = n;
  });
  return 'OS-2026-' + String(max + 1).padStart(4, '0');
}
