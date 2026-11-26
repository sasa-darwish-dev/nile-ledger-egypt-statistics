import { DATA, indicators, title, topicOf } from './state.js';
import { about } from './views/about.js';
import { bindCompare, compare } from './views/compare.js';
import { bindIndicator, indicator } from './views/indicator.js';
import { bindOverview, overview } from './views/overview.js';
import { directory } from './views/shared.js';
import { topicsPage } from './views/topics.js';

const app = document.querySelector('#app');
const mark = `<svg viewBox="0 0 48 48" aria-hidden="true">
  <rect width="48" height="48" rx="12" fill="currentColor" />
  <path d="M12 34V14l12 20V14M31 14h6M31 24h6M31 34h6" fill="none" stroke="var(--paper)" stroke-width="3" />
  <path d="M9 40q15-5 30 0" fill="none" stroke="#d4b46f" stroke-width="2" />
</svg>`;

function pageFor(route) {
  const [kind, ...parts] = route.split('/').filter(Boolean);

  if (kind === 'indicator') {
    return { body: indicator(parts[0]), bind: (root) => bindIndicator(root, parts[0]) };
  }
  if (kind === 'compare') {
    const first = parts[0] || 'NY.GDP.MKTP.CD';
    const second = parts[1] || 'SP.POP.TOTL';
    return { body: compare(first, second), bind: (root) => bindCompare(root, first, second) };
  }
  if (kind === 'topics') return { body: topicsPage() };
  if (kind === 'about') return { body: about() };
  return { body: overview(), bind: bindOverview };
}

function header(activePage) {
  return `<header class="site-header">
    <div class="header-inner">
      <a class="brand" href="#/" aria-label="Nile Ledger home">
        ${mark}<span>Nile <b>Ledger</b><small>EGYPT IN FIGURES</small></span>
      </a>
      <nav aria-label="Main navigation">
        <a class="${activePage === 'overview' ? 'active' : ''}" href="#/">Overview</a>
        <a class="${activePage === 'topics' ? 'active' : ''}" href="#/topics">Topics</a>
        <a class="${activePage === 'compare' ? 'active' : ''}" href="#/compare">Compare</a>
        <a class="${activePage === 'about' ? 'active' : ''}" href="#/about">About & sources</a>
      </nav>
      <div class="header-tools">
        <label class="search-box">
          <span class="search-icon" aria-hidden="true">⌕</span>
          <input id="search" type="search" placeholder="Find an indicator" aria-label="Search indicators" autocomplete="off">
          <kbd>/</kbd>
        </label>
        <div id="search-results" class="search-results" hidden></div>
        <button class="theme-button" id="theme" aria-label="Switch colour theme" title="Switch colour theme">◐</button>
      </div>
    </div>
  </header>`;
}

function footer() {
  return `<footer class="site-footer">
    <a href="#/" class="footer-brand">Nile Ledger</a>
    <span>Egypt in figures · World Bank WDI · Data retrieved ${DATA.retrieved}</span>
    <a href="#/about">Method & sources ↗</a>
  </footer>`;
}

function render() {
  const route = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
  const activePage = route.split('/')[0] || 'overview';
  const view = pageFor(route);

  app.innerHTML = `${header(activePage)}<main id="content" class="content">${view.body}</main>${footer()}`;
  view.bind?.(app);
  bindShell();
  if (activePage === 'overview') bindFilters(app);
}

function bindShell() {
  const input = document.querySelector('#search');
  const results = document.querySelector('#search-results');

  const updateResults = () => {
    const query = input.value.trim().toLowerCase();
    if (!query) {
      results.hidden = true;
      results.innerHTML = '';
      return;
    }

    const matches = indicators.filter((item) => (
      `${title(item)} ${item.name} ${item.code} ${topicOf(item)}`.toLowerCase().includes(query)
    )).slice(0, 7);
    results.innerHTML = matches.length
      ? matches.map((item) => `<a href="#/indicator/${item.code}">
          <span>${title(item)}</span><small>${topicOf(item)} · ${item.code}</small>
        </a>`).join('')
      : '<span class="no-results">No indicators found</span>';
    results.hidden = false;
  };

  input.addEventListener('input', updateResults);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      input.value = '';
      updateResults();
      input.blur();
    }
    if (event.key === 'Enter' && !results.hidden) {
      const firstResult = results.querySelector('a');
      if (firstResult) location.hash = firstResult.hash;
    }
  });

  document.addEventListener('pointerdown', (event) => {
    if (!event.target.closest('.header-tools')) results.hidden = true;
  }, { once: true });
  document.addEventListener('keydown', (event) => {
    const isTextField = ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName);
    if (event.key === '/' && !isTextField) {
      event.preventDefault();
      input.focus();
    }
  });

  const themeButton = document.querySelector('#theme');
  let dark = false;
  try {
    dark = localStorage.getItem('nile-theme') === 'dark';
  } catch {
    // A browser that blocks local storage still gets a working in-page toggle.
  }
  const applyTheme = () => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    themeButton.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    themeButton.title = dark ? 'Switch to light theme' : 'Switch to dark theme';
  };
  applyTheme();
  themeButton.onclick = () => {
    dark = !dark;
    applyTheme();
    try {
      localStorage.setItem('nile-theme', dark ? 'dark' : 'light');
    } catch {
      // The current page theme remains available without persistent storage.
    }
  };
}

function bindFilters(root) {
  const results = root.querySelector('#directory-results');
  if (!results) return;

  const buttons = [...root.querySelectorAll('.chip')];
  const search = document.querySelector('#search');
  let selectedTopic = 'All';

  for (const button of buttons) {
    button.setAttribute('aria-pressed', String(button.classList.contains('selected')));
    button.onclick = () => {
      selectedTopic = button.dataset.topic;
      for (const choice of buttons) {
        choice.classList.toggle('selected', choice === button);
        choice.setAttribute('aria-pressed', String(choice === button));
      }
      refreshDirectory();
    };
  }

  function refreshDirectory() {
    const query = search.value.trim().toLowerCase();
    const matches = indicators.filter((item) => {
      const matchesTopic = selectedTopic === 'All' || topicOf(item) === selectedTopic;
      const matchesSearch = `${title(item)} ${item.name} ${item.code}`.toLowerCase().includes(query);
      return matchesTopic && matchesSearch;
    });
    results.innerHTML = matches.length
      ? directory(matches)
      : '<p class="empty-state">No indicators match this search and topic. Try another term or clear the topic filter.</p>';
  }

  search.addEventListener('input', refreshDirectory);
}

window.addEventListener('hashchange', render);
if (location.hash) render();
else location.hash = '#/';
