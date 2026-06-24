import './globals.css';

export const metadata = {
  title: 'spy-yt — rising YouTube channels',
  description: 'Discover rising YouTube channels across niches',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <header className="border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
            <svg className="flame" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fbbf24"/>
                  <stop offset="50%" stopColor="#f97316"/>
                  <stop offset="100%" stopColor="#ef4444"/>
                </linearGradient>
              </defs>
              <path d="M32 4 C 38 16, 50 22, 50 38 C 50 50, 42 58, 32 58 C 22 58, 14 50, 14 38 C 14 30, 18 26, 22 22 C 20 30, 24 34, 28 30 C 24 24, 26 14, 32 4 Z" fill="url(#g)"/>
            </svg>
            <h1 className="text-xl font-semibold">
              <a href="/">spy-yt</a>
            </h1>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>rising YouTube channels</span>
            <nav className="ml-auto flex gap-4 text-sm">
              <a href="/">Channels</a>
              <a href="/runs">Crawl runs</a>
              <a href="https://github.com/tmk202/spy-yt" target="_blank" rel="noopener">GitHub</a>
            </nav>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-6">
          {children}
        </main>
        <footer className="max-w-7xl mx-auto px-4 py-6 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
          data via Supabase Postgres · by @mocnguyenvn · UTC+7
        </footer>
      </body>
    </html>
  );
}
