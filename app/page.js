'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase, formatNumber, formatPct, formatDate, gradeColor } from '@/lib/supabase';

const PAGE_SIZE = 50;

const SORT_OPTIONS = {
  score:     { col: 'd.score',         defaultDir: 'desc' },
  subs:      { col: 'c.subscribers',   defaultDir: 'desc' },
  delta7d:   { col: 's.delta_7d_pct',  defaultDir: 'desc' },
  delta30d:  { col: 's.delta_30d_pct', defaultDir: 'desc' },
  views:     { col: 'c.views',         defaultDir: 'desc' },
  videos:    { col: 'c.videos',        defaultDir: 'desc' },
  name:      { col: 'c.name',          defaultDir: 'asc' },
};

export default function Home() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('score');
  const [order, setOrder] = useState('desc');
  const [filters, setFilters] = useState({
    q: '', min_score: '', max_score: 100, min_subs: '', max_subs: '',
    min_delta7d: '', max_delta7d: '', category: '', country: '',
  });

  useEffect(() => {
    fetchData();
  }, [page, sort, order, filters]);

  async function fetchData() {
    setLoading(true);
    try {
      let query = supabase
        .from('channels')
        .select(`
          channel_id, handle, name, country, channel_type, grade, avatar,
          subscribers, views, videos, created_at, sb_rank, sb_path,
          first_seen_at, last_seen_at
        `, { count: 'estimated' });

      if (filters.q) {
        query = query.or(`name.ilike.%${filters.q}%,handle.ilike.%${filters.q}%`);
      }
      if (filters.min_subs) query = query.gte('subscribers', Number(filters.min_subs));
      if (filters.max_subs) query = query.lte('subscribers', Number(filters.max_subs));
      if (filters.country) query = query.eq('country', filters.country);
      if (filters.category) query = query.eq('channel_type', filters.category);

      const sortCol = SORT_OPTIONS[sort]?.col || 'c.subscribers';
      query = query.order(sortCol.replace('c.', '').replace('s.', '').replace('d.', ''), { ascending: order === 'asc' });

      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;
      if (error) throw error;
      setRows(data || []);
      setTotal(count || 0);
    } catch (e) {
      console.error('Fetch error:', e);
    } finally {
      setLoading(false);
    }
  }

  function handleSort(col) {
    if (sort === col) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSort(col);
      setOrder(SORT_OPTIONS[col]?.defaultDir || 'desc');
    }
    setPage(1);
  }

  function setFilter(k, v) {
    setFilters({ ...filters, [k]: v });
    setPage(1);
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <div className="card p-4 mb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 text-sm">
          <input
            placeholder="Search name/handle…"
            value={filters.q}
            onChange={(e) => setFilter('q', e.target.value)}
          />
          <input
            placeholder="Min subs"
            type="number"
            value={filters.min_subs}
            onChange={(e) => setFilter('min_subs', e.target.value)}
          />
          <input
            placeholder="Max subs"
            type="number"
            value={filters.max_subs}
            onChange={(e) => setFilter('max_subs', e.target.value)}
          />
          <input
            placeholder="Country (US, VN, …)"
            value={filters.country}
            onChange={(e) => setFilter('country', e.target.value.toUpperCase())}
          />
          <input
            placeholder="Niche"
            value={filters.category}
            onChange={(e) => setFilter('category', e.target.value)}
          />
          <button className="btn" onClick={() => setFilters({ q: '', min_score: '', max_score: 100, min_subs: '', max_subs: '', min_delta7d: '', max_delta7d: '', category: '', country: '' })}>
            Clear
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3 text-sm" style={{ color: 'var(--text-muted)' }}>
        <div>
          {loading ? 'Loading…' : `${total.toLocaleString()} channels · page ${page}/${totalPages || 1}`}
        </div>
        <div className="flex gap-2">
          <button className="btn" disabled={page <= 1} onClick={() => setPage(page - 1)}>‹ Prev</button>
          <button className="btn" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next ›</button>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left" style={{ borderBottom: '1px solid var(--border)' }}>
              <th className="p-3">Channel</th>
              <th className={`p-3 ${sort === 'subs' ? 'active' : ''}`} onClick={() => handleSort('subs')}>
                Subs {sort === 'subs' && <span className="arrow">{order === 'desc' ? '↓' : '↑'}</span>}
              </th>
              <th className="p-3">Grade</th>
              <th className={`p-3 ${sort === 'delta7d' ? 'active' : ''}`} onClick={() => handleSort('delta7d')}>
                Δ7d {sort === 'delta7d' && <span className="arrow">{order === 'desc' ? '↓' : '↑'}</span>}
              </th>
              <th className={`p-3 ${sort === 'delta30d' ? 'active' : ''}`} onClick={() => handleSort('delta30d')}>
                Δ30d {sort === 'delta30d' && <span className="arrow">{order === 'desc' ? '↓' : '↑'}</span>}
              </th>
              <th className={`p-3 ${sort === 'views' ? 'active' : ''}`} onClick={() => handleSort('views')}>
                Views {sort === 'views' && <span className="arrow">{order === 'desc' ? '↓' : '↑'}</span>}
              </th>
              <th className={`p-3 ${sort === 'videos' ? 'active' : ''}`} onClick={() => handleSort('videos')}>
                Videos {sort === 'videos' && <span className="arrow">{order === 'desc' ? '↓' : '↑'}</span>}
              </th>
              <th className="p-3">Country</th>
              <th className="p-3">Last seen</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.channel_id} className="hover:bg-opacity-50" style={{ borderBottom: '1px solid var(--border)' }}>
                <td className="p-3">
                  <Link href={`/channel?id=${r.channel_id}`} className="flex items-center gap-2">
                    {r.avatar && <img src={r.avatar} alt="" className="w-6 h-6 rounded-full" />}
                    <div>
                      <div className="font-medium">{r.name}</div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {r.handle ? '@' + r.handle : r.channel_id.slice(0, 14) + '…'}
                      </div>
                    </div>
                  </Link>
                </td>
                <td className="p-3">{formatNumber(r.subscribers)}</td>
                <td className={`p-3 font-bold ${gradeColor(r.grade)}`}>{r.grade || '—'}</td>
                <td className="p-3">
                  {r.delta_7d_pct !== null && r.delta_7d_pct !== undefined
                    ? <span className={Number(r.delta_7d_pct) >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                        {formatPct(r.delta_7d_pct, true)}
                      </span>
                    : '—'}
                </td>
                <td className="p-3">
                  {r.delta_30d_pct !== null && r.delta_30d_pct !== undefined
                    ? <span className={Number(r.delta_30d_pct) >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                        {formatPct(r.delta_30d_pct, true)}
                      </span>
                    : '—'}
                </td>
                <td className="p-3">{formatNumber(r.views)}</td>
                <td className="p-3">{formatNumber(r.videos)}</td>
                <td className="p-3">{r.country || '—'}</td>
                <td className="p-3 text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(r.last_seen_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && !loading && (
          <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>
            No channels match your filters
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button className="btn" disabled={page <= 1} onClick={() => setPage(page - 1)}>‹ Prev</button>
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Page {page} of {totalPages}
          </span>
          <button className="btn" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next ›</button>
        </div>
      )}
    </div>
  );
}
