'use client';

import { useEffect, useState } from 'react';
import { supabase, formatDate, formatNumber } from '@/lib/supabase';

const STATUS_COLORS = {
  running: 'text-blue-400',
  success: 'text-emerald-400',
  error:   'text-red-400',
  stopped: 'text-yellow-400',
};

export default function RunsPage() {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const PAGE = 50;

  useEffect(() => {
    fetchRuns();
  }, [page]);

  async function fetchRuns() {
    setLoading(true);
    const from = (page - 1) * PAGE;
    const to = from + PAGE - 1;
    const { data, error } = await supabase
      .from('crawl_runs')
      .select('*')
      .order('started_at', { ascending: false })
      .range(from, to);
    if (data) setRuns(data);
    setLoading(false);
  }

  // group by date
  const byDate = {};
  runs.forEach((r) => {
    const d = (r.started_at || '').slice(0, 10);
    if (!byDate[d]) byDate[d] = [];
    byDate[d].push(r);
  });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Crawl runs</h2>
      {loading ? (
        <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>Loading…</div>
      ) : (
        <>
          {Object.entries(byDate).map(([date, list]) => (
            <div key={date} className="card p-4 mb-3">
              <h3 className="text-lg font-semibold mb-2">{date}</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <th className="text-left p-2">Started</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Niche</th>
                      <th className="text-right p-2">Round</th>
                      <th className="text-right p-2">Hits</th>
                      <th className="text-right p-2">New</th>
                      <th className="text-right p-2">Enriched</th>
                      <th className="text-right p-2">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((r) => {
                      const dur = r.finished_at && r.started_at
                        ? Math.round((new Date(r.finished_at) - new Date(r.started_at)) / 1000)
                        : null;
                      return (
                        <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td className="p-2 text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(r.started_at, '%H:%M:%S')}</td>
                          <td className={`p-2 font-medium ${STATUS_COLORS[r.status] || ''}`}>{r.status}</td>
                          <td className="p-2">{r.niche || '—'}</td>
                          <td className="p-2 text-right">{r.round_number || '—'}</td>
                          <td className="p-2 text-right">{formatNumber(r.candidates_found)}</td>
                          <td className="p-2 text-right text-emerald-400">{formatNumber(r.channels_new)}</td>
                          <td className="p-2 text-right">{formatNumber(r.channels_enriched)}</td>
                          <td className="p-2 text-right text-xs" style={{ color: 'var(--text-muted)' }}>
                            {dur !== null ? `${dur}s` : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-center gap-2 mt-4">
            <button className="btn" disabled={page <= 1} onClick={() => setPage(page - 1)}>‹ Prev</button>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Page {page}</span>
            <button className="btn" disabled={runs.length < PAGE} onClick={() => setPage(page + 1)}>Next ›</button>
          </div>
        </>
      )}
    </div>
  );
}
