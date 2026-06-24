'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase, formatNumber, formatPct, formatDate, gradeColor } from '@/lib/supabase';

export default function ChannelDetail() {
  const [id, setId] = useState(null);
  const [channel, setChannel] = useState(null);
  const [snapshots, setSnapshots] = useState([]);
  const [discoveries, setDiscoveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Read query param from window (works with static export)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setId(params.get('id'));
    }
  }, []);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const { data: ch } = await supabase
        .from('channels')
        .select('*')
        .eq('channel_id', id)
        .single();
      setChannel(ch);

      const { data: snaps } = await supabase
        .from('channel_snapshots')
        .select('*')
        .eq('channel_id', id)
        .order('captured_at', { ascending: false })
        .limit(50);
      setSnapshots(snaps || []);

      const { data: discs } = await supabase
        .from('discoveries')
        .select('*')
        .eq('channel_id', id)
        .order('discovered_at', { ascending: false })
        .limit(20);
      setDiscoveries(discs || []);

      setLoading(false);
    })();
  }, [id]);

  if (loading) return <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>Loading…</div>;
  if (!channel) return <div className="text-center py-12">Channel not found</div>;

  const latest = snapshots[0];

  return (
    <div>
      <Link href="/" className="text-sm">‹ Back to channels</Link>

      <div className="card p-6 my-4">
        <div className="flex items-start gap-4">
          {channel.avatar && <img src={channel.avatar} alt="" className="w-20 h-20 rounded-full" />}
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{channel.name}</h2>
            <div className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              {channel.handle ? '@' + channel.handle : channel.channel_id} · {channel.country || '—'} · {channel.channel_type || '—'}
            </div>
            <div className="flex gap-3 mt-3 text-sm">
              <a href={`https://www.youtube.com/channel/${channel.channel_id}`} target="_blank" rel="noopener">YouTube →</a>
              {channel.sb_path && (
                <a href={`https://socialblade.com/${channel.sb_path}`} target="_blank" rel="noopener">Social Blade →</a>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
          <Stat label="Subscribers" value={formatNumber(channel.subscribers)} />
          <Stat label="Views" value={formatNumber(channel.views)} />
          <Stat label="Videos" value={formatNumber(channel.videos)} />
          <Stat
            label="Grade"
            value={<span className={`font-bold ${gradeColor(channel.grade)}`}>{channel.grade || '—'}</span>}
          />
          <Stat
            label="SB Rank"
            value={channel.sb_rank ? `#${channel.sb_rank.toLocaleString()}` : '—'}
          />
        </div>

        {latest && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 p-3 rounded" style={{ background: 'var(--bg-soft)' }}>
            <Stat label="Δ7d subs" value={latest.delta_7d !== null ? formatNumber(latest.delta_7d) : '—'} />
            <Stat label="Δ7d %" value={latest.delta_7d_pct !== null ? formatPct(latest.delta_7d_pct, true) : '—'} />
            <Stat label="Δ30d subs" value={latest.delta_30d !== null ? formatNumber(latest.delta_30d) : '—'} />
            <Stat label="Δ30d %" value={latest.delta_30d_pct !== null ? formatPct(latest.delta_30d_pct, true) : '—'} />
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-4">
          <h3 className="text-lg font-semibold mb-3">History ({snapshots.length} snapshots)</h3>
          {snapshots.length === 0 ? (
            <div style={{ color: 'var(--text-muted)' }}>No snapshots yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th className="text-left p-2">When</th>
                    <th className="text-right p-2">Subs</th>
                    <th className="text-right p-2">Δ7d</th>
                    <th className="text-right p-2">Δ30d</th>
                  </tr>
                </thead>
                <tbody>
                  {snapshots.map((s) => (
                    <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="p-2 text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(s.captured_at)}</td>
                      <td className="p-2 text-right">{formatNumber(s.subscribers)}</td>
                      <td className="p-2 text-right">{s.delta_7d_pct !== null ? formatPct(s.delta_7d_pct, true) : '—'}</td>
                      <td className="p-2 text-right">{s.delta_30d_pct !== null ? formatPct(s.delta_30d_pct, true) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card p-4">
          <h3 className="text-lg font-semibold mb-3">Discoveries ({discoveries.length})</h3>
          {discoveries.length === 0 ? (
            <div style={{ color: 'var(--text-muted)' }}>No discoveries recorded</div>
          ) : (
            <ul className="space-y-2 text-sm">
              {discoveries.map((d) => (
                <li key={d.id} className="p-2 rounded" style={{ background: 'var(--bg-soft)' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{d.source}</div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {d.category} · {d.country || '—'} · {formatDate(d.discovered_at)}
                      </div>
                    </div>
                    {d.score !== null && (
                      <div className="text-right">
                        <div className="text-lg font-bold" style={{ color: 'var(--accent)' }}>{d.score.toFixed(0)}</div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>score</div>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</div>
      <div className="text-lg font-semibold mt-0.5">{value}</div>
    </div>
  );
}
