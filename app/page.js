'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase, formatNumber, formatPct, gradeColor } from '@/lib/supabase';

const PAGE_SIZE = 25;

const SORT_OPTIONS = {
  score:     { col: 'last_score',      defaultDir: 'desc', label: 'Score' },
  name:      { col: 'name',            defaultDir: 'asc',  label: 'Channel' },
  subs:      { col: 'subscribers',     defaultDir: 'desc', label: 'Subs' },
  delta7d:   { col: 'delta_7d_pct',    defaultDir: 'desc', label: 'Δ7d' },
  delta30d:  { col: 'delta_30d_pct',   defaultDir: 'desc', label: 'Δ30d' },
  views:     { col: 'views',           defaultDir: 'desc', label: 'Views' },
  videos:    { col: 'videos',          defaultDir: 'desc', label: 'Videos' },
  grade:     { col: 'grade',           defaultDir: 'asc',  label: 'Grade' },
  lastseen:  { col: 'last_seen_at',    defaultDir: 'desc', label: 'Last seen' },
};

export default function Home() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('score');
  const [order, setOrder] = useState('desc');
  const [filters, setFilters] = useState({
    q: '', min_subs: '', max_subs: '',
    country: '', niche: '',
  });

  useEffect(() => {
    fetchData();
  }, [page, sort, order, filters]);

  async function fetchData() {
    setLoading(true);
    try {
      let query = supabase
        .from('channel_dashboard')
        .select(`
          channel_id, handle, name, avatar, country, channel_type, grade,
          subscribers, views, videos, sb_path, sb_rank,
          delta_7d, delta_7d_pct, delta_30d, delta_30d_pct,
          last_score, last_discovered_category, last_seen_at, first_seen_at
        `, { count: 'estimated' });

      if (filters.q) {
        query = query.or(`name.ilike.%${filters.q}%,handle.ilike.%${filters.q}%`);
      }
      if (filters.min_subs) query = query.gte('subscribers', Number(filters.min_subs));
      if (filters.max_subs) query = query.lte('subscribers', Number(filters.max_subs));
      if (filters.country) query = query.eq('country', filters.country);
      if (filters.niche) query = query.ilike('channel_type', `%${filters.niche}%`);

      const sortCol = SORT_OPTIONS[sort]?.col || 'last_score';
      // nullsLast for score (so nulls go to end when sorting desc)
      query = query.order(sortCol, { ascending: order === 'asc', nullsFirst: false });

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
  const startIdx = (page - 1) * PAGE_SIZE;

  return (
    <div>
      {/* Filter bar */}
      <div className="card p-3 mb-3">
        <div className="flex flex-wrap items-end gap-2 text-sm">
          <FilterField label="Search">
            <input
              className="w-36"
              placeholder="name / @handle"
              value={filters.q}
              onChange={(e) => setFilter('q', e.target.value)}
            />
          </FilterField>
          <FilterField label="Min subs">
            <input className="w-20" type="number" value={filters.min_subs}
              onChange={(e) => setFilter('min_subs', e.target.value)} />
          </FilterField>
          <FilterField label="Max subs">
            <input className="w-24" type="number" value={filters.max_subs}
              onChange={(e) => setFilter('max_subs', e.target.value)} />
          </FilterField>
          <FilterField label="Country">
            <input className="w-14" maxLength={2} placeholder="US"
              value={filters.country}
              onChange={(e) => setFilter('country', e.target.value.toUpperCase())} />
          </FilterField>
          <FilterField label="Niche">
            <input className="w-32" placeholder="e.g. AI tools"
              value={filters.niche}
              onChange={(e) => setFilter('niche', e.target.value)} />
          </FilterField>
          <button
            className="btn"
            onClick={() => setFilters({ q: '', min_subs: '', max_subs: '', country: '', niche: '' })}
          >
            Reset
          </button>
          <div className="ml-auto flex items-center gap-2 text-xs muted">
            <span>
              {loading ? 'Loading…' : (
                <>Hiển thị <b>{startIdx + 1}–{Math.min(startIdx + rows.length, total)}</b> trong tổng <b>{total.toLocaleString()}</b> kênh</>
              )}
            </span>
            <button className="btn" disabled={page <= 1} onClick={() => setPage(page - 1)}>‹ Prev</button>
            <button className="btn" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next ›</button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="w-full" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '36px' }} />
            <col style={{ width: '46px' }} />
            <col style={{ width: 'auto' }} />
            <col style={{ width: '62px' }} />
            <col style={{ width: '64px' }} />
            <col style={{ width: '64px' }} />
            <col style={{ width: '70px' }} />
            <col style={{ width: '54px' }} />
            <col style={{ width: '46px' }} />
            <col style={{ width: '44px' }} />
            <col style={{ width: 'auto' }} />
            <col style={{ width: '78px' }} />
          </colgroup>
          <thead>
            <tr>
              <th onClick={() => handleSort('score')} className="text-right">
                Score {sort === 'score' && <span className="arrow">{order === 'desc' ? '▼' : '▲'}</span>}
              </th>
              <th className="muted text-right">#</th>
              <th onClick={() => handleSort('name')}>
                Channel {sort === 'name' && <span className="arrow">{order === 'desc' ? '▼' : '▲'}</span>}
              </th>
              <th onClick={() => handleSort('subs')} className="text-right">
                Subs {sort === 'subs' && <span className="arrow">{order === 'desc' ? '▼' : '▲'}</span>}
              </th>
              <th onClick={() => handleSort('delta7d')} className="text-right">
                Δ7d {sort === 'delta7d' && <span className="arrow">{order === 'desc' ? '▼' : '▲'}</span>}
              </th>
              <th onClick={() => handleSort('delta30d')} className="text-right">
                Δ30d {sort === 'delta30d' && <span className="arrow">{order === 'desc' ? '▼' : '▲'}</span>}
              </th>
              <th onClick={() => handleSort('views')} className="text-right">
                Views {sort === 'views' && <span className="arrow">{order === 'desc' ? '▼' : '▲'}</span>}
              </th>
              <th onClick={() => handleSort('videos')} className="text-right">
                Videos {sort === 'videos' && <span className="arrow">{order === 'desc' ? '▼' : '▲'}</span>}
              </th>
              <th onClick={() => handleSort('grade')}>
                Grade {sort === 'grade' && <span className="arrow">{order === 'desc' ? '▼' : '▲'}</span>}
              </th>
              <th>Country</th>
              <th>Niche</th>
              <th onClick={() => handleSort('lastseen')}>
                Last seen {sort === 'lastseen' && <span className="arrow">{order === 'desc' ? '▼' : '▲'}</span>}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const rowNum = startIdx + i + 1;
              const sbUrl = r.sb_path ? `https://socialblade.com/${r.sb_path}` : null;
              return (
                <tr key={r.channel_id}>
                  {/* Score */}
                  <td className="text-right score-cell">
                    {r.last_score !== null && r.last_score !== undefined
                      ? r.last_score.toFixed(0)
                      : <span className="muted">—</span>}
                  </td>
                  {/* # */}
                  <td className="text-right muted text-xs">{rowNum}</td>
                  {/* Channel + links */}
                  <td>
                    <div className="min-w-0">
                      <Link
                        href={`/channel/?id=${r.channel_id}`}
                        className="font-semibold text-sm truncate block"
                        title={r.name}
                      >
                        {r.name}
                      </Link>
                      <div className="flex items-center gap-2 mt-0.5 text-xs">
                        <a
                          href={`https://www.youtube.com/channel/${r.channel_id}`}
                          target="_blank" rel="noopener"
                          className="yt-link"
                        >↗ YT</a>
                        {sbUrl && (
                          <a href={sbUrl} target="_blank" rel="noopener" className="sb-link">SB</a>
                        )}
                        <span className="muted truncate" title={r.handle || r.channel_id}>
                          {r.handle ? '@' + r.handle : r.channel_id.slice(0, 12)}
                        </span>
                      </div>
                    </div>
                  </td>
                  {/* Subs */}
                  <td className="text-right tabular-nums">{formatNumber(r.subscribers)}</td>
                  {/* Δ7d */}
                  <td className="text-right tabular-nums">
                    {r.delta_7d_pct !== null && r.delta_7d_pct !== undefined
                      ? <span className={Number(r.delta_7d_pct) >= 0 ? 'green-text font-semibold' : 'red-text font-semibold'}>
                          {formatPct(r.delta_7d_pct, true)}
                        </span>
                      : <span className="muted">—</span>}
                  </td>
                  {/* Δ30d */}
                  <td className="text-right tabular-nums">
                    {r.delta_30d_pct !== null && r.delta_30d_pct !== undefined
                      ? <span className={Number(r.delta_30d_pct) >= 0 ? 'green-text font-semibold' : 'red-text font-semibold'}>
                          {formatPct(r.delta_30d_pct, true)}
                        </span>
                      : <span className="muted">—</span>}
                  </td>
                  {/* Views */}
                  <td className="text-right tabular-nums">{formatNumber(r.views)}</td>
                  {/* Videos */}
                  <td className="text-right tabular-nums">{formatNumber(r.videos)}</td>
                  {/* Grade */}
                  <td className={`font-semibold ${gradeColor(r.grade)}`}>{r.grade || '—'}</td>
                  {/* Country */}
                  <td className="muted">{r.country || '—'}</td>
                  {/* Niche (channel_type or last_discovered_category) */}
                  <td>
                    {r.channel_type ? (
                      <span className="niche-chip">{r.channel_type}</span>
                    ) : r.last_discovered_category ? (
                      <span className="niche-chip">{r.last_discovered_category}</span>
                    ) : <span className="muted">—</span>}
                  </td>
                  {/* Last seen (date + time multiline) */}
                  <td className="text-xs muted tabular-nums">
                    {r.last_seen_at ? <LastSeen iso={r.last_seen_at} /> : '—'}
                  </td>
                </tr>
              );
            })}
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

function FilterField({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs muted">{label}</label>
      {children}
    </div>
  );
}

function LastSeen({ iso }) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return <span>{iso}</span>;
  const pad = (n) => String(n).padStart(2, '0');
  return (
    <span style={{ whiteSpace: 'pre' }}>
      {`${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}\n${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`}
    </span>
  );
}
