import './globals.css';

export const metadata = {
  title: 'spy-yt — rising YouTube channels',
  description: 'Discover rising YouTube channels across niches',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <header className="topbar">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-3">
            <svg className="flame" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b"/>
                  <stop offset="100%" stopColor="#d63031"/>
                </linearGradient>
              </defs>
              <path d="M32 4 C 38 16, 50 22, 50 38 C 50 50, 42 58, 32 58 C 22 58, 14 50, 14 38 C 14 30, 18 26, 22 22 C 20 30, 24 34, 28 30 C 24 24, 26 14, 32 4 Z" fill="url(#g)"/>
            </svg>
            <a href="/" className="logo-name">spy-yt</a>
            <span className="text-xs muted ml-1">rising YouTube channels</span>
            <nav className="ml-auto flex gap-1 text-sm">
              <a href="/" className="px-3 py-1 rounded hover:bg-gray-800">Channels</a>
              <a href="/runs" className="px-3 py-1 rounded hover:bg-gray-800">Crawl runs</a>
              <a href="https://github.com/tmk202/spy-yt" target="_blank" rel="noopener" className="px-3 py-1 rounded hover:bg-gray-800">GitHub</a>
            </nav>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-6 py-5">
          {children}
        </main>
        <footer className="text-center py-6 text-xs muted border-t mt-8" style={{ borderColor: 'var(--border)' }}>
          data via Supabase Postgres · by <a href="#" className="author-link">@mocnguyenvn</a> · UTC+7
        </footer>
      </body>
    </html>
  );
}
