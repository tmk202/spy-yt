import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const TZ_OFFSET_HOURS = 7;

export function formatNumber(n) {
  if (n === null || n === undefined || n === '') return '—';
  if (typeof n === 'string') return n;
  const num = Number(n);
  if (isNaN(num)) return String(n);
  if (Math.abs(num) >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + 'B';
  if (Math.abs(num) >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (Math.abs(num) >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return String(num);
}

export function formatPct(n, signed = false) {
  if (n === null || n === undefined || n === '') return '—';
  const num = Number(n);
  if (isNaN(num)) return '—';
  return signed ? `${num >= 0 ? '+' : ''}${num.toFixed(1)}%` : `${num.toFixed(1)}%`;
}

export function formatDate(iso, fmt = '%Y-%m-%d %H:%M') {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return String(iso).slice(0, 16);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
  } catch {
    return String(iso).slice(0, 16);
  }
}

export function gradeColor(g) {
  if (!g) return 'text-gray-500';
  if (g.startsWith('A')) return 'text-emerald-700';
  if (g.startsWith('B')) return 'text-blue-700';
  if (g.startsWith('C')) return 'text-yellow-700';
  if (g.startsWith('D')) return 'text-orange-700';
  return 'text-red-700';
}
