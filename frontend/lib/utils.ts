export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(d: string): string {
  const date = new Date(d);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(d: string | null): string {
  if (!d) return 'TBD';
  const date = new Date(d);
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateRange(start: string, end: string): string {
  return `${formatDate(start)} – ${formatDate(end)}`;
}

export function getMatchTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    group: 'Group',
    qualifier1: 'Qualifier 1',
    eliminator: 'Eliminator',
    qualifier2: 'Qualifier 2',
    semi: 'Semi Final',
    final: 'Final',
  };
  return labels[type] || type;
}

export function getCategoryLabel(cat: string): string {
  return cat === 'men' ? 'Men' : 'Women';
}
