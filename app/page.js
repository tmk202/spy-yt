'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase, formatNumber, formatPct, formatDate, gradeColor } from '@/lib/supabase';

const PAGE_SIZE = 50;

const SORT_OPTIONS = {
  subs:      { col: 'subscribers',   defaultDir: 'desc', label: 'Subs' },
  views:     { col: 'views',         defaultDir: 'desc', label: 'Views' },
  videos:    { col: 'videos',        defaultDir: 'desc', label: 'Videos' },
  name:      { col: 'name',          defaultDir: 'asc',  label: 'Channel' },
  lastseen:  { col: 'last_seen_at',  defaultDir: 'desc', label: 'Last seen' },
  firstseen: { col: 'first_seen_at', defaultDir: 'desc', label: 'First seen' },
};

export default function Home() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('lastseen');
  const [order, setOrder] = useState('desc');
  const [filters, setFilters] = useState({
    q: '', min_subs: '1000', max_subs: '100000',
    country: '', category: '',
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
          subscribers, views, videos, first_seen_at, last_seen_at
        `, { count: 'estimated' });

      if (filters.q) {
        query = query.or(`name.ilike.%${filters.q}%,handle.ilike.%${filters.q}%`);
      }
      if (filters.min_subs) query = query.gte('subscribers', Number(filters.min_subs));
      if (filters.max_subs) query = query.lte('subscribers', Number(filters.max_subs));
      if (filters.country) query = query.eq('country', filters.country);
      if (filters.category) query = query.eq('channel_type', filters.category);

      const sortCol = SORT_OPTIONS[sort]?.col || 'last_seen_at';
      query = query.order(sortCol, { ascending: order === 'asc' });

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
      {/* Summary cards */}
      <div className="summary">
        <SummaryCard label="Rising channels" value={loading ? '—' : total.toLocaleString()} />
        <SummaryCard label="Showing" value={`${rows.length} / page`} small />
        <SummaryCard label="Page" value={`${page} / ${totalPages || 1}`} small />
        <SummaryCard label="Default range" value="1k-100k subs" small />
        <SummaryCard label="Sort" value={SORT_OPTIONS[sort]?.label || sort} small />
      </div>

      {/* Filter bar */}
      <div className="card p-3 mb-3">
        <div className="flex flex-wrap items-end gap-2 text-sm">
          <FilterField label="Search">
            <input
              className="w-40"
              placeholder="name / @handle"
              value={filters.q}
              onChange={(e) => setFilter('q', e.target.value)}
            />
          </FilterField>
          <FilterField label="Min subs">
            <input
              className="w-20"
              type="number"
              value={filters.min_subs}
              onChange={(e) => setFilter('min_subs', e.target.value)}
            />
          </FilterField>
          <FilterField label="Max subs">
            <input
              className="w-24"
              type="number"
              value={filters.max_subs}
              onChange={(e) => setFilter('max_subs', e.target.value)}
            />
          </FilterField>
          <FilterField label="Country">
            <input
              className="w-16"
              maxLength={2}
              placeholder="US"
              value={filters.country}
              onChange={(e) => setFilter('country', e.target.value.toUpperCase())}
            />
          </FilterField>
          <FilterField label="Niche">
            <input
              className="w-32"
              placeholder="e.g. AI tools"
              value={filters.category}
              onChange={(e) => setFilter('category', e.target.value)}
            />
          </FilterField>
          <button
            className="btn"
            onClick={() => setFilters({ q: '', min_subs: '1000', max_subs: '100000', country: '', category: '' })}
          >
            Reset
          </button>
          <div className="ml-auto flex items-center gap-2 text-xs muted">
            <span>{loading ? 'Loading…' : `${total.toLocaleString()} channels · page ${page}/${totalPages || 1}`}</span>
            <button className="btn" disabled={page <= 1} onClick={() => setPage(page - 1)}>‹ Prev</button>
            <button className="btn" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next ›</button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="w-full" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '210px' }} />
            <col style={{ width: '60px' }} />
            <col style={{ width: '50px' }} />
            <col style={{ width: '55px' }} />
            <col style={{ width: '55px' }} />
            <col style={{ width: '65px' }} />
            <col style={{ width: '50px' }} />
            <col style={{ width: '40px' }} />
            <col style={{ width: '85px' }} />
          </colgroup>
          <thead>
            <tr>
              <th onClick={() => handleSort('name')}>
                Channel {sort === 'name' && <span className="arrow">{order === 'desc' ? '▼' : '▲'}</span>}
              </th>
              <th onClick={() => handleSort('subs')} className="text-right">
                Subs {sort === 'subs' && <span className="arrow">{order === 'desc' ? '▼' : '▲'}</span>}
              </th>
              <th>Grd</th>
              <th onClick={() => handleSort('lastseen')} className="text-right">
                Δ7d {sort === 'lastseen' && <span className="arrow">{order === 'desc' ? '▼' : '▲'}</span>}
              </th>
              <th className="text-right">Δ30d</th>
              <th onClick={() => handleSort('views')} className="text-right">
                Views {sort === 'views' && <span className="arrow">{order === 'desc' ? '▼' : '▲'}</span>}
              </th>
              <th onClick={() => handleSort('videos')} className="text-right">
                Videos {sort === 'videos' && <span className="arrow">{order === 'desc' ? '▼' : '▲'}</span>}
              </th>
              <th>🌍</th>
              <th>Seen</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.channel_id}>
                <td>
                  <Link href={`/channel/?id=${r.channel_id}`} className="block min-w-0">
                    <div className="font-medium truncate" title={r.name}>{r.name}</div>
                    <div className="text-xs muted truncate" title={r.handle || r.channel_id}>
                      {r.handle ? '@' + r.handle : r.channel_id.slice(0, 14)}
                    </div>
                  </Link>
                </td>
                <td className="text-right tabular-nums">{formatNumber(r.subscribers)}</td>
                <td className={`font-semibold ${gradeColor(r.grade)}`}>{r.grade || '—'}</td>
                <td className="text-right muted">—</td>
                <td className="text-right muted">—</td>
                <td className="text-right tabular-nums">{formatNumber(r.views)}</td>
                <td className="text-right tabular-nums">{formatNumber(r.videos)}</td>
                <td>{r.country || '—'}</td>
                <td className="text-xs muted">{formatDate(r.last_seen_at, '%m-%d')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && !loading && (
          <div className="p-8 text-center muted">No channels match your filters</div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-3">
          <button className="btn" disabled={page <= 1} onClick={() => setPage(page - 1)}>‹ Prev</button>
          <span className="text-sm muted">Page {page} of {totalPages}</span>
          <button className="btn" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next ›</button>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, small = false }) {
  return (
    <div className="card">
      <div className="label">{label}</div>
      <div className={`value ${small ? 'small' : ''}`}>{value}</div>
    </div>
  );
}

function FilterField({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs muted">{label}</label>
      {children}
    </div>
  );
}
