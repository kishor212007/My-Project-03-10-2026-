import { useEffect, useState } from 'react';
import { ArrowDownWideNarrow, ArrowUpRight, Check, Copy, Search, Sparkles } from 'lucide-react';

function PaletteCard({ palette, onCopy }) {
  return (
    <article className="palette-card">
      <div className="swatches" aria-label={`${palette.colors.length} colors`}>
        {palette.colors.map((color, index) => (
          <button
            className="swatch"
            key={`${palette.id}-${color}-${index}`}
            style={{ backgroundColor: color }}
            onClick={() => onCopy(color)}
            title={`Copy ${color}`}
            aria-label={`Copy color ${color}`}
          >
            <span className="swatch-copy"><Copy size={14} /></span>
          </button>
        ))}
      </div>
      <div className="palette-info">
        <div className="palette-heading">
          <h2>{palette.title}</h2>
          <span className="palette-count">{palette.colors.length} colors</span>
        </div>
        <div className="color-list">
          {palette.colors.map((color, index) => (
            <button key={`${palette.id}-hex-${index}`} onClick={() => onCopy(color)}>
              {color}
            </button>
          ))}
        </div>
        <div className="card-footer">
          <div className="tags">
            {palette.tags.slice(0, 3).map((tag) => <span key={tag}>#{tag}</span>)}
          </div>
          <span className="author">by {palette.author}</span>
        </div>
      </div>
    </article>
  );
}

export default function App() {
  const [palettes, setPalettes] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('popular');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const query = new URLSearchParams({ search: search.trim(), sort, limit: '50' });
        const response = await fetch(`/api/palettes?${query}`, { signal: controller.signal });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Could not load palettes.');
        setPalettes(result.palettes);
      } catch (loadError) {
        if (loadError.name !== 'AbortError') {
          setError(loadError.message || 'Could not connect to the palette server.');
          setPalettes([]);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 180);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [search, sort]);

  async function copyColor(color) {
    try {
      await navigator.clipboard.writeText(color);
      setCopied(color);
      window.setTimeout(() => setCopied(''), 1600);
    } catch {
      setError('Clipboard access is unavailable. Copy the hex value directly instead.');
    }
  }

  return (
    <main>
      <nav className="topbar">
        <a className="brand" href="/" aria-label="Hue home">
          <span className="brand-mark"><span /><span /><span /><span /></span>
          <span>hue<span className="brand-period">.</span></span>
        </a>
        <div className="nav-caption">A little color inspiration</div>
        <a className="nav-link" href="#palette-grid">Explore <ArrowUpRight size={15} /></a>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <div className="eyebrow"><Sparkles size={14} /> THE PALETTE LIBRARY</div>
          <h1>Find your next<br /><span>favorite color.</span></h1>
          <p>A curated collection of colors for whatever you’re creating.</p>
          <div className="search-row">
            <label className="search-box">
              <Search size={18} aria-hidden="true" />
              <input
                aria-label="Search palettes"
                placeholder="Try “sunset” or “ocean”"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              {search && <button className="clear-search" onClick={() => setSearch('')} aria-label="Clear search">×</button>}
            </label>
            <label className="sort-box">
              <ArrowDownWideNarrow size={16} aria-hidden="true" />
              <select aria-label="Sort palettes" value={sort} onChange={(event) => setSort(event.target.value)}>
                <option value="popular">Popular</option>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </label>
          </div>
        </div>
        <div className="hero-orbit orbit-one" />
        <div className="hero-orbit orbit-two" />
        <div className="hero-art" aria-hidden="true">
          <div className="art-card art-card-back">
            <i /><i /><i /><i /><i />
          </div>
          <div className="art-card art-card-front">
            <i /><i /><i /><i /><i />
            <div className="art-label">COLOR STUDY No. 08</div>
          </div>
          <span className="art-spark spark-one">✳</span>
          <span className="art-spark spark-two">✳</span>
        </div>
      </section>

      <section className="library" id="palette-grid">
        <div className="section-head">
          <div>
            <span className="section-kicker">MADE FOR YOUR MOOD</span>
            <h2>{search ? 'Search results' : 'Color, collected.'}</h2>
          </div>
          {!loading && !error && <span className="result-count">{palettes.length} palettes</span>}
        </div>

        {loading ? (
          <div className="message-state"><span className="loader" /> Loading palettes from your collection…</div>
        ) : error ? (
          <div className="message-state error-state">
            <strong>We couldn’t load the palettes.</strong>
            <span>{error}</span>
            <span className="hint">Make sure the API is running at localhost:5000.</span>
          </div>
        ) : palettes.length === 0 ? (
          <div className="message-state">No palettes found. Try another search.</div>
        ) : (
          <div className="palette-grid">
            {palettes.map((palette) => <PaletteCard key={palette.id} palette={palette} onCopy={copyColor} />)}
          </div>
        )}
      </section>

      <footer>
        <a className="brand footer-brand" href="#"><span className="brand-mark"><span /><span /><span /><span /></span><span>hue<span className="brand-period">.</span></span></a>
        <span>Color inspiration, collected with care.</span>
        <span className="footer-note">{copied ? <><Check size={14} /> Copied {copied}</> : 'Made to make things colorful.'}</span>
      </footer>
    </main>
  );
}
