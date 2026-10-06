// Small shared date helpers — avoids pulling in a whole date library for
// two simple formatting needs.

export function toJsDate(value) {
  if (!value) return null;
  // Firestore Timestamp has a toDate() method; plain JS Dates don't.
  return typeof value.toDate === 'function' ? value.toDate() : new Date(value);
}

export function formatRelativeTime(value) {
  const date = toJsDate(value);
  if (!date) return '';
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr ago`;
  const diffDay = Math.round(diffHr / 24);
  return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
}

export function formatDateTime(value) {
  const date = toJsDate(value);
  if (!date) return '—';
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
