export function formatDate(dateString: string | Date | undefined | null): string {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatDateTime(dateString: string | Date | undefined | null): string {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function isPastDeadline(deadline: string | Date): boolean {
  return new Date(deadline).getTime() < Date.now();
}

export function getTimeRemaining(deadline: string | Date): {
  text: string;
  isOverdue: boolean;
  isDueSoon: boolean;
} {
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) {
    return { text: 'Deadline Passed', isOverdue: true, isDueSoon: false };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  const mins = Math.floor((diff / (1000 * 60)) % 60);

  const isDueSoon = hours < 24;

  if (days > 0) {
    return { text: `${days}d ${remainingHours}h remaining`, isOverdue: false, isDueSoon };
  }
  if (hours > 0) {
    return { text: `${hours}h ${mins}m remaining`, isOverdue: false, isDueSoon };
  }
  return { text: `${mins}m remaining`, isOverdue: false, isDueSoon: true };
}
