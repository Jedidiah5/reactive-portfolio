/* Owner-only stats window: pulls the visits for a date range and draws
   the numbers as plain HTML (no chart library). Every string that came from
   a visitor is escaped before it touches innerHTML. */
import { fetchVisits } from './analytics.js';

const SECTIONS = ['HELLO', 'ABOUT', 'WORK', 'WALL', 'CONTACT'];
const DAY = 86_400_000;

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pct = (n, total) => (total ? Math.round((n / total) * 100) : 0);

function duration(sec) {
  if (!sec) return '0s';
  const m = Math.floor(sec / 60), s = Math.round(sec % 60);
  return m ? `${m}m ${String(s).padStart(2, '0')}s` : `${s}s`;
}

function ago(t) {
  const m = Math.round((Date.now() - t) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

function tally(values) {
  const map = new Map();
  values.forEach((v) => map.set(v, (map.get(v) || 0) + 1));
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
}

function startOfDay(t) {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function barList(rows, total, fmt = (n) => n) {
  if (!rows.length) return '<p class="st-empty">nothing yet</p>';
  const max = Math.max(...rows.map((r) => r[1]), 1);
  return `<ul class="st-bars">${rows.map(([label, n]) => `
    <li>
      <span class="st-bar-label" title="${esc(label)}">${esc(label)}</span>
      <span class="st-bar-track"><i style="width:${(n / max) * 100}%"></i></span>
      <b>${fmt(n, total)}</b>
    </li>`).join('')}</ul>`;
}

function panel(title, body, extra = '') {
  return `<section class="st-panel ${extra}"><h4 class="st-title">${title}</h4>${body}</section>`;
}

function dayChart(visits, days) {
  const today = startOfDay(Date.now());
  const buckets = [...Array(days)].map((_, i) => ({ t: today - (days - 1 - i) * DAY, n: 0 }));
  visits.forEach((v) => {
    const idx = days - 1 - Math.round((today - startOfDay(v.t)) / DAY);
    if (buckets[idx]) buckets[idx].n += 1;
  });
  const max = Math.max(...buckets.map((b) => b.n), 1);
  const every = days <= 7 ? 1 : days <= 30 ? 5 : 15;
  const label = (t) => new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return `
    <div class="st-chart">${buckets.map((b) => `
      <span class="st-col" title="${label(b.t)}: ${b.n} visit${b.n === 1 ? '' : 's'}">
        ${b.n && days <= 30 ? `<em>${b.n}</em>` : ''}
        <i style="height:${b.n ? Math.max(4, (b.n / max) * 100) : 0}%"></i>
      </span>`).join('')}
    </div>
    <div class="st-axis">${buckets.map((b, i) =>
      `<span>${(days - 1 - i) % every === 0 ? label(b.t) : ''}</span>`).join('')}
    </div>`;
}

function render(el, visits, days, projects) {
  const total = visits.length;
  const visitors = new Set(visits.map((v) => v.v)).size;
  const returning = visits.filter((v) => v.n === false).length;
  const engaged = visits.filter((v) => v.d > 0);
  const avg = engaged.length ? engaged.reduce((a, v) => a + v.d, 0) / engaged.length : 0;
  const reachedContact = visits.filter((v) => v.s >= 4).length;
  const notes = visits.reduce((a, v) => a + (v.nt || 0), 0);
  const opened = (v) => (v.p ? v.p.split(',').filter(Boolean) : []);
  const clicked = (v) => (v.l ? v.l.split(',').filter(Boolean) : []);
  const titleOf = Object.fromEntries(projects.map((p) => [p.slug, p.title]));
  const linkName = (l) => {
    const [slug, kind] = l.split(':');
    return titleOf[slug] && kind ? `${titleOf[slug]} · ${kind}` : l;
  };

  const projectCounts = tally(visits.flatMap(opened));
  const projectRows = projects.map((p) => [p.title, (projectCounts.find(([s]) => s === p.slug) || [0, 0])[1]])
    .sort((a, b) => b[1] - a[1]);
  const funnel = SECTIONS.map((name, i) => [name, visits.filter((v) => (v.s || 0) >= i).length]);
  const ofTotal = (n) => `${n} · ${pct(n, total)}%`;

  const cards = [
    ['VISITS', total, `last ${days} days`],
    ['UNIQUE VISITORS', visitors, `${pct(returning, total)}% of visits were return trips`],
    ['AVG TIME ON SITE', duration(avg), 'while the tab was open'],
    ['REACHED CONTACT', `${pct(reachedContact, total)}%`, `${notes} note${notes === 1 ? '' : 's'} stuck on the wall`],
  ];

  el.innerHTML = `
    ${total ? '' : '<p class="st-banner">no visits in this range yet ∗ share the link and check back</p>'}
    <div class="st-cards">${cards.map(([label, value, sub]) => `
      <div class="st-card">
        <span class="st-card-label">${label}</span>
        <span class="st-card-value">${esc(value)}</span>
        <span class="st-card-sub">${esc(sub)}</span>
      </div>`).join('')}
    </div>
    ${panel('VISITS PER DAY', dayChart(visits, days), 'st-wide')}
    <div class="st-grid">
      ${panel('HOW FAR THEY GET', barList(funnel, total, ofTotal))}
      ${panel('FILES OPENED', barList(projectRows, total))}
      ${panel('LINKS CLICKED', barList(tally(visits.flatMap(clicked)).map(([l, n]) => [linkName(l), n]), total))}
      ${panel('WHERE THEY CAME FROM', barList(tally(visits.map((v) => v.r || 'direct / unknown')).slice(0, 8), total, ofTotal))}
      ${panel('DEVICES', barList(tally(visits.map((v) => v.dv || 'unknown')), total, ofTotal))}
      ${panel('TIME ZONES', barList(tally(visits.map((v) => (v.tz || 'unknown').replace(/_/g, ' '))).slice(0, 8), total, ofTotal))}
    </div>
    ${panel('LATEST VISITS', visits.length ? `
      <table class="st-table">
        <thead><tr><th>WHEN</th><th>FROM</th><th>DEVICE</th><th>GOT TO</th><th>TIME</th><th>OPENED</th></tr></thead>
        <tbody>${visits.slice(0, 12).map((v) => `
          <tr>
            <td>${ago(v.t)}</td>
            <td>${esc(v.r || 'direct')}</td>
            <td>${esc(v.dv || '?')}${v.n === false ? ' ∗ back' : ''}</td>
            <td>${SECTIONS[v.s || 0] || '?'}</td>
            <td>${duration(v.d || 0)}</td>
            <td>${esc(opened(v).map((s) => titleOf[s] || s).join(', ') || '—')}</td>
          </tr>`).join('')}
        </tbody>
      </table>` : '<p class="st-empty">nothing yet</p>', 'st-wide')}`;
}

export function createStats({ projects, onOpen, onClose }) {
  const el = document.getElementById('stats');
  const body = document.getElementById('stats-body');
  const status = document.getElementById('stats-status');
  const rangeBtns = el.querySelectorAll('[data-days]');
  let days = 30;
  let loading = false;

  async function load() {
    if (loading) return;
    loading = true;
    status.textContent = 'LOADING…';
    rangeBtns.forEach((b) => b.classList.toggle('active', Number(b.dataset.days) === days));
    try {
      const visits = await fetchVisits(startOfDay(Date.now()) - (days - 1) * DAY);
      render(body, visits, days, projects);
      status.textContent = `UPDATED ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
    } catch (err) {
      status.textContent = err.message === 'not allowed'
        ? 'NOT ALLOWED — CHECK RULES'
        : err.message === 'session expired' || err.message === 'not signed in'
          ? 'SIGNED OUT — SIGN IN AGAIN'
          : 'COULDN’T LOAD — TRY AGAIN';
    } finally {
      loading = false;
    }
  }

  function open() {
    el.classList.remove('hidden');
    onOpen();
    load();
  }
  function close() {
    if (el.classList.contains('hidden')) return;
    el.classList.add('hidden');
    onClose();
  }

  rangeBtns.forEach((b) => b.addEventListener('click', () => { days = Number(b.dataset.days); load(); }));
  document.getElementById('stats-refresh').addEventListener('click', load);
  document.getElementById('stats-close').addEventListener('click', close);
  el.addEventListener('click', (e) => { if (e.target === el) close(); });

  return { open, close };
}
