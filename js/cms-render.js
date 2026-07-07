/**
 * FTCC CMS Renderer
 * Reads JSON files saved by Decap CMS from /content/events/ and /content/news/
 * and renders them into the public-facing pages.
 *
 * How it works:
 *  1. Fetches /content/events/index.json (a manifest we generate) OR scans known files
 *  2. Renders events into #cms-events and news into #cms-news
 */

const EVENTS_MANIFEST = './content/events/manifest.json';
const NEWS_MANIFEST   = './content/news/manifest.json';

// ── HELPERS ───────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return 'TBA';
  try {
    return new Date(dateStr).toLocaleDateString('en-AU', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  } catch { return dateStr; }
}

function formatDay(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-AU', { weekday: 'short' });
  } catch { return ''; }
}

function formatShortDate(dateStr) {
  if (!dateStr) return 'TBA';
  try {
    return new Date(dateStr).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
  } catch { return 'TBA'; }
}

// ── EVENTS ────────────────────────────────────────────────────

function renderEventRow(e) {
  const chipMap = {
    featured: ['chip-featured', 'Featured'],
    past:     ['chip-past',     'Past event'],
    upcoming: ['chip-upcoming', 'Upcoming'],
  };
  const [chipClass, chipLabel] = chipMap[e.status] || chipMap.upcoming;
  const tags = (e.tags || []).map(t =>
    `<span style="background:rgba(245,200,66,0.12);border:1px solid rgba(245,200,66,0.25);color:#8a6400;font-size:.72rem;font-weight:700;padding:3px 10px;border-radius:100px;">#${t}</span>`
  ).join('');

  return `
    <div class="event-row">
      <div class="event-date-block">
        <div class="day">${formatShortDate(e.date)}</div>
        <div class="dow">${formatDay(e.date)}</div>
      </div>
      <div class="event-info">
        <div class="meta">
          ${e.location    ? `<span>📍 ${e.location}</span>` : ''}
          ${e.time        ? `<span>⏰ ${e.time}</span>`     : ''}
          ${e.partner     ? `<span>🤝 With ${e.partner}</span>` : ''}
        </div>
        <h3>${e.title}</h3>
        ${e.description ? `<p>${e.description}</p>` : ''}
        ${tags ? `<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:10px;">${tags}</div>` : ''}
      </div>
      <div><span class="chip ${chipClass}">${chipLabel}</span></div>
    </div>`;
}

async function loadEvents() {
  const container = document.getElementById('cms-events');
  if (!container) return;

  let events = [];
  try {
    // Try manifest first
    const res = await fetch(EVENTS_MANIFEST + '?t=' + Date.now());
    if (res.ok) {
      const manifest = await res.json();
      // Fetch each file listed in the manifest
      const fetches = manifest.files.map(f =>
        fetch('./content/events/' + f + '?t=' + Date.now()).then(r => r.ok ? r.json() : null)
      );
      const results = await Promise.all(fetches);
      events = results.filter(Boolean);
    }
  } catch (e) {
    console.log('CMS events manifest not found — showing static content.');
    return;
  }

  if (!events.length) return;

  // Sort by date descending
  events.sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(b.date) - new Date(a.date);
  });

  const upcoming = events.filter(e => e.status === 'upcoming' || e.status === 'featured');
  const past     = events.filter(e => e.status === 'past');

  let html = '';

  if (upcoming.length) {
    html += `<div class="section-label">Upcoming events</div>
             <h2 class="section-title">What's coming up</h2>
             <div class="events-list" style="margin-top:32px;">
               ${upcoming.map(renderEventRow).join('')}
             </div>`;
  }

  if (past.length) {
    html += `<div class="section-label" style="margin-top:56px;">Past highlights</div>
             <h2 class="section-title">Where we've been</h2>
             <div class="events-list" style="margin-top:32px;">
               ${past.map(renderEventRow).join('')}
             </div>`;
  }

  container.innerHTML = html;
}

// ── NEWS ──────────────────────────────────────────────────────

function renderNewsCard(n) {
  const tags = (n.tags || []).map(t =>
    `<span style="background:rgba(245,200,66,0.12);border:1px solid rgba(245,200,66,0.25);color:#8a6400;font-size:.72rem;font-weight:700;padding:3px 10px;border-radius:100px;">#${t}</span>`
  ).join('');

  return `
    <div class="pillar-card" style="display:flex;flex-direction:column;">
      ${n.image ? `<img src="${n.image}" alt="${n.title}" style="width:100%;height:180px;object-fit:cover;border-radius:10px;margin-bottom:16px;" />` : ''}
      <div style="font-size:.78rem;color:var(--muted);margin-bottom:8px;">${formatDate(n.date)}</div>
      <h3 style="color:var(--navy);margin-bottom:10px;">${n.title}</h3>
      <p style="flex:1;">${n.excerpt || ''}</p>
      ${tags ? `<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:14px;">${tags}</div>` : ''}
      ${n.facebook_url ? `<a href="${n.facebook_url}" target="_blank" style="display:inline-block;margin-top:16px;color:var(--navy);font-weight:700;font-size:.85rem;">Read more →</a>` : ''}
    </div>`;
}

async function loadNews() {
  const container = document.getElementById('cms-news');
  if (!container) return;

  let news = [];
  try {
    const res = await fetch(NEWS_MANIFEST + '?t=' + Date.now());
    if (res.ok) {
      const manifest = await res.json();
      const fetches = manifest.files.map(f =>
        fetch('./content/news/' + f + '?t=' + Date.now()).then(r => r.ok ? r.json() : null)
      );
      const results = await Promise.all(fetches);
      news = results.filter(Boolean);
    }
  } catch (e) {
    console.log('CMS news manifest not found.');
    return;
  }

  if (!news.length) return;

  news.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  const html = `
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:24px;margin-top:48px;">
      ${news.map(renderNewsCard).join('')}
    </div>`;
  container.innerHTML = html;
}

// ── INIT ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadEvents();
  loadNews();
});
