export function formatDateTime(dateString: string | null): {
  date: string;
  time: string;
} {
  if (!dateString) return { date: '', time: '' };
  const date = new Date(dateString);
  return {
    date: date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    time: date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }),
  };
}

export function formatRelativeTime(dateString: string | null): string {
  if (!dateString) return 'No activity';

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

export function formatDuration(
  startDate: string,
  endDate: string | null,
): string {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  const diffMs = end.getTime() - start.getTime();

  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);

  if (days > 0) {
    const remainingHours = Math.floor((diffMs % 86400000) / 3600000);
    if (remainingHours > 0) {
      return `${days}d ${remainingHours}h`;
    }
    return `${days} day${days !== 1 ? 's' : ''}`;
  }

  if (hours > 0) {
    const remainingMins = Math.floor((diffMs % 3600000) / 60000);
    if (remainingMins > 0) {
      return `${hours}h ${remainingMins}m`;
    }
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }

  return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
}

export function toDayKey(dateString: string | null): string {
  if (!dateString) return '';
  const d = new Date(dateString);
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function formatDaySectionTitle(dayKey: string): string {
  if (!dayKey) return '';

  const [y, m, d] = dayKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (date.getTime() === today.getTime()) return 'Today';
  if (date.getTime() === yesterday.getTime()) return 'Yesterday';

  return formatDateTime(date.toISOString()).date;
}
