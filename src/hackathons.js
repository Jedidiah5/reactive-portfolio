import { HACKATHONS, hackathonCount } from './projects.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

function placingClass(p) {
  return /winner/i.test(p || '') ? 'winner' : '';
}

function renderCard(p) {
  const aka = p.aka ? ` <span class="hack-todo">(also ${esc(p.aka)})</span>` : '';
  const team = p.teammates?.length
    ? ` ∗ team: ${p.teammates.map(esc).join(', ')}`
    : '';
  const links = (p.links || []).length
    ? p.links.map((l) =>
      `<a class="paper-btn" href="${esc(l.url)}" target="_blank" rel="noreferrer">${esc(l.label)}</a>`
    ).join('')
    : '<span class="hack-todo">TODO links</span>';
  const stack = (p.stack || [])
    .filter((s) => s && s !== 'TODO')
    .map((s) => `<span>${esc(s)}</span>`)
    .join('') || '<span class="hack-todo">TODO stack</span>';

  return `
    <article class="hack-card" id="${esc(p.slug)}">
      <div class="hack-card-top">
        <h2>${esc(p.title)}${aka}</h2>
        <span class="hack-placing ${placingClass(p.placing)}">${esc(p.placing || 'Built')}</span>
      </div>
      <p class="hack-meta">${esc(p.event || '')} ∗ ${esc(p.dateLabel || p.date || '')}${team}</p>
      <p class="hack-built">${esc(p.built || p.goal || '')}</p>
      <div class="hack-stack">${stack}</div>
      <div class="hack-links">${links}</div>
    </article>`;
}

const list = document.getElementById('hack-list');
list.innerHTML = HACKATHONS.map(renderCard).join('');

const sub = document.querySelector('.hack-sub');
if (sub) {
  sub.textContent = `${hackathonCount()} builds · newest first · winners, solo sprints, and team ships.`;
}
